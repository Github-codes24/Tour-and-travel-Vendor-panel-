
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  X,
  Upload,
  Send,
  Headset,
  FileText,
  AlertCircle,
  LoaderCircle,
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
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const INITIAL_FORM = {
  subject: "",
  category: "",
  priority: "Medium",
  description: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 " +
  "text-sm text-slate-800 shadow-sm outline-none transition " +
  "placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 " +
  "focus:ring-teal-600/10";

const labelClass = "text-sm font-semibold text-slate-700";

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
      nextErrors.description =
        "Description cannot exceed 5,000 characters.";
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
    <div className="min-h-full w-full bg-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/vendor/support")}
          className="mb-7 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
        >
          <ArrowLeft size={18} />
          Back to Support
        </button>

        <div className="mb-8">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Headset size={23} />
          </div>

          <p className="text-sm font-semibold text-teal-700">
            Support Center
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create Support Ticket
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Tell us what happened. Our support team will review your request
            and help you resolve the issue.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 bg-white px-5 py-5 sm:px-8">
            <h2 className="text-base font-bold text-slate-900">
              Ticket Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fields marked with <span className="text-red-500">*</span> are
              required.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-7 px-5 py-6 sm:px-8 sm:py-8">
              <div>
                <label htmlFor="subject" className={labelClass}>
                  Subject <span className="text-red-500">*</span>
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={updateField}
                  maxLength={120}
                  placeholder="e.g. Booking payment not reflected"
                  aria-invalid={Boolean(errors.subject)}
                  className={`${inputClass} ${
                    errors.subject
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : ""
                  }`}
                />

                <div className="mt-1 flex justify-between gap-3">
                  {errors.subject ? (
                    <p className="text-xs text-red-600">
                      {errors.subject}
                    </p>
                  ) : (
                    <span />
                  )}

                  <span className="text-xs text-slate-400">
                    {form.subject.length}/120
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                    className={`${inputClass} cursor-pointer ${
                      errors.category ? "border-red-400" : ""
                    }`}
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
                    className={`${inputClass} cursor-pointer`}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-slate-500">
                    Select High for urgent issues affecting your operations.
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
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
                  rows={6}
                  value={form.description}
                  onChange={updateField}
                  maxLength={5000}
                  placeholder="Explain what happened, when it happened, and any relevant booking or package reference."
                  aria-invalid={Boolean(errors.description)}
                  className={`${inputClass} min-h-36 resize-y leading-6 ${
                    errors.description ? "border-red-400" : ""
                  }`}
                />

                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description}
                  </p>
                )}

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Please do not include passwords, OTPs, or sensitive payment
                  details in your message.
                </p>
              </div>

              <div>
                <label htmlFor="ticket-attachment" className={labelClass}>
                  Attachment / Screenshot{" "}
                  <span className="font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5 transition hover:border-teal-500 hover:bg-teal-50/30 sm:p-6">
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
                      className="flex cursor-pointer flex-col items-center justify-center text-center"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                        <Upload size={22} />
                      </div>

                      <span className="text-sm font-semibold text-slate-700">
                        Click to upload a file
                      </span>

                      <span className="mt-1 text-xs text-slate-500">
                        PDF, JPG, JPEG, or PNG · Maximum 5 MB
                      </span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <FileText size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {attachment.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={removeAttachment}
                        aria-label="Remove attachment"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {errors.submit && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-sm leading-5 text-red-700">
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-xs leading-5 text-slate-500">
                Your ticket will be linked to your authenticated vendor account.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => navigate("/vendor/support")}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
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
          </form>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Need help with another issue? Visit the{" "}
          <button
            type="button"
            onClick={() => navigate("/vendor/support/help")}
            className="font-semibold text-teal-700 hover:text-teal-900"
          >
            Help Center
          </button>
          .
        </p>
      </div>
    </div>
  );
}
