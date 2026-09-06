from pymongo import MongoClient
from pymongo.errors import PyMongoError

from .config import settings


client = MongoClient(
    settings.mongodb_uri,
    serverSelectionTimeoutMS=5000,
)

db = client[settings.mongodb_database]


def get_database():
    return db


def initialize_database():
    users = db.users

    # One email = one account
    users.create_index(
        [("email", 1)],
        unique=True,
        name="unique_user_email",
    )

    # One phone number = one account
    users.create_index(
        [("phone_number", 1)],
        unique=True,
        name="unique_user_phone",
    )

    users.create_index(
        [("patient_uid", 1)],
        unique=True,
        sparse=True,
        name="unique_patient_uid",
    )

    db.patient_profiles.create_index(
        [("user_id", 1)],
        unique=True,
        name="unique_patient_profile_user",
    )

db.appointments.create_index(
    [
        ("patient_id", 1),
        ("appointment_date", 1),
    ],
    name="appointments_patient_date",
)

db.appointments.create_index(
    [
        ("doctor_id", 1),
        ("appointment_date", 1),
        ("appointment_time", 1),
    ],
    name="appointments_doctor_slot",
)

db.appointments.create_index(
    [
        ("status", 1),
    ],
    name="appointments_status",
)

db.medical_records.create_index(
    [
        ("patient_id", 1),
        ("record_date", -1),
    ],
    name="medical_records_patient_date",
)

db.medical_records.create_index(
    [
        ("doctor_id", 1),
        ("patient_id", 1),
    ],
    name="medical_records_doctor_patient",
)

db.medical_records.create_index(
    [
        ("record_type", 1),
    ],
    name="medical_records_type",
)

def check_database_connection() -> bool:
    try:
        client.admin.command("ping")
        return True
    except PyMongoError:
        return False