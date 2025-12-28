import React from "react";

export default function AuthSplitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left (branding) */}
        <div className="hidden lg:flex flex-col justify-center px-10">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Wisdom Admin logo"
              className="h-20 w-20 rounded-2xl object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            <div>
              <p className="text-xl font-bold text-slate-900">Wisdom Admin</p>
              <p className="text-l text-slate-500">Control Center</p>
            </div>
          </div>
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Manage your platform
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Users management (students / teachers / admins)</li>
              <li>• Content studio (courses, lectures, exercises)</li>
              <li>• Live classes, books, payments, settings</li>
            </ul>
          </div>
        </div>

        {/* Right (form) */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
