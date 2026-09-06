import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({
  role,
  children,
}: {
  role: "patient" | "doctor" | "admin";
  children: ReactNode;
}) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to={`/${role}/login`} replace />;
  }
  if (user.role !== role) {
    return <Navigate to={`/${role}/login`} replace />;
  }
  return <>{children}</>;
}
