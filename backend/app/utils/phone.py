import re


def normalize_phone(phone: str) -> str:
    phone = phone.strip()

    # Keep only digits
    digits = re.sub(r"\D", "", phone)

    # India-specific normalization
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]

    if len(digits) != 10:
        raise ValueError("Invalid mobile number")

    return digits