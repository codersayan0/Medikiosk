import { Headset } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface DoctorSupportCardProps {
  onContactSupport?: () => void;
}

/** "Need Help?" / Contact Support card — right sidebar, Doctor Registration flow. */
export function DoctorSupportCard({ onContactSupport }: DoctorSupportCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-blue-soft text-mx-blue">
          <Headset size={15} aria-hidden="true" />
        </span>
        <h3 className="font-display text-sm font-bold text-mx-ink">Need Help?</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-mx-ink-muted">
        Our support team is here to help you at any step of the registration.
      </p>
      <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={onContactSupport}>
        Contact Support
      </Button>
    </Card>
  );
}
