import type { Metadata } from "next";

import AuthShell from "../components/auth/AuthShell";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="New password"
      title="Set a new password"
      description="Choose a strong password for your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}