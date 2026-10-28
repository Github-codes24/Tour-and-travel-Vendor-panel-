import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  Loader2,
  LockKeyhole,
  MapPin,
  Send,
  ShieldCheck,
  Upload,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import Safar2YouSidebar from "../../assets/Safar2YouSidebar.png";
import travelImage from "../../assets/dashboard-travel.jpg";
import {
  createLocalVendorAccount,
  signInLocalVendor,
} from "../../utils/localVendorAuth";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

// Dev shortcut. Production la false thev; local testing sathi true kar.
const SHOW_PREVIEW_LINK = false;

const inputClass =
  "block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-600/15";

// "block" must: label inline asel tar space-y / margin kaam karat nahi
const labelClass = "block text-sm font-medium text-slate-700";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-600/30 disabled:cursor-not-allowed disabled:opacity-70";

function generateDemoOtp() {
  const range = 1_000_000;
  const maxUnbiasedValue = Math.floor(2 ** 32 / range) * range;
  const randomValues = new Uint32Array(1);

  do {
    window.crypto.getRandomValues(randomValues);
  } while (randomValues[0] >= maxUnbiasedValue);

  return String(randomValues[0] % range).padStart(6, "0");
}

const features = [
  {
    icon: CalendarCheck,
    title: "Simple bookings",
    text: "Track every enquiry and confirmed trip in one place.",
  },
  {
    icon: Wallet,
    title: "Trusted payouts",
    text: "Verified bank accounts and clear settlement records.",
  },
  {
    icon: BarChart3,
    title: "Real-time insights",
    text: "Sales, departures and reviews, always up to date.",
  },
];

/* ------------------------------------------------------------------ */
/* Shared UI                                                           */
/* ------------------------------------------------------------------ */

/**
 * Brand logo.
 * Keep the transparent PNG itself. On the dark brand panel it sits
 * directly on the photo; a white drop-shadow glow follows the logo shape.
 */
