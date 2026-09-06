import { useEffect, useState } from "react";
import type { Appointment } from "../../types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface RescheduleAppointmentModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (appointment: Appointment, date: string, time: string) => void;
}

/** Captures a new date/time for an appointment. Built on the shared Modal so it matches every other confirmation dialog in the admin dashboard. */
export function RescheduleAppointmentModal({ appointment, onClose, onConfirm }: RescheduleAppointmentModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (appointment) {
      setDate(appointment.date);
      setTime(toTimeInputValue(appointment.time));
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleConfirm = () => {
    if (!date || !time) return;
    onConfirm(appointment, date, toDisplayTime(time));
  };

  return (
    <Modal
      isOpen={Boolean(appointment)}
      onClose={onClose}
      title="Reschedule Appointment"
      description={`Choose a new date and time for ${appointment.patientName}'s appointment with ${appointment.doctorName}.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!date || !time}>
            Save New Slot
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="New Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Input label="New Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>
    </Modal>
  );
}

function toTimeInputValue(display: string): string {
  const match = display.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  const [, h, m, meridiem] = match;
  let hour = parseInt(h, 10);
  if (meridiem.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${m}`;
}

function toDisplayTime(value: string): string {
  const [hStr, mStr] = value.split(":");
  let hour = parseInt(hStr, 10);
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${mStr} ${meridiem}`;
}
