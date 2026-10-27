import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Upload,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import Safar2You from "../../assets/Safar2You.png";
import travelImage from "../../assets/dashboard-travel.jpg";
import {
  createLocalVendorAccount,
  signInLocalVendor,
} from "../../utils/localVendorAuth";

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10";
const labelClass = "text-sm font-medium text-slate-700";

function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  autoComplete,
  ...props
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        className={inputClass}
        name={name}
        type={type}
        value={onChange ? value ?? "" : undefined}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        {...props}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, children, required = true }) {
  return (
    <label className={labelClass}>
      {label}
      <select
        className={`${inputClass} appearance-none`}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
      >
        {children}
      </select>
    </label>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        <Icon size={19} />
      </span>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function UploadField({ label, file, onChange, required = false }) {
  return (
    <label className="block cursor-pointer">
      <span className={labelClass}>{label}</span>
      <span className="mt-1.5 flex min-h-12 items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-600 transition hover:border-violet-400 hover:bg-violet-50/50">
        <Upload size={17} className="shrink-0 text-violet-600" />
        <span className="min-w-0 flex-1 truncate">
          {file?.name || "Choose PDF, JPG or PNG"}
        </span>
        {file && <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />}
      </span>
      <input
        className="sr-only"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        required={required && !file}
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}

function Login({ onOtpNotice }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSigningIn(true);

    try {
      const isAuthenticated = await signInLocalVendor(
        formData.get("email"),
        formData.get("password"),
        formData.get("rememberMe") === "on",
      );

      if (!isAuthenticated) {
        toast.error("Email or password is incorrect. Register a local account first.");
        return;
      }

      toast.success("Signed in successfully.");
      navigate("/vendor", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to sign in with local account.");
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <TextField
        label="Email address"
        name="email"
        type="email"
        defaultValue={location.state?.email || ""}
        placeholder="you@youragency.com"
        autoComplete="email"
      />
      <label className={labelClass}>
        Password
        <span className="relative mt-1.5 block">
          <input
            className={`${inputClass} pr-12`}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-slate-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input name="rememberMe" type="checkbox" className="accent-violet-700" />
          Remember me
        </label>
        <button
          type="button"
          onClick={onOtpNotice}
          className="font-semibold text-violet-700 hover:text-violet-900"
        >
          Forgot password?
        </button>
      </div>
      <button
        type="submit"
        disabled={isSigningIn}
        className="auth-primary-action flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold shadow-lg shadow-violet-700/15 transition focus:outline-none focus:ring-4 focus:ring-violet-500/20"
      >
        {isSigningIn ? "Signing in..." : "Sign in"} <ArrowRight size={17} />
      </button>
      <p className="text-center text-sm text-slate-500">
        New to Safar2You?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="font-semibold text-violet-700 hover:text-violet-900"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}

const steps = [
  { title: "Your details", icon: UserRound },
  { title: "Business & documents", icon: FileCheck2 },
  { title: "Payout details", icon: Wallet },
];

function Registration({ onOtpNotice }) {
  const navigate = useNavigate();
  const stepRef = useRef(null);
  const [step, setStep] = useState(0);
  const [vendorType, setVendorType] = useState("agency");
  const [gstRegistered, setGstRegistered] = useState(false);
  const [hasRegistrationProof, setHasRegistrationProof] = useState(false);
  const [files, setFiles] = useState({});
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function setValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updateFile(key, file) {
    setFiles((current) => ({ ...current, [key]: file }));
  }

  function validateCurrentStep() {
    const fields = stepRef.current?.querySelectorAll(
      "input[required], select[required]",
    );
    for (const field of fields || []) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  function nextStep() {
    if (validateCurrentStep()) setStep((current) => Math.min(current + 1, 2));
  }

  async function submitRegistration(event) {
    event.preventDefault();
    if (!validateCurrentStep()) return;
    setIsSaving(true);

    try {
      await createLocalVendorAccount(values.email, values.password);
      setSubmitted(true);
      toast.success("Local demo account created.");
    } catch (error) {
      toast.error(error.message || "Unable to save local account.");
    } finally {
      setIsSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={34} />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
          Local demo account ready
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Your account is ready
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Your sign-in details are saved in this browser. The vendor application
          has not been sent for review; once a backend is connected, it can be
          submitted for <strong className="text-amber-700">Pending Approval</strong>.
          Payouts must remain disabled until your bank account is verified by
          the payment provider.
        </p>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm leading-5 text-amber-900">
          Demo mode: only your email and a salted password hash are stored in
          this browser. Documents, bank details, OTP verification, and admin
          approval are not saved or processed until a backend is connected.
        </div>
        <button
          type="button"
          onClick={() => navigate("/login", { state: { email: values.email } })}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
        >
          Back to sign in <ArrowRight size={17} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submitRegistration}>
      <div className="mb-7 grid grid-cols-3 gap-2">
        {steps.map(({ title, icon: Icon }, index) => (
          <div key={title} className="min-w-0">
            <div
              className={`mb-2 h-1 rounded-full ${
                index <= step ? "bg-violet-600" : "bg-slate-200"
              }`}
            />
            <div
              className={`flex items-center gap-1.5 text-[11px] font-semibold sm:text-xs ${
                index === step ? "text-violet-800" : "text-slate-400"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span className="truncate">{title}</span>
            </div>
          </div>
        ))}
      </div>

      <div ref={stepRef}>
        {step === 0 && (
          <div className="space-y-5">
            <SectionTitle
              icon={UserRound}
              title="Let’s get to know you"
              description="Start with your contact details and location."
            />
            <TextField label="Full name" name="fullName" value={values.fullName} onChange={setValue} placeholder="Your full name" autoComplete="name" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <TextField label="Email address" name="email" type="email" value={values.email} onChange={setValue} placeholder="you@example.com" autoComplete="email" />
                <button type="button" onClick={onOtpNotice} className="mt-2 text-xs font-semibold text-violet-700 hover:text-violet-900">
                  Send email OTP
                </button>
              </div>
              <div>
                <TextField label="Mobile number" name="phone" type="tel" value={values.phone} onChange={setValue} placeholder="+91 98765 43210" autoComplete="tel" pattern="[+0-9 ()-]{10,16}" />
                <button type="button" onClick={onOtpNotice} className="mt-2 text-xs font-semibold text-violet-700 hover:text-violet-900">
                  Send mobile OTP
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Create password" name="password" type="password" value={values.password} onChange={setValue} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} />
              <SelectField label="Vendor type" name="vendorType" value={vendorType} onChange={(event) => setVendorType(event.target.value)}>
                <option value="agency">Travel Agency</option>
                <option value="individual">Individual Tour Operator</option>
              </SelectField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Address" name="address" value={values.address} onChange={setValue} placeholder="Street address" autoComplete="street-address" />
              <TextField label="City" name="city" value={values.city} onChange={setValue} placeholder="City" autoComplete="address-level2" />
              <TextField label="State" name="state" value={values.state} onChange={setValue} placeholder="State" autoComplete="address-level1" />
              <TextField label="PIN code" name="pin" value={values.pin} onChange={setValue} placeholder="6-digit PIN code" inputMode="numeric" pattern="[0-9]{6}" autoComplete="postal-code" />
            </div>
            <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-500">
              OTP controls are shown for the registration flow. Delivery and verification require a configured OTP provider.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <SectionTitle
              icon={Building2}
              title={vendorType === "agency" ? "Agency details" : "Operator details"}
              description="Tell us about your business and upload applicable documents."
            />
            <TextField
              label={vendorType === "agency" ? "Agency name" : "Business / display name"}
              name="businessName"
              value={values.businessName}
              onChange={setValue}
              placeholder={vendorType === "agency" ? "Your registered agency name" : "Name customers will see"}
            />
            <TextField
              label={vendorType === "agency" ? "Business PAN (if applicable)" : "Individual PAN"}
              name="pan"
              value={values.pan}
              onChange={setValue}
              placeholder="ABCDE1234F"
              required={vendorType === "individual"}
              pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]"
              maxLength={10}
            />
            {vendorType === "agency" && (
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input type="checkbox" checked={hasRegistrationProof} onChange={(event) => setHasRegistrationProof(event.target.checked)} className="accent-violet-700" />
                  Business registration proof is applicable
                </label>
                {hasRegistrationProof && (
                  <UploadField label="Business registration proof" file={files.registration} onChange={(file) => updateFile("registration", file)} required />
                )}
              </div>
            )}
            {vendorType === "individual" && (
              <UploadField label="Identity proof" file={files.identity} onChange={(file) => updateFile("identity", file)} required />
            )}
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-sm text-slate-700">
                <input type="checkbox" checked={gstRegistered} onChange={(event) => setGstRegistered(event.target.checked)} className="accent-violet-700" />
                GST registered / GST certificate applicable
              </label>
              {gstRegistered && (
                <UploadField label="GST certificate" file={files.gst} onChange={(file) => updateFile("gst", file)} required />
              )}
            </div>
            <p className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-900">
              GST and business registration documents are requested only when applicable to your business structure and legal requirements.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <SectionTitle
              icon={Wallet}
              title="Where should we send payouts?"
              description="Bank details are sensitive and must be verified before payouts are enabled."
            />
            <TextField label="Account holder name" name="accountHolder" value={values.accountHolder} onChange={setValue} placeholder="Name as shown on bank account" autoComplete="off" />
            <TextField label="Bank account number" name="accountNumber" type="password" value={values.accountNumber} onChange={setValue} placeholder="Enter bank account number" autoComplete="off" inputMode="numeric" pattern="[0-9]{9,18}" minLength={9} maxLength={18} />
            <TextField label="IFSC code" name="ifsc" value={values.ifsc} onChange={setValue} placeholder="e.g. HDFC0001234" autoComplete="off" pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}" maxLength={11} />
            <UploadField label="Cancelled cheque or bank proof" file={files.bankProof} onChange={(file) => updateFile("bankProof", file)} required />
            <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-600">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" />
              Never share bank credentials or OTPs. Account verification should be completed through your payment provider’s KYC process before payouts are enabled.
            </div>
            <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
              <input type="checkbox" required className="mt-1 accent-violet-700" />
              I confirm these details are accurate and agree to administrator review of my application.
            </label>
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <span className="text-xs text-slate-400">Step {step + 1} of {steps.length}</span>
        )}
        {step < steps.length - 1 ? (
          <button type="button" onClick={nextStep} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800">
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button type="submit" disabled={isSaving} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-wait disabled:opacity-70">
              {isSaving ? "Creating account..." : "Create account"} <Check size={16} />
          </button>
        )}
      </div>
    </form>
  );
}

export default function AuthPage() {
  const isRegister = useLocation().pathname === "/register";

  function showOtpNotice() {
    toast.info("OTP, password reset, and account verification require backend setup.");
  }

  return (
    <main className="min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(540px,1.08fr)]">
      <aside className="relative hidden min-h-dvh overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${travelImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/85 via-slate-950/70 to-slate-950/90" />
        <div className="relative z-10">
          <img src={Safar2You} alt="Safar2You" className="h-12 w-auto rounded-md bg-white px-2 object-contain" />
          <div className="mt-24 max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
              Your journeys, growing
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Make every trip a story worth sharing.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
              Manage your travel business, welcome more explorers, and grow with Safar2You.
            </p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
          {[
            ["01", "Simple bookings"],
            ["02", "Trusted payouts"],
            ["03", "Real-time insights"],
          ].map(([number, title]) => (
            <div key={number}>
              <p className="text-xs font-bold text-violet-300">{number}</p>
              <p className="mt-1 text-sm text-slate-200">{title}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:px-10 xl:px-16">
        <header className="flex items-center justify-between lg:justify-end">
          <Link to="/login" className="lg:hidden">
            <img src={Safar2You} alt="Safar2You" className="h-9 w-auto object-contain" />
          </Link>
          <p className="text-sm text-slate-500">
            {isRegister ? "Already a partner?" : "New to Safar2You?"}{" "}
            <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-violet-700 hover:text-violet-900">
              {isRegister ? "Sign in" : "Join as a vendor"}
            </Link>
          </p>
        </header>

        <div className={`mx-auto flex w-full max-w-xl flex-1 flex-col justify-center ${isRegister ? "py-10" : "py-12"}`}>
          <div className="mb-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              {isRegister ? <FileCheck2 size={21} /> : <LockKeyhole size={21} />}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
              Vendor portal
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {isRegister ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isRegister
                ? "A few details are all it takes to get started."
                : "Sign in to manage your travel business."}
            </p>
          </div>

          {isRegister ? (
            <Registration onOtpNotice={showOtpNotice} />
          ) : (
            <>
              <Login onOtpNotice={showOtpNotice} />
              <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} /> Your account details are kept secure
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Safar2You</span>
          <span className="hidden items-center gap-1 sm:flex"><MapPin size={13} /> Made for travel partners</span>
          <Link to="/vendor" className="font-medium text-slate-500 hover:text-violet-700">Preview dashboard</Link>
        </footer>
      </section>
    </main>
  );
}
