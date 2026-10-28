import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Paperclip,
  CheckCircle2,
  Clock3,
  LifeBuoy,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { supportService } from "../../../services/supportService";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function unwrap(response) {
  return response?.data ?? response;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

const statusStyles = {
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 ring-amber-200",
  "Awaiting Vendor Response": "bg-purple-50 text-purple-700 ring-purple-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[value] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value || "Open"}
    </span>
  );
}

export default function TicketDetails() {
  const { ticketId } = useParams();
  const location = useLocation();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");

  const loadTicket = useCallback(async () => {
    try {
      const result = await supportService.getTicket(ticketId);
      const response = unwrap(result);
      const ticketData = response?.ticket || response;
      const conversation = response?.messages || ticketData?.messages || [];

      setError("");
      setTicket(ticketData);
      setMessages(
        [...conversation]
          .filter((message) => !message.isInternal)
          .sort(
            (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
          ),
      );
    } catch (err) {
      setError(err.message || "Unable to load this support ticket.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.resolve()
      .then(() => supportService.getTicket(ticketId))
      .then((result) => {
        if (!active) return;
        const response = unwrap(result);
        const ticketData = response?.ticket || response;
        const conversation = response?.messages || ticketData?.messages || [];
        setError("");
        setTicket(ticketData);
        setMessages(
          [...conversation]
            .filter((message) => !message.isInternal)
            .sort(
              (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
            ),
        );
      })
      .catch((err) => {
        if (active)
          setError(err.message || "Unable to load this support ticket.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ticketId]);

  function retryLoadTicket() {
    setLoading(true);
    loadTicket();
  }

  function handleAttachment(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Only PDF, JPG, JPEG, and PNG attachments are supported.");
      event.target.value = "";
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("Attachment must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setAttachment(selected);
  }

  async function sendReply(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!reply.trim() && !attachment) {
      setError("Enter a message or attach a file before sending.");
      return;
    }

    if (["Closed", "Resolved"].includes(ticket?.status)) {
      setError(
        "This ticket is not accepting replies. Contact support if you need further assistance.",
      );
      return;
    }

    setSending(true);
    try {
      const payload = new FormData();
      if (reply.trim()) payload.append("message", reply.trim());
      if (attachment) payload.append("attachment", attachment);

      await supportService.replyToTicket(ticketId, payload);
      setReply("");
      setAttachment(null);
      await loadTicket();
      setNotice("Your reply was sent successfully.");
    } catch (err) {
      setError(err.message || "Unable to send your reply.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          <LoaderCircle className="animate-spin text-violet-700" size={20} />
          Loading ticket details...
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <LifeBuoy size={23} />
        </div>
        <h1 className="mt-4 text-lg font-bold text-slate-900">
          Unable to open this ticket
        </h1>
        <p role="alert" className="mt-2 text-sm leading-6 text-red-700">
          {error}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={retryLoadTicket}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
          >
            <RefreshCw size={16} /> Try again
          </button>
          <Link
            to="/vendor/support/tickets"
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to tickets
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const canReply = !["Closed", "Resolved"].includes(ticket.status);
  const ticketNumber = ticket.ticketId || ticket._id;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/vendor/support/tickets"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-violet-700"
        >
          <ArrowLeft size={17} /> Back to My Tickets
        </Link>
        <Link
          to="/vendor/support/create"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-violet-700 bg-white px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
        >
          <LifeBuoy size={16} /> Create another ticket
        </Link>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {location.state?.created && (
        <section
          role="status"
          className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={25} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-800">
                Request submitted successfully
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                We’re on it.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Your support ticket has been received. Use the ticket ID below
                to track updates.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800">
                  {ticketNumber}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 size={14} /> Submitted{" "}
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ticket summary */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-violet-50 px-2.5 py-1 font-mono text-xs font-bold text-violet-800">
                  {ticketNumber}
                </span>
                <StatusBadge value={ticket.status} />
              </div>
              <h1 className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {ticket.subject || "Support request"}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Clock3 size={15} /> Submitted{" "}
                {formatDateTime(ticket.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Ticket information
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Category", ticket.category || "—"],
              ["Priority", ticket.priority || "—"],
              ["Current status", ticket.status || "Open"],
              ["Last updated", formatDateTime(ticket.updatedAt)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Original request
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Details you provided when creating this ticket
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
              {ticket.description || "No description provided."}
            </p>
            {ticket.attachmentName && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Attachment
                </p>
                <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                  <Paperclip size={16} className="shrink-0 text-violet-700" />
                  <span className="break-all text-sm font-medium text-slate-700">
                    {ticket.attachmentName}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Conversation */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Conversation</h2>
            <p className="mt-1 text-sm text-slate-500">
              Messages between you and the support team.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
            <LifeBuoy size={15} /> {messages.length}{" "}
            {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm ring-1 ring-slate-200">
                <LifeBuoy size={23} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {location.state?.created
                  ? "Your ticket is in the support queue"
                  : "No replies yet"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {location.state?.created
                  ? "The support team will respond here. You can revisit this ticket anytime."
                  : "Messages from you and the support team will appear here."}
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isVendor = message.senderRole === "vendor";
              const senderName = isVendor
                ? "You"
                : message.sender?.name || "Support Team";
              return (
                <article
                  key={message._id || message.id || index}
                  className={`flex w-full ${isVendor ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`w-full max-w-[92%] rounded-2xl border p-4 sm:max-w-[78%] ${
                      isVendor
                        ? "border-violet-100 bg-violet-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                            isVendor
                              ? "bg-violet-100 text-violet-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {senderName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isVendor ? "Vendor" : "Support team"}
                          </p>
                        </div>
                      </div>
                      <time className="text-xs text-slate-500">
                        {formatDateTime(message.createdAt)}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {message.message}
                    </p>
                    {Array.isArray(message.attachments) &&
                      message.attachments.map((file, fileIndex) => (
                        <a
                          key={file._id || fileIndex}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 transition hover:border-violet-300 hover:bg-violet-50"
                        >
                          <Paperclip size={14} className="shrink-0" />
                          <span className="break-all">
                            {file.originalName ||
                              file.filename ||
                              "View attachment"}
                          </span>
                        </a>
                      ))}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {canReply ? (
          <form
            onSubmit={sendReply}
            className="border-t border-slate-200 bg-slate-50/70 p-5 sm:p-6"
          >
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Reply to support
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Add any additional information needed to resolve your request.
              </p>
            </div>
            <label
              htmlFor="reply"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Your message
            </label>
            <textarea
              id="reply"
              rows={4}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              maxLength={5000}
              placeholder="Write your reply here..."
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-50"
            />
            <div className="mt-2 text-right text-xs text-slate-400">
              {reply.length}/5000 characters
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                  <Paperclip size={16} /> Attach file
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={handleAttachment}
                    className="sr-only"
                  />
                </label>
                {attachment && (
                  <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <Paperclip size={14} className="shrink-0 text-violet-700" />
                    <span className="max-w-[160px] truncate text-xs text-slate-600">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={sending || (!reply.trim() && !attachment)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {sending ? "Sending..." : "Send reply"}
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Accepted files: PDF, JPG or PNG. Maximum size: 5 MB.
            </p>
          </form>
        ) : (
          <div className="flex items-start gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-slate-500"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                This ticket is {ticket.status?.toLowerCase()}.
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Replies are disabled. Contact support if you need further
                assistance.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
