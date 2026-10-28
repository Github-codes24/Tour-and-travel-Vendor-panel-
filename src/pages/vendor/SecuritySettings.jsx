import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  Phone,
  BadgeCheck,
  AlertCircle,
  Bell,
  Monitor,
  LogOut,
  UserX,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  Smartphone,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* API stubs – replace the bodies with real backend calls              */
/* ------------------------------------------------------------------ */
const api = {
  changePassword: async (payload) => {
    // POST /vendor/auth/change-password  { currentPassword, newPassword }
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true };
  },
  sendVerification: async (type) => {
    // POST /vendor/auth/send-verification  { type: "email" | "mobile" }
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true };
  },
  verifyCode: async ({ type, code }) => {
    // POST /vendor/auth/verify-code { type, code }
    // Demo only: replace with real backend OTP validation.
    await new Promise((r) => setTimeout(r, 500));
    return { ok: type === "mobile" && /^\d{6}$/.test(code) };
  },
  updateTwoFactor: async (enabled) => {
    // PUT /vendor/auth/two-factor { enabled }
    // Demo only: persist this setting through your backend in production.
    await new Promise((r) => setTimeout(r, 400));
    return { ok: true, enabled };
  },
  saveNotifications: async (prefs) => {
    // PUT /vendor/settings/notifications
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true };
  },
  logoutCurrent: async () => {
    // POST /vendor/auth/logout
    await new Promise((r) => setTimeout(r, 300));
  },
  logoutAll: async () => {
    // POST /vendor/auth/logout-all
    await new Promise((r) => setTimeout(r, 500));
  },
  submitAccountRequest: async (type, reason) => {
    // POST /vendor/account/requests  { type: "deactivate" | "delete", reason }
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true };
  },
};

/* Demo data – replace with data from your auth context / API */
const ACCOUNT = {
  email: "vendor@travelpartner.com",
  emailVerified: true,
  mobile: "+91 98765 43210",
  mobileVerified: false,
};

const SESSION = {
  device: "Chrome on Windows",
  location: "Nagpur, India",
  lastLogin: "2026-10-27T09:15:00",
};

