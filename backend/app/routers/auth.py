from datetime import datetime, timezone
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError

from ..database import get_database
from ..models.user import (
    PatientRegisterRequest,
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    OtpRequest,
    OtpVerify,
    OtpSendResponse,
)
from ..utils.phone import normalize_phone
from ..utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from ..utils.otp import (
    generate_otp,
    otp_expiry,
    MAX_ATTEMPTS,
    RESEND_COOLDOWN_SECONDS,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ALLOWED_ROLES = {"patient", "doctor", "admin"}


def _normalize_registration(user, role: str | None = None):
    email = user.email.lower().strip()

    try:
        phone_number = normalize_phone(user.phone_number)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid mobile number.",
        )

    selected_role = (role or user.role).lower().strip()

    if selected_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Invalid user role.",
        )

    return email, phone_number, selected_role


def _check_duplicate_identity(
    db,
    email: str,
    phone_number: str,
    ignore_user_id=None,
):
    email_query = {"email": email}
    phone_query = {"phone_number": phone_number}

    if ignore_user_id is not None:
        email_query["_id"] = {"$ne": ignore_user_id}
        phone_query["_id"] = {"$ne": ignore_user_id}

    if db.users.find_one(email_query):
        raise HTTPException(
            status_code=409,
            detail="This email is already registered.",
        )

    if db.users.find_one(phone_query):
        raise HTTPException(
            status_code=409,
            detail="This mobile number is already registered.",
        )


def _user_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        full_name=user["full_name"],
        email=user["email"],
        phone_number=user["phone_number"],
        role=user["role"],
        created_at=user["created_at"],
        patient_uid=user.get("patient_uid"),
    )


def _new_patient_uid() -> str:
    return f"MK-{uuid4().hex[:12].upper()}"


def _to_utc_datetime(value):
    """
    Normalize MongoDB datetime values so all OTP comparisons
    use timezone-aware UTC datetimes.
    """
    if value is None or not isinstance(value, datetime):
        return None

    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(user: UserCreate):
    """
    Generic registration for patient, doctor and admin accounts.

    Creates the account in pending state. Email verification is completed
    through /send-otp followed by /verify-otp.
    """
    db = get_database()
    email, phone_number, role = _normalize_registration(user)

    _check_duplicate_identity(
        db,
        email,
        phone_number,
    )

    now = datetime.now(timezone.utc)

    user_document = {
        "full_name": user.full_name.strip(),
        "email": email,
        "phone_number": phone_number,
        "password_hash": hash_password(user.password),
        "role": role,
        "email_verified": False,
        "phone_verified": False,
        "account_status": "pending",
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = db.users.insert_one(user_document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail=(
                "An account already exists with this email "
                "or mobile number."
            ),
        )

    user_document["_id"] = result.inserted_id

    return _user_response(user_document)


@router.post(
    "/patient-register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def patient_register(payload: PatientRegisterRequest):
    """
    Final patient registration endpoint.

    A pending patient registration can be safely retried. Active accounts
    are never overwritten. Patient-specific registration data including
    interview answers, extracted document text and registration AI summary
    are stored in patient_profiles.
    """
    db = get_database()

    email, phone_number, _ = _normalize_registration(
        payload,
        "patient",
    )

    email_user = db.users.find_one({"email": email})
    phone_user = db.users.find_one({"phone_number": phone_number})

    if (
        email_user
        and phone_user
        and email_user["_id"] != phone_user["_id"]
    ):
        raise HTTPException(
            status_code=409,
            detail=(
                "This email and mobile number belong "
                "to different accounts."
            ),
        )

    existing = email_user or phone_user

    if existing and existing.get("account_status") == "active":
        raise HTTPException(
            status_code=409,
            detail=(
                "An active account already exists with this "
                "email or mobile number."
            ),
        )

    now = datetime.now(timezone.utc)

    patient_uid = existing.get("patient_uid") if existing else None

    if not patient_uid:
        patient_uid = _new_patient_uid()

    full_name = payload.full_name.strip()
    name_parts = full_name.split(" ", 1)

    user_fields = {
        "full_name": full_name,
        "email": email,
        "phone_number": phone_number,
        "password_hash": hash_password(payload.password),
        "role": "patient",
        "email_verified": True,
        "phone_verified": False,
        "account_status": "active",
        "patient_uid": patient_uid,
        "updated_at": now,
    }

    profile_document = {
        "user_id": "",
        "first_name": name_parts[0] if name_parts else "",
        "last_name": name_parts[1] if len(name_parts) > 1 else "",
        "dob": payload.dob.strip(),
        "gender": payload.gender.strip(),
        "phone_number": phone_number,
        "alternate_phone": payload.alternate_phone.strip(),
        "country": payload.country.strip(),
        "state": payload.state.strip(),
        "district": payload.district.strip(),
        "zip": payload.zip.strip(),
        "address": payload.address.strip(),
        "emergency_contact": payload.emergency_contact.strip(),
        "registration_ai": (
            payload.registration_ai.model_dump()
            if payload.registration_ai
            else {}
        ),
        "interview_answers": [
            answer.model_dump()
            for answer in payload.interview_answers
        ],
        "registration_documents": [
            document.model_dump()
            for document in payload.registration_documents
        ],
        "created_at": (
            existing.get("created_at", now)
            if existing
            else now
        ),
        "updated_at": now,
        "record": (
            existing.get("record", {})
            if existing
            else {}
        ),
    }

    try:
        if existing:
            # Do not erase previously saved registration data if a retry
            # request does not contain that optional section.
            if not payload.registration_ai:
                profile_document.pop("registration_ai", None)

            if not payload.interview_answers:
                profile_document.pop("interview_answers", None)

            if not payload.registration_documents:
                profile_document.pop(
                    "registration_documents",
                    None,
                )

            db.users.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": user_fields,
                    "$unset": {
                        "otp_hash": "",
                        "otp_expires_at": "",
                        "otp_attempts": "",
                        "otp_last_sent_at": "",
                    },
                },
            )

            user_document = db.users.find_one(
                {"_id": existing["_id"]}
            )

            profile_document["user_id"] = str(
                existing["_id"]
            )

            db.patient_profiles.update_one(
                {"user_id": str(existing["_id"])},
                {"$set": profile_document},
                upsert=True,
            )

        else:
            user_document = {
                **user_fields,
                "created_at": now,
            }

            result = db.users.insert_one(
                user_document
            )

            user_document["_id"] = result.inserted_id
            profile_document["user_id"] = str(
                result.inserted_id
            )

            db.patient_profiles.insert_one(
                profile_document
            )

    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail=(
                "An account already exists with this email "
                "or mobile number."
            ),
        )

    return _user_response(user_document)


