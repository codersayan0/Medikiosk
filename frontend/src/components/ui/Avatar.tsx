import { User } from "lucide-react";
import { cn } from "../../utils/cn";

interface AvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("");
}

/** Circular avatar. Falls back to a person icon when no name is provided. */
export function Avatar({ name, size = 40, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-mx-purple-soft font-display font-bold text-mx-purple",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      role="img"
      aria-label={name ? `${name} avatar` : "User avatar"}
    >
      {name ? getInitials(name) : <User size={size * 0.5} aria-hidden="true" />}
    </div>
  );
}