function BrandLogo({ variant = "plain", className = "" }) {
  const isCard = variant === "card";

  return (
    <img
      src={Safar2YouSidebar}
      alt="Safar2You"
      className={[
        "select-none object-contain bg-transparent",
        isCard
          ? "h-14 w-auto max-w-full drop-shadow-[0_0_14px_rgba(255,255,255,0.85)] sm:h-16"
          : "h-8 w-auto sm:h-9",
        className,
      ].join(" ")}
      draggable={false}
    />
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
  autoComplete,
  inputClassName = "",
  action,
  ...props
}) {
  return (
    <div className={labelClass}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={name}>{label}</label>
        {action}
      </div>
      <input
        className={`${inputClass} mt-1.5 ${inputClassName}`}
        id={name}
        name={name}
        type={type}
        value={onChange ? (value ?? "") : undefined}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        {...props}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
  required = true,
}) {
  return (
    <label className={labelClass}>
      {label}
      <select
        className={`${inputClass} mt-1.5 appearance-none`}
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
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
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

        {file && (
          <CheckCircle2
            size={17}
            className="shrink-0 text-emerald-600"
          />
        )}
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

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

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
        toast.error(
          "Email or password is incorrect. Register a local account first.",
        );
        return;
      }

      toast.success("Signed in successfully.");
      navigate("/vendor", { replace: true });
    } catch (error) {
      toast.error(
        error.message || "Unable to sign in with local account.",
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus:outline-none focus-visible:text-violet-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </span>
      </label>

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2.5 text-slate-600">
          <input
            name="rememberMe"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 accent-violet-700"
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={onOtpNotice}
          className="font-semibold text-violet-700 transition hover:text-violet-900"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isSigningIn}
        className={`${primaryButtonClass} w-full py-3.5 shadow-lg shadow-violet-700/20`}
      >
        {isSigningIn ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Registration                                                        */
/* ------------------------------------------------------------------ */

const steps = [
  { title: "Your details", icon: UserRound },
  { title: "Business & documents", icon: FileCheck2 },
  { title: "Payout details", icon: Wallet },
];

function Registration() {
  const navigate = useNavigate();
  const stepRef = useRef(null);

  const [step, setStep] = useState(0);
  const [vendorType, setVendorType] = useState("agency");
  const [gstRegistered, setGstRegistered] = useState(false);
  const [hasRegistrationProof, setHasRegistrationProof] = useState(false);
  const [files, setFiles] = useState({});
  const [values, setValues] = useState({});
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canSendEmailOtp =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email || "");
  const phoneDigits = (values.phone || "").replace(/\D/g, "");
  const canSendMobileOtp =
    /^[+0-9 ()-]{10,16}$/.test(values.phone || "") &&
    phoneDigits.length >= 10 &&
    phoneDigits.length <= 15;

  function setValue(event) {
    const { name, value } = event.target;

    if (name === "email") {
      setEmailOtp("");
      setIsEmailVerified(false);
      setValues((current) => ({
        ...current,
        email: value,
        emailOtp: "",
      }));
      return;
    }

    if (name === "phone") {
      setMobileOtp("");
      setIsMobileVerified(false);
      setValues((current) => ({
        ...current,
        phone: value,
        phoneOtp: "",
      }));
      return;
    }

    if (name === "emailOtp") {
      setIsEmailVerified(false);
    } else if (name === "phoneOtp") {
      setIsMobileVerified(false);
    }

    setValues((current) => ({ ...current, [name]: value }));
  }

  function sendDemoOtp(channel) {
    try {
      const otp = generateDemoOtp();

      if (channel === "email") {
        setEmailOtp(otp);
        setIsEmailVerified(false);
        setValues((current) => ({ ...current, emailOtp: "" }));
      } else {
        setMobileOtp(otp);
        setIsMobileVerified(false);
        setValues((current) => ({ ...current, phoneOtp: "" }));
      }

      toast.info(`Demo OTP: ${otp}`, { autoClose: 15000 });
    } catch (error) {
      toast.error(error.message || "Unable to generate a demo OTP.");
    }
  }

  function verifyDemoOtp(channel) {
    const isEmail = channel === "email";
    const enteredOtp = isEmail ? values.emailOtp : values.phoneOtp;
    const generatedOtp = isEmail ? emailOtp : mobileOtp;

    if (enteredOtp !== generatedOtp) {
      toast.error("The OTP is incorrect. Please check the code and try again.");
      return;
    }

    if (isEmail) {
      setIsEmailVerified(true);
    } else {
      setIsMobileVerified(true);
    }

    toast.success(`${isEmail ? "Email" : "Mobile number"} verified.`);
  }

  function updateFile(key, file) {
    setFiles((current) => ({
      ...current,
      [key]: file,
    }));
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
    if (!validateCurrentStep()) return;

    if (step === 0 && (!isEmailVerified || !isMobileVerified)) {
      toast.error("Verify both your email address and mobile number to continue.");
      return;
    }

    setStep((current) => Math.min(current + 1, 2));
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

        <p className="mt-6 text-sm font-semibold text-violet-700">
          Local demo account ready
        </p>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Your account is ready
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Your sign-in details are saved in this browser. The vendor
          application has not been sent for review; once a backend is
          connected, it can be submitted for{" "}
          <strong className="text-amber-700">Pending Approval</strong>.
          Payouts must remain disabled until your bank account is
          verified by the payment provider.
        </p>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm leading-5 text-amber-900">
          Demo mode: only your email and a salted password hash are
          stored in this browser. Documents, bank details, OTP
          verification, and admin approval are not saved or processed
          until a backend is connected.
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/login", {
              state: { email: values.email },
            })
          }
          className={`${primaryButtonClass} mt-7`}
        >
          Back to sign in
          <ArrowRight size={17} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submitRegistration} className="w-full">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60">
        <div className="grid grid-cols-3 gap-2">
          {steps.map(({ title, icon: Icon }, index) => (
            <div key={title} className="min-w-0">
              <div
                className={`mb-2 h-1.5 rounded-full ${
                  index <= step ? "bg-violet-600" : "bg-slate-200"
                }`}
              />

              <div
                className={`flex items-center gap-1.5 text-[11px] font-semibold sm:text-xs ${
                  index === step
                    ? "text-violet-800"
                    : index < step
                      ? "text-emerald-700"
                      : "text-slate-400"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={stepRef}>
        {step === 0 && (
          <div className="space-y-5">
            <SectionTitle
              icon={UserRound}
              title="Let’s get to know you"
              description="Start with your contact details and location."
            />

            <TextField
              label="Full name"
              name="fullName"
              value={values.fullName}
              onChange={setValue}
              placeholder="Your full name"
              autoComplete="name"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
                <TextField
                  label="Email address"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={setValue}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <TextField
                    label="Email verification code"
                    name="emailOtp"
                    value={values.emailOtp}
                    onChange={setValue}
                    placeholder="Enter 6-digit code"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    action={
                      <button
                        type="button"
                        onClick={() => sendDemoOtp("email")}
                        disabled={!canSendEmailOtp}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600/40 ${
                          canSendEmailOtp
                            ? "border-violet-200 bg-white text-violet-700 hover:border-violet-300 hover:bg-violet-50"
                            : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Send size={12} />
                        Generate OTP
                      </button>
                    }
                    inputClassName="text-center font-mono text-base font-semibold tracking-[0.2em] placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                  />
                  {emailOtp && (
                    <p className="mt-2 text-xs text-violet-800">
                      Demo OTP: <span className="font-mono font-bold tracking-wider">{emailOtp}</span>
                      <span className="text-slate-500"> · visible only in this demo</span>
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                      className={`text-xs font-medium ${
                        isEmailVerified ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {isEmailVerified ? "Email verified" : "Enter code to verify"}
                    </span>
                    <button
                      type="button"
                      onClick={() => verifyDemoOtp("email")}
                      disabled={!emailOtp || !/^[0-9]{6}$/.test(values.emailOtp || "") || isEmailVerified}
                      className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-600/25 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {isEmailVerified ? "Verified" : "Verify email"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
                <TextField
                  label="Mobile number"
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={setValue}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  pattern="[+0-9 ()-]{10,16}"
                />

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <TextField
                    label="Mobile verification code"
                    name="phoneOtp"
                    value={values.phoneOtp}
                    onChange={setValue}
                    placeholder="Enter 6-digit code"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    action={
                      <button
                        type="button"
                        onClick={() => sendDemoOtp("mobile")}
                        disabled={!canSendMobileOtp}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600/40 ${
                          canSendMobileOtp
                            ? "border-violet-200 bg-white text-violet-700 hover:border-violet-300 hover:bg-violet-50"
                            : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Send size={12} />
                        Generate OTP
                      </button>
                    }
                    inputClassName="text-center font-mono text-base font-semibold tracking-[0.2em] placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                  />
                  {mobileOtp && (
                    <p className="mt-2 text-xs text-violet-800">
                      Demo OTP: <span className="font-mono font-bold tracking-wider">{mobileOtp}</span>
                      <span className="text-slate-500"> · visible only in this demo</span>
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                      className={`text-xs font-medium ${
                        isMobileVerified ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {isMobileVerified ? "Mobile verified" : "Enter code to verify"}
                    </span>
                    <button
                      type="button"
                      onClick={() => verifyDemoOtp("mobile")}
                      disabled={!mobileOtp || !/^[0-9]{6}$/.test(values.phoneOtp || "") || isMobileVerified}
                      className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-600/25 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {isMobileVerified ? "Verified" : "Verify mobile"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Create password"
                name="password"
                type="password"
                value={values.password}
                onChange={setValue}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
              />

              <SelectField
                label="Vendor type"
                name="vendorType"
                value={vendorType}
                onChange={(event) => setVendorType(event.target.value)}
              >
                <option value="agency">Travel Agency</option>
                <option value="individual">Individual Tour Operator</option>
              </SelectField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Address"
                name="address"
                value={values.address}
                onChange={setValue}
                placeholder="Street address"
                autoComplete="street-address"
              />

              <TextField
                label="City"
                name="city"
                value={values.city}
                onChange={setValue}
                placeholder="City"
                autoComplete="address-level2"
              />

              <TextField
                label="State"
                name="state"
                value={values.state}
                onChange={setValue}
                placeholder="State"
                autoComplete="address-level1"
              />

              <TextField
                label="PIN code"
                name="pin"
                value={values.pin}
                onChange={setValue}
                placeholder="6-digit PIN code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                autoComplete="postal-code"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <SectionTitle
              icon={Building2}
              title={
                vendorType === "agency" ? "Agency details" : "Operator details"
              }
              description="Tell us about your business and upload applicable documents."
            />

            <TextField
              label={
                vendorType === "agency"
                  ? "Agency name"
                  : "Business / display name"
              }
              name="businessName"
              value={values.businessName}
              onChange={setValue}
              placeholder={
                vendorType === "agency"
                  ? "Your registered agency name"
                  : "Name customers will see"
              }
            />

            <TextField
              label={
                vendorType === "agency"
                  ? "Business PAN (if applicable)"
                  : "Individual PAN"
              }
              name="pan"
              value={values.pan}
              onChange={setValue}
              placeholder="ABCDE1234F"
              required={vendorType === "individual"}
              pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]"
              maxLength={10}
            />

            {/* Agency owner / authorized person Aadhaar */}
            {vendorType === "agency" && (
              <div className="space-y-4">
                <TextField
                  label="Owner / Authorized Person Aadhaar Number *"
                  name="aadhaarNumber"
                  value={values.aadhaarNumber || ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      aadhaarNumber: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12),
                    }))
                  }
                  placeholder="Enter 12-digit Aadhaar number"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{12}"
                  maxLength={12}
                  autoComplete="off"
                />

                <UploadField
                  label="Upload Aadhaar Card Photo"
                  file={files.ownerAadhaar}
                  onChange={(file) => updateFile("ownerAadhaar", file)}
                  
                />
              </div>
            )}

            {/* Agency business registration proof */}
            {vendorType === "agency" && (
              <div className="space-y-3">
                <label className="flex items-center gap-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasRegistrationProof}
                    onChange={(event) =>
                      setHasRegistrationProof(event.target.checked)
                    }
                    className="accent-violet-700"
                  />
                  Business registration proof is applicable
                </label>

                {hasRegistrationProof && (
                  <UploadField
                    label="Business registration proof"
                    file={files.registration}
                    onChange={(file) => updateFile("registration", file)}
                    required
                  />
                )}
              </div>
            )}

            {/* Individual vendor Aadhaar and additional ID */}
            {vendorType === "individual" && (
              <div className="space-y-4">
                <TextField
                  label="Aadhaar Card Number *"
                  name="aadhaarNumber"
                  value={values.aadhaarNumber || ""}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      aadhaarNumber: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12),
                    }))
                  }
                  placeholder="Enter 12-digit Aadhaar number"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{12}"
                  maxLength={12}
                  autoComplete="off"
                />

                <UploadField
                  label="Upload Aadhaar Card Photo *"
                  file={files.identity}
                  onChange={(file) => updateFile("identity", file)}
                  required
                />

                <UploadField
                  label="Additional identity document (optional)"
                  file={files.additionalIdentity}
                  onChange={(file) => updateFile("additionalIdentity", file)}
                />
              </div>
            )}

            {/* GST certificate */}
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={gstRegistered}
                  onChange={(event) => setGstRegistered(event.target.checked)}
                  className="accent-violet-700"
                />
                GST registered / GST certificate applicable
              </label>

              {gstRegistered && (
                <UploadField
                  label="GST certificate"
                  file={files.gst}
                  onChange={(file) => updateFile("gst", file)}
                  required
                />
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <SectionTitle
              icon={Wallet}
              title="Where should we send payouts?"
              description="Bank details are sensitive and must be verified before payouts are enabled."
            />

            <TextField
              label="Account holder name"
              name="accountHolder"
              value={values.accountHolder}
              onChange={setValue}
              placeholder="Name as shown on bank account"
              autoComplete="off"
            />

            <TextField
              label="Bank account number"
              name="accountNumber"
              type="password"
              value={values.accountNumber}
              onChange={setValue}
              placeholder="Enter bank account number"
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]{9,18}"
              minLength={9}
              maxLength={18}
            />

            <TextField
              label="IFSC code"
              name="ifsc"
              value={values.ifsc}
              onChange={setValue}
              placeholder="e.g. HDFC0001234"
              autoComplete="off"
              pattern="[A-Za-z]{4}0[A-Za-z0-9]{6}"
              maxLength={11}
            />

            <UploadField
              label="Cancelled cheque or bank proof"
              file={files.bankProof}
              onChange={(file) => updateFile("bankProof", file)}
              required
            />

            <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-slate-600">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              Never share bank credentials or OTPs. Account verification
              should be completed through your payment provider’s KYC
              process before payouts are enabled.
            </div>

            <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-600">
              <input
                type="checkbox"
                required
                className="mt-1 accent-violet-700"
              />
              I confirm these details are accurate and agree to
              administrator review of my application.
            </label>
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        ) : (
          <span className="text-xs text-slate-400">
            Step {step + 1} of {steps.length}
          </span>
        )}

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className={`${primaryButtonClass} ml-auto`}
          >
            Continue
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSaving}
            className={`${primaryButtonClass} ml-auto`}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <Check size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AuthPage() {
  const isRegister = useLocation().pathname === "/register";

  function showOtpNotice() {
    toast.info(
      "OTP, password reset, and account verification require backend setup.",
    );
  }

  return (
    <main className="min-h-dvh bg-[#f3f4f6] lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(540px,1.08fr)]">
      {/* ---------- Brand panel (desktop only) ---------- */}
      <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between lg:gap-8 lg:self-start lg:px-10 lg:py-8 xl:px-14 xl:py-10">
        {/* Background photo */}
        <img
          src={travelImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover scale-[1.08]"
        />

        {/* Lighter tint at top, dark at bottom so text stays readable */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.15),_transparent_30%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/25 to-slate-950/90" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-slate-950/30 to-transparent" />

        {/* Logo: transparent background, white glow keeps it visible */}
        <div className="relative z-10">
          <Link
            to="/login"
            aria-label="Safar2You home"
            className="inline-block"
          >
            <BrandLogo variant="card" />
          </Link>
        </div>

        <div className="relative z-10 shrink-0">
          <div className="max-w-lg">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-100 ring-1 ring-white/20 backdrop-blur">
              <MapPin size={13} />
              Your journeys, growing
            </p>

            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight drop-shadow-sm xl:text-5xl">
              Make every trip a story worth sharing.
            </h1>

            <p className="mt-4 max-w-md text-base leading-7 text-slate-200">
              Manage your travel business, welcome more explorers, and
              grow with Safar2You.
            </p>
          </div>

          <ul className="mt-7 space-y-3.5 border-t border-white/20 pt-6">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-violet-100 ring-1 ring-white/20 backdrop-blur">
                  <Icon size={17} />
                </span>

                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm leading-5 text-slate-300">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <section className="flex min-h-dvh flex-col bg-[#f3f4f6] px-5 py-6 sm:px-8 lg:px-10 xl:px-16">
        <header className="flex items-center justify-between lg:justify-end">
          <Link
            to="/login"
            aria-label="Safar2You home"
            className="lg:hidden"
          >
            <BrandLogo variant="plain" />
          </Link>

          <p className="text-sm text-slate-500">
            {isRegister ? "Already a partner?" : "New to Safar2You?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              className="font-semibold text-violet-700 transition hover:text-violet-900"
            >
              {isRegister ? "Sign in" : "Join as a vendor"}
            </Link>
          </p>
        </header>

        <div
          className={`mx-auto flex w-full flex-1 flex-col justify-center ${
            isRegister ? "max-w-[760px] py-10" : "max-w-md py-12"
          }`}
        >
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 ring-1 ring-violet-200/60 shadow-sm shadow-violet-200/40">
              {isRegister ? (
                <FileCheck2 size={22} />
              ) : (
                <LockKeyhole size={22} />
              )}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-[2.6rem]">
              {isRegister ? "Create your account" : "Welcome back"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isRegister
                ? "A few details are all it takes to get started."
                : "Sign in to your vendor portal to manage your travel business."}
            </p>
          </div>

          {isRegister ? (
            <Registration />
          ) : (
            <>
              <Login onOtpNotice={showOtpNotice} />

              <div className="my-7 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                New to Safar2You?
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <Link
                to="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-600/15"
              >
                Create a vendor account
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} className="text-emerald-600" />
                Your account details are kept secure
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Safar2You</span>

          <span className="hidden items-center gap-1 sm:flex">
            <MapPin size={13} />
            Made for travel partners
          </span>

          {SHOW_PREVIEW_LINK ? (
            <Link
              to="/vendor"
              className="font-medium text-slate-500 hover:text-violet-700"
            >
              Preview dashboard
            </Link>
          ) : (
            <span className="hidden sm:inline">Vendor Portal</span>
          )}
        </footer>
      </section>
    </main>
  );
}