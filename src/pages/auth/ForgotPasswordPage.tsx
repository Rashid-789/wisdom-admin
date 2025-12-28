import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import AuthSplitLayout from "./components/AuthSplitLayout";
import AuthCard from "./components/AuthCard";
import { Button, Input } from "../../app/shared";
import { isValidEmail } from "./utils/auth.utils";
import { useAdminAuth } from "../../auth/useAdminAuth";

export default function ForgotPasswordPage() {
  const { sendReset } = useAdminAuth();

  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const canSubmit = isValidEmail(email);

  return (
    <AuthSplitLayout>
      <AuthCard title="Reset password" subtitle="We’ll send a reset link to your email">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;

            setLoading(true);
            try {
              await sendReset(email);
              toast.success("Reset link sent ✅");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
              toast.error(err?.message ?? "Failed to send reset link");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@domain.com"
            autoComplete="email"
          />

          <Button type="submit" className="w-full" isLoading={loading} disabled={!canSubmit}>
            Send reset link
          </Button>

          <div className="flex justify-center">
            <Link to="/login" className="text-sm font-medium text-slate-900 hover:underline">
              Back to login
            </Link>
          </div>
        </form>
      </AuthCard>
    </AuthSplitLayout>
  );
}

