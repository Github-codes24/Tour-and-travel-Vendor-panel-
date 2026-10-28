import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  FileText,
  LifeBuoy,
  LoaderCircle,
  Paperclip,
  Send,
  Upload,
  X,
} from "lucide-react";

import { supportService } from "../../../services/supportService";

const CATEGORIES = [
  "Booking Issues",
  "Payment & Payout Issues",
  "Package Management",
  "Account Issues",
  "Documents & Verification",
  "Technical Issues",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const INITIAL_FORM = {
  subject: "",
  category: "",
  priority: "Medium",
  description: "",
};

const FORM_ID = "create-ticket-form";

const baseFieldClass =
  "mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-sm " +
  "text-slate-800 shadow-sm outline-none transition " +
  "placeholder:text-slate-400 focus:ring-4";

// Border-colour conflict nako mhanun error / normal state vegle ghetle
function fieldClass(hasError) {
  return `${baseFieldClass} ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-slate-300 focus:border-violet-600 focus:ring-violet-600/10"
  }`;
}

const labelClass = "text-sm font-semibold text-slate-700";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

function CardHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        <Icon size={20} />
      </span>

      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function CreateTicket() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));
  }

  function handleAttachment(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const isAllowedType = ALLOWED_FILE_TYPES.includes(file.type);

    if (!isAllowedType) {
      toast.error("Only PDF, JPG, JPEG, and PNG files are supported.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("The attachment must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setAttachment(file);
    setErrors((previous) => ({
      ...previous,
      attachment: "",
    }));
  }

  function removeAttachment() {
    setAttachment(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.subject.trim()) {
      nextErrors.subject = "Please enter a ticket subject.";
    } else if (form.subject.trim().length < 5) {
      nextErrors.subject = "Subject must contain at least 5 characters.";
    } else if (form.subject.trim().length > 120) {
      nextErrors.subject = "Subject cannot exceed 120 characters.";
    }

    if (!form.category) {
      nextErrors.category = "Please select a category.";
    }

    if (!form.priority) {
      nextErrors.priority = "Please select a priority.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Please describe your issue.";
    } else if (form.description.trim().length < 20) {
      nextErrors.description =
        "Please provide at least 20 characters of detail.";
    } else if (form.description.trim().length > 5000) {
      nextErrors.description = "Description cannot exceed 5,000 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting || !validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        subject: form.subject.trim(),
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
        status: "Open",
        attachmentName: attachment?.name || "",
      };

      // Create the ticket only when the form is submitted.
      const createdTicket = await Promise.resolve(
        supportService.createTicket(payload)
      );

      if (!createdTicket?.ticketId) {
        throw new Error(
          "Ticket was not created correctly. Check supportService.js."
        );
      }

      toast.success("Support ticket created successfully!");

      navigate(`/vendor/support/tickets/${createdTicket.ticketId}`, {
        state: { created: true },
      });
    } catch (error) {
      console.error("Create support ticket error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to create your ticket. Please try again.";

      setErrors((previous) => ({
        ...previous,
        submit: message,
      }));

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="w-full">
        {/* ---------- Header ---------- */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate("/vendor/support")}
              className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-600/15"
            >
              <ArrowLeft size={17} />
              Back to Support
            </button>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Create Support Ticket
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Tell us what happened. Our support team will review your
              request and help you resolve the issue.
            </p>
          </div>

          <div className="flex w-full gap-3 sm:w-auto sm:shrink-0">
            <button
              type="button"
              disabled={submitting}
              onClick={() => navigate("/vendor/support")}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-600/15 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={FORM_ID}
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-700/25 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </div>

        {/* ---------- Form ---------- */}
        <form
          id={FORM_ID}
          onSubmit={handleSubmit}
          noValidate
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)]"
        >
          {/* Left: ticket information */}
          <section className={cardClass}>
            <CardHeader
              icon={ClipboardList}
              title="Ticket Information"
              description="Fields marked with * are required."
            />

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="subject" className={labelClass}>
                    Subject <span className="text-red-500">*</span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {form.subject.length}/120
                  </span>
                </div>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={updateField}
                  maxLength={120}
                  placeholder="e.g. Booking payment not reflected"
                  aria-invalid={Boolean(errors.subject)}
                  className={fieldClass(errors.subject)}
                />

                {errors.subject && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="category" className={labelClass}>
                    Category <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    aria-invalid={Boolean(errors.category)}
                    className={`${fieldClass(errors.category)} cursor-pointer`}
                  >
                    <option value="">Select category</option>

                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="priority" className={labelClass}>
                    Priority <span className="text-red-500">*</span>
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={updateField}
                    className={`${fieldClass(errors.priority)} cursor-pointer`}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-xs text-slate-500">
                    Select High for urgent issues affecting your operations.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="description" className={labelClass}>
                    Describe your issue{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <span className="text-xs text-slate-400">
                    {form.description.length}/5000
                  </span>
                </div>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={updateField}
                  maxLength={5000}
                  placeholder="Explain what happened, when it happened, and any relevant booking or package reference."
                  aria-invalid={Boolean(errors.description)}
                  className={`${fieldClass(
                    errors.description
                  )} min-h-32 resize-y leading-6`}
                />

                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {errors.submit && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-sm leading-5 text-red-700">
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Right: attachment + help */}
          <div className="space-y-6">
            <section className={cardClass}>
              <CardHeader
                icon={Paperclip}
                title="Attachment"
                description="Optional screenshot or document, up to 5 MB."
              />

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleAttachment}
                className="hidden"
                id="ticket-attachment"
              />

              {!attachment ? (
                <label
                  htmlFor="ticket-attachment"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center transition hover:border-violet-500 hover:bg-violet-50/40"
                >
                  <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm ring-1 ring-slate-200">
                    <Upload size={19} />
                  </span>

                  <span className="text-sm font-semibold text-slate-700">
                    Click to upload a file
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    PDF, JPG, JPEG, or PNG · Max 5 MB
                  </span>
                </label>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                    <FileText size={19} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {attachment.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeAttachment}
                    aria-label="Remove attachment"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}
            </section>

            <section className={cardClass}>
              <CardHeader
                icon={LifeBuoy}
                title="Before you submit"
                description="A few things to keep in mind."
              />

              <ul className="space-y-2.5 text-xs leading-5 text-slate-600">
                <li>
                  Please do not include passwords, OTPs, or sensitive
                  payment details in your message.
                </li>
                <li>
                  Your ticket will be linked to your authenticated vendor
                  account.
                </li>
                <li>
                  Need help with another issue? Visit the{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/vendor/support/help")}
                    className="font-semibold text-violet-700 hover:text-violet-900"
                  >
                    Help Center
                  </button>
                  .
                </li>
              </ul>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}