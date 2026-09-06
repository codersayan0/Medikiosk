# MediKiosk backend implementation notes

This package keeps the existing frontend UI and adds the backend/data foundation needed for a live patient mode.

## Local run

Backend:
```powershell
cd backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Frontend:
```powershell
cd frontend
npm install
npm run dev
```

## Environment

Frontend `.env`:
- `VITE_API_URL=http://127.0.0.1:8000`
- `VITE_DATA_MODE=live` for MongoDB-backed patient data
- `VITE_DATA_MODE=demo` to retain the existing mock patient demo
- EmailJS values as shown in `frontend/.env.example`

Backend `.env` should contain MongoDB Atlas URI, database name, JWT secret and frontend URL. Do not commit real secrets.

## Implemented live patient flow

- JWT authentication remains in the existing auth layer.
- Patient final registration uses `/api/auth/patient-register` after email OTP verification in the current frontend flow.
- The patient registration endpoint creates an active, email-verified patient account and a single `patient_profiles` document.
- Patient profile data is loaded by `/api/patient/profile` using the authenticated JWT user id.
- Patient profile updates use `PATCH /api/patient/profile` and never trust a client-supplied user id.
- Email and mobile uniqueness are protected in the `users` collection.
- Patient profile ownership is protected by JWT + patient role checks.
- Live patient data never falls back to `MOCK_PATIENT_RECORD`; dashboard shell shows an error state instead.
- Demo mode still uses the original mock record.

## Storage rule

Original PDFs/images/X-rays are not stored by the new patient profile backend. The current implementation is prepared for future temporary-file processing and text/summary persistence.

## Production

Render can run the backend using the included `render.yaml`. Vercel should provide the production `VITE_API_URL`.