const NOTIFICATION_ITEMS = [
  { key: "booking", label: "Booking updates", desc: "New bookings, cancellations and changes." },
  { key: "payment", label: "Payment and payout updates", desc: "Payments received and payouts processed." },
  { key: "package", label: "Package approval updates", desc: "When a package is approved or needs changes." },
  { key: "support", label: "Support ticket replies", desc: "Replies from the support team on your tickets." },
  { key: "email", label: "Email notifications", desc: "Also send the selected updates to your email." },
];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */
function Card({ icon: Icon, title, subtitle, children, tone = "default" }) {
  const iconTone =
    tone === "danger" ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-600";
  return (
    <section
      className={`rounded-xl border bg-white shadow-sm ${
        tone === "danger" ? "border-red-200" : "border-gray-200"
      }`}
    >
      <header className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
        <span className={`mt-0.5 rounded-lg p-2 ${iconTone}`}>
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-violet-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function StatusBadge({ verified }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
      <BadgeCheck size={14} /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <AlertCircle size={14} /> Not verified
    </span>
  );
}

function PasswordField({ id, label, value, onChange, error, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border px-3.5 py-2.5 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:ring-red-200"
              : "border-gray-300 focus:border-violet-500 focus:ring-violet-100"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        isError ? "bg-red-600" : "bg-gray-900"
      }`}
    >
      {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {toast.message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Password & Security                                              */
/* ------------------------------------------------------------------ */
const PASSWORD_RULES = [
  { id: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "num", label: "One number", test: (p) => /\d/.test(p) },
  { id: "sym", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordSecurityCard({ notify }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [account, setAccount] = useState(ACCOUNT);
  const [verificationType, setVerificationType] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const passed = useMemo(
    () => PASSWORD_RULES.filter((r) => r.test(form.next)).length,
    [form.next]
  );
  const strength = passed <= 2 ? "Weak" : passed <= 4 ? "Okay" : "Strong";
  const strengthColor = passed <= 2 ? "bg-red-500" : passed <= 4 ? "bg-amber-500" : "bg-green-500";

  const validate = () => {
    const e = {};
    if (!form.current) e.current = "Enter your current password.";
    if (passed < PASSWORD_RULES.length) e.next = "New password doesn't meet all the rules below.";
    if (form.next && form.next === form.current)
      e.next = "New password must be different from the current one.";
    if (form.confirm !== form.next) e.confirm = "Passwords don't match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await api.changePassword({ currentPassword: form.current, newPassword: form.next });
      setForm({ current: "", next: "", confirm: "" });
      setErrors({});
      notify("Password changed");
    } catch {
      setErrors({ current: "Current password is incorrect." });
    } finally {
      setSaving(false);
    }
  };

  const verify = async (type) => {
    setVerifying(type);
    try {
      await api.sendVerification(type);
      if (type === "mobile") {
        setOtp("");
        setVerificationType("mobile");
      } else {
        notify("Verification link sent to your email. Open the link in your inbox.");
      }
    } catch {
      notify("Couldn't send verification. Try again.", "error");
    } finally {
      setVerifying(null);
    }
  };

  const submitOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      notify("Enter the 6-digit code sent to your mobile.", "error");
      return;
    }
    setOtpSubmitting(true);
    try {
      const result = await api.verifyCode({ type: verificationType, code: otp });
      if (!result?.ok) throw new Error("Invalid code");
      setAccount((current) => ({ ...current, mobileVerified: true }));
      setVerificationType(null);
      setOtp("");
      notify("Mobile number verified successfully.");
    } catch {
      notify("Invalid or expired code. Please try again.", "error");
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleTwoFactorChange = async (enabled) => {
    if (enabled && !account.mobileVerified) {
      notify("Verify your mobile number first to enable two-factor authentication.", "error");
      verify("mobile");
      return;
    }
    setTwoFactorSaving(true);
    try {
      await api.updateTwoFactor(enabled);
      setTwoFactorEnabled(enabled);
      notify(enabled ? "Two-factor authentication enabled." : "Two-factor authentication disabled.");
    } catch {
      notify("Couldn't update two-factor authentication. Try again.", "error");
    } finally {
      setTwoFactorSaving(false);
    }
  };

  const contactRows = [
    { type: "email", icon: Mail, label: "Email", value: account.email, verified: account.emailVerified },
    { type: "mobile", icon: Phone, label: "Mobile", value: account.mobile, verified: account.mobileVerified },
  ];

  return (
    <Card
      icon={Lock}
      title="Password & Security"
      subtitle="Change your password and check your contact verification."
    >
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
        <PasswordField
          id="current-password"
          label="Current password"
          value={form.current}
          onChange={set("current")}
          error={errors.current}
          autoComplete="current-password"
        />
        <PasswordField
          id="new-password"
          label="New password"
          value={form.next}
          onChange={set("next")}
          error={errors.next}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          value={form.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
          autoComplete="new-password"
        />

        {form.next && (
          <div className="md:col-span-3">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full transition-all ${strengthColor}`}
                  style={{ width: `${(passed / PASSWORD_RULES.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{strength}</span>
            </div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {PASSWORD_RULES.map((r) => {
                const ok = r.test(form.next);
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-1.5 text-xs ${ok ? "text-green-700" : "text-gray-500"}`}
                  >
                    {ok ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="md:col-span-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {saving ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>

      <hr className="my-6 border-gray-100" />

   
<h3 className="mb-4 text-base font-semibold text-gray-900">
  Account security
</h3>

<ul className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
  {contactRows.map((row) => (
    <li
      key={row.type}
      className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
          <row.icon size={19} strokeWidth={1.8} className="text-gray-500" />
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium text-gray-500">
            {row.label}
          </p>
          <p className="break-all text-sm font-semibold text-gray-900 sm:text-[15px]">
            {row.value}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pl-[52px] sm:pl-0">
        <StatusBadge verified={row.verified} />

        {!row.verified && (
          <button
            type="button"
            onClick={() => verify(row.type)}
            disabled={verifying === row.type}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-violet-600 px-3.5 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying === row.type ? "Sending..." : "Verify now"}
          </button>
        )}
      </div>
    </li>
  ))}

  <li className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <ShieldCheck size={19} strokeWidth={1.8} className="text-gray-500" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">
          Two-factor authentication
        </p>
        <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
          Extra sign-in protection with a one-time code.
        </p>
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-3 pl-[52px] sm:pl-0">
      <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${twoFactorEnabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
        {twoFactorSaving ? "Updating…" : twoFactorEnabled ? "Enabled" : "Disabled"}
      </span>
      <Toggle
        checked={twoFactorEnabled}
        onChange={handleTwoFactorChange}
        disabled={twoFactorSaving}
        label="Two-factor authentication"
      />
    </div>
  </li>
</ul>

      <Modal
        open={verificationType === "mobile"}
        onClose={() => { setVerificationType(null); setOtp(""); }}
        title="Verify mobile number"
      >
        <form onSubmit={submitOtp} className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 ring-8 ring-violet-50/60">
              <ShieldCheck size={27} strokeWidth={1.8} className="text-violet-700" />
            </div>
            <p className="max-w-sm text-sm leading-6 text-gray-600">
              Enter the 6-digit verification code sent to
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-2">
              <Phone size={15} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-800">{account.mobile}</span>
            </div>
          </div>

          <div>
            <label htmlFor="mobile-otp" className="mb-2 block text-sm font-semibold text-gray-700">
              Verification code
            </label>
            <input
              id="mobile-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              aria-describedby="mobile-otp-help"
              className="h-14 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 text-center font-mono text-2xl font-semibold tracking-[0.55em] text-gray-900 placeholder:tracking-[0.45em] placeholder:text-gray-300 focus:border-violet-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100"
              required
            />
            <p id="mobile-otp-help" className="mt-2 text-xs text-gray-500">
              Enter all 6 digits. Do not share this code with anyone.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => { setVerificationType(null); setOtp(""); }}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={otpSubmitting || otp.length !== 6}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-violet-300 disabled:shadow-none"
            >
              {otpSubmitting ? "Verifying…" : "Verify code"}
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Notifications                                                    */
/* ------------------------------------------------------------------ */
function NotificationsCard({ notify }) {
  const initial = { booking: true, payment: true, package: true, support: true, email: true };
  const [saved, setSaved] = useState(initial);
  const [prefs, setPrefs] = useState(initial);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(saved) !== JSON.stringify(prefs);

  const save = async () => {
    setSaving(true);
    try {
      await api.saveNotifications(prefs);
      setSaved(prefs);
      notify("Notification preferences saved");
    } catch {
      notify("Couldn't save preferences. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      icon={Bell}
      title="Notifications"
      subtitle="Choose which updates you want to receive."
    >
      <ul className="divide-y divide-gray-100">
        {NOTIFICATION_ITEMS.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <Toggle
              checked={prefs[item.key]}
              onChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))}
              label={item.label}
            />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
        {dirty && (
          <button
            onClick={() => setPrefs(saved)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Discard changes
          </button>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Login Sessions                                                   */
/* ------------------------------------------------------------------ */
function SessionsCard({ notify }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const lastLogin = new Date(SESSION.lastLogin).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const endSession = async (scope) => {
    setBusy(scope);
    try {
      if (scope === "all") await api.logoutAll();
      else await api.logoutCurrent();
      // TODO: clear your auth token / context here
      navigate("/login");
    } catch {
      notify("Couldn't log out. Try again.", "error");
      setBusy(null);
    }
  };

  return (
    <Card
      icon={Monitor}
      title="Login Sessions"
      subtitle="See where you're signed in and end sessions you don't recognise."
    >
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-gray-100 p-2 text-gray-600">
            <Smartphone size={18} />
          </span>
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
              {SESSION.device}
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                This device
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {SESSION.location} · Last login {lastLogin}
            </p>
          </div>
        </div>
        <button
          onClick={() => endSession("current")}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <LogOut size={16} />
          {busy === "current" ? "Logging out…" : "Log out"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Signed in somewhere else? End every active session at once.
        </p>
        <button
          onClick={() => setConfirmAll(true)}
          disabled={busy !== null}
          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
        >
          Log out from all devices
        </button>
      </div>

      <Modal open={confirmAll} onClose={() => setConfirmAll(false)} title="Log out from all devices?">
        <p className="text-sm text-gray-600">
          You'll be signed out everywhere, including this device, and will need to log in again.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setConfirmAll(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => endSession("all")}
            disabled={busy === "all"}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {busy === "all" ? "Logging out…" : "Log out everywhere"}
          </button>
        </div>
      </Modal>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Account Management                                               */
/* ------------------------------------------------------------------ */
const REQUESTS = {
  deactivate: {
    icon: UserX,
    title: "Deactivate account",
    desc: "Hide your listings and pause bookings. You can ask to reactivate later.",
    modalTitle: "Request account deactivation",
    warning:
      "Your packages will be hidden from customers. Confirmed trips must still be completed.",
    cta: "Submit deactivation request",
    needsPhrase: false,
  },
  delete: {
    icon: Trash2,
    title: "Delete account",
    desc: "Permanently remove your vendor account and data after review.",
    modalTitle: "Request account deletion",
    warning:
      "This can't be undone once approved. Pending payouts and active bookings are settled before deletion.",
    cta: "Submit deletion request",
    needsPhrase: true,
  },
};

function AccountManagementCard({ notify }) {
  const [active, setActive] = useState(null); // "deactivate" | "delete" | null
  const [reason, setReason] = useState("");
  const [phrase, setPhrase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState({});

  const cfg = active ? REQUESTS[active] : null;
  const canSubmit = cfg && (!cfg.needsPhrase || phrase === "DELETE");

  const close = () => {
    setActive(null);
    setReason("");
    setPhrase("");
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.submitAccountRequest(active, reason.trim());
      setSubmitted((s) => ({ ...s, [active]: true }));
      notify("Request submitted. Our team will contact you.");
      close();
    } catch {
      notify("Couldn't submit the request. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      icon={UserX}
      tone="danger"
      title="Account Management"
      subtitle="These requests are reviewed by our team before anything changes."
    >
      <ul className="divide-y divide-gray-100">
        {Object.entries(REQUESTS).map(([key, r]) => (
          <li key={key} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <r.icon size={18} className="mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{r.title}</p>
                <p className="max-w-md text-xs text-gray-500">{r.desc}</p>
              </div>
            </div>
            {submitted[key] ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <AlertCircle size={14} /> Request pending
              </span>
            ) : (
              <button
                onClick={() => setActive(key)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {key === "delete" ? "Request deletion" : "Request deactivation"}
              </button>
            )}
          </li>
        ))}
      </ul>

      <Modal open={!!cfg} onClose={close} title={cfg?.modalTitle}>
        {cfg && (
          <>
            <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{cfg.warning}</p>
            </div>

            <label htmlFor="reason" className="mb-1.5 mt-4 block text-sm font-medium text-gray-700">
              Reason (optional)
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
              placeholder="Tell us why you're leaving"
            />

            {cfg.needsPhrase && (
              <>
                <label htmlFor="phrase" className="mb-1.5 mt-4 block text-sm font-medium text-gray-700">
                  Type <span className="font-semibold">DELETE</span> to confirm
                </label>
                <input
                  id="phrase"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={close}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting…" : cfg.cta}
              </button>
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function SecuritySettings() {
  const [toast, setToast] = useState(null);
  const notify = (message, type = "success") => setToast({ message, type });

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Security & Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your password, notifications, sessions and account.
        </p>
      </div>

      <PasswordSecurityCard notify={notify} />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <NotificationsCard notify={notify} />
        <SessionsCard notify={notify} />
      </div>

      <AccountManagementCard notify={notify} />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}