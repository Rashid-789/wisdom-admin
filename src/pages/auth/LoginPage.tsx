import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import AuthSplitLayout from "./components/AuthSplitLayout";
import AuthCard from "./components/AuthCard";
import { Button, Input } from "../../app/shared";
import { isValidEmail } from "./utils/auth.utils";
import { useAdminAuth } from "../../auth/useAdminAuth";

export default function LoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const next = params.get("next") || "/admin/dashboard";

  const canSubmit = isValidEmail(email) && password.length >= 6;

  return (
    <AuthSplitLayout>
      <AuthCard title="Admin Sign in" subtitle="Login to access the admin panel">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;

            setLoading(true);
            try {
              await login({ email, password });
              navigate(next, { replace: true });
            } catch {
              // auth provider handles toast + session state
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

          <div className="relative">
            <Input
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type={show ? "text" : "password"}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-[38px] rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm font-medium text-slate-900 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={loading} disabled={!canSubmit}>
            Sign in
          </Button>

        </form>
      </AuthCard>
    </AuthSplitLayout>
  );
}