@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(user: UserLogin):
    """
    Shared login for patient, doctor and admin.

    Patient: email, mobile or Patient UID
    Doctor/Admin: email or normalized mobile
    """
    db = get_database()
    identifier = user.identifier.strip()

    if not identifier:
        raise HTTPException(
            status_code=400,
            detail="Email, mobile or Patient ID is required.",
        )

    if "@" in identifier:
        query = {
            "email": identifier.lower()
        }
        existing_user = db.users.find_one(query)

    else:
        # First try normalized mobile.
        try:
            phone_number = normalize_phone(
                identifier
            )
            existing_user = db.users.find_one({
                "phone_number": phone_number
            })

        # If it is not a valid phone number, treat it as
        # a Patient UID (MK-XXXXXXXXXXXX).
        except ValueError:
            existing_user = db.users.find_one({
                "patient_uid": identifier
            })

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid email/mobile/Patient ID "
                "or password."
            ),
        )

    if not verify_password(
        user.password,
        existing_user.get("password_hash", ""),
    ):
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid email/mobile/Patient ID "
                "or password."
            ),
        )

    if existing_user.get("account_status") != "active":
        raise HTTPException(
            status_code=403,
            detail=(
                "Please verify your email before logging in."
            ),
        )

    token = create_access_token(
        user_id=str(existing_user["_id"]),
        role=existing_user["role"],
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_user_response(existing_user),
    )


# ============================================================
# SHARED EMAIL OTP
# ============================================================
# Used by Admin and Doctor registration flows.
# Patient currently uses the lightweight EmailJS OTP flow on
# the frontend, but these endpoints remain fully compatible
# with patient users too.


@router.post(
    "/send-otp",
    response_model=OtpSendResponse,
)
async def send_otp(payload: OtpRequest):
    db = get_database()

    try:
        user = db.users.find_one({
            "_id": ObjectId(payload.user_id)
        })
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid user id.",
        )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if user.get("email_verified"):
        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )

    now = datetime.now(timezone.utc)

    last_sent = _to_utc_datetime(
        user.get("otp_last_sent_at")
    )

    if last_sent:
        elapsed = (
            now - last_sent
        ).total_seconds()

        if elapsed < RESEND_COOLDOWN_SECONDS:
            remaining = max(
                1,
                int(
                    RESEND_COOLDOWN_SECONDS
                    - elapsed
                ),
            )

            raise HTTPException(
                status_code=429,
                detail=(
                    f"Please wait {remaining}s "
                    "before requesting another OTP."
                ),
            )

    otp = generate_otp()

    db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "otp_hash": hash_password(otp),
                "otp_expires_at": otp_expiry(),
                "otp_attempts": 0,
                "otp_last_sent_at": now,
            }
        },
    )

    return OtpSendResponse(
        success=True,
        message="OTP generated.",
        otp=otp,
        email=user["email"],
    )


@router.post(
    "/verify-otp",
    response_model=UserResponse,
)
async def verify_otp(payload: OtpVerify):
    db = get_database()

    try:
        user = db.users.find_one({
            "_id": ObjectId(payload.user_id)
        })
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid user id.",
        )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if user.get("email_verified"):
        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )

    otp_hash = user.get("otp_hash")
    raw_expiry = user.get("otp_expires_at")

    if not otp_hash or not raw_expiry:
        raise HTTPException(
            status_code=400,
            detail=(
                "No OTP was requested. "
                "Please request a new one."
            ),
        )

    expires_at = _to_utc_datetime(raw_expiry)

    if expires_at is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid OTP expiry state. "
                "Please request a new OTP."
            ),
        )

    now = datetime.now(timezone.utc)

    if expires_at < now:
        raise HTTPException(
            status_code=400,
            detail=(
                "OTP has expired. "
                "Please request a new one."
            ),
        )

    attempts = int(
        user.get("otp_attempts", 0)
    )

    if attempts >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail=(
                "Too many attempts. "
                "Please request a new OTP."
            ),
        )

    if not verify_password(
        payload.otp.strip(),
        otp_hash,
    ):
        db.users.update_one(
            {"_id": user["_id"]},
            {
                "$inc": {
                    "otp_attempts": 1
                }
            },
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid OTP.",
        )

    db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "email_verified": True,
                "account_status": "active",
                "updated_at": now,
            },
            "$unset": {
                "otp_hash": "",
                "otp_expires_at": "",
                "otp_attempts": "",
                "otp_last_sent_at": "",
            },
        },
    )

    updated = db.users.find_one({
        "_id": user["_id"]
    })

    return _user_response(updated)
