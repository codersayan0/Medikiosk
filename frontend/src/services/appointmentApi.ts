import { apiRequest } from "./api";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type ConsultationType =
  | "in_person"
  | "video"
  | "phone";

export interface Appointment {
  id: string;

  patient_id: string;
  doctor_id: string;

  patient_name: string;
  patient_uid?: string | null;

  doctor_name: string;
  doctor_specialization?: string | null;

  appointment_date: string;
  appointment_time: string;

  consultation_type: ConsultationType;

  status: AppointmentStatus;

  reason: string;
  notes?: string | null;

  created_at: string;
  updated_at: string;
}


export interface CreateAppointmentRequest {
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: ConsultationType;
  reason: string;
}


export interface UpdateAppointmentRequest {
  appointment_date?: string;
  appointment_time?: string;
  consultation_type?: ConsultationType;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}


export async function getAppointments(): Promise<
  Appointment[]
> {
  return apiRequest<Appointment[]>(
    "/api/appointments",
    {
      method: "GET",
    }
  );
}


export async function getAppointment(
  appointmentId: string
): Promise<Appointment> {
  return apiRequest<Appointment>(
    `/api/appointments/${appointmentId}`,
    {
      method: "GET",
    }
  );
}


export async function createAppointment(
  data: CreateAppointmentRequest
): Promise<Appointment> {

  return apiRequest<Appointment>(
    "/api/appointments",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}


export async function updateAppointment(
  appointmentId: string,
  data: UpdateAppointmentRequest
): Promise<Appointment> {

  return apiRequest<Appointment>(
    `/api/appointments/${appointmentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}


export async function cancelAppointment(
  appointmentId: string
): Promise<{
  success: boolean;
  message: string;
}> {

  return apiRequest(
    `/api/appointments/${appointmentId}`,
    {
      method: "DELETE",
    }
  );
}