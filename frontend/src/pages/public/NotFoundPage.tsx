import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Logo size={40} withWordmark={false} />
      <Compass size={32} className="mt-5 text-mx-ink-muted" aria-hidden="true" />
      <h1 className="font-display mt-4 text-2xl font-bold text-mx-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-mx-ink-muted">
        The page you're looking for doesn't exist yet, or the link may be out of date.
      </p>
      <Link to="/" className="mt-5">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
