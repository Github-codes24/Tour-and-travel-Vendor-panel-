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
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
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

  const loadTicket = useCallback(() => {
    return Promise.resolve()
      .then(() => supportService.getTicket(ticketId))
      .then((result) => {
        const response = unwrap(result);
      const ticketData = response.ticket || response;
      const conversation = response.messages || ticketData.messages || [];

        setError("");
      setTicket(ticketData);
      setMessages(
        [...conversation]
          .filter((message) => !message.isInternal)
          .sort(
            (a, b) =>
              new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          )
        );
      })
      .catch((err) => {
        setError(err.message || "Unable to load this support ticket.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

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
      setError("This ticket is not accepting replies. Contact support if you need further assistance.");
      return;
    }

    setSending(true);

    try {
      const payload = new FormData();
      payload.append("message", reply.trim());

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
      <div className="flex items-center justify-center gap-2 p-16 text-sm text-slate-500">
        <LoaderCircle className="animate-spin" size={20} />
        Loading ticket...
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-200 bg-white p-6">
        <p role="alert" className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={retryLoadTicket}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700"
        >
          <RefreshCw size={16} /> Try again
        </button>
        <div>
          <Link to="/vendor/support/tickets" className="text-sm text-slate-600 underline">
            Back to tickets
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const canReply = !["Closed", "Resolved"].includes(ticket.status);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/vendor/support/tickets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft size={17} /> Back to My Tickets
        </Link>
        <Link
          to="/vendor/support/create"
          className="text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          Create another ticket
        </Link>
      </div>

      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {location.state?.created && (
        <section
          role="status"
          className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-sm"
        >
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-7">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={30} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-800">
                Request submitted successfully
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                We’re on it.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Your support ticket has been received. Keep the ticket ID below
                handy to follow updates from your Support Center.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800">
                  {ticket.ticketId || ticket._id}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Clock3 size={14} />
                  Submitted {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {ticket.status || "Open"}
            </span>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Ticket {ticket.ticketId || ticket._id}
            </p>
            <h2 className="mt-2 break-words text-xl font-bold text-slate-900 sm:text-2xl">
              {ticket.subject}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Submitted {formatDateTime(ticket.createdAt)}
            </p>
          </div>
          {!location.state?.created && (
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {ticket.status}
            </span>
          )}
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-4">
          {[
            ["Category", ticket.category],
            ["Priority", ticket.priority],
            ["Status", ticket.status],
            ["Last Updated", formatDateTime(ticket.updatedAt)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                {value || "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="px-5 pb-6 sm:px-7 sm:pb-7">
          <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-800">
              Your request
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {ticket.description}
            </p>
            {ticket.attachmentName && (
              <p className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                <Paperclip size={14} className="shrink-0" />
                <span className="truncate">{ticket.attachmentName}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900">Conversation</h2>
          <p className="mt-1 text-sm text-slate-500">
            Messages between you and the support team.
          </p>
        </div>

        <div className="space-y-4 p-5 sm:p-7">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <LifeBuoy size={21} />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                {location.state?.created
                  ? "Your request is in the support queue"
                  : "No replies yet"}
              </p>
              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                {location.state?.created
                  ? "The support team will respond here. You can return to this ticket anytime from My Tickets."
                  : "Replies from you and the support team will appear here."}
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isVendor = message.senderRole === "vendor";

              return (
                <article
                  key={message._id || message.id || index}
                  className={`max-w-[90%] rounded-2xl p-4 sm:max-w-[80%] ${
                    isVendor
                      ? "ml-auto bg-teal-50"
                      : "mr-auto bg-slate-100"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800">
                      {isVendor
                        ? "You"
                        : message.sender?.name || "Support Team"}
                    </p>
                    <time className="text-xs text-slate-500">
                      {formatDateTime(message.createdAt)}
                    </time>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {message.message}
                  </p>

                  {Array.isArray(message.attachments) &&
                    message.attachments.map((file, fileIndex) => (
                      <a
                        key={file._id || fileIndex}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-teal-700 underline"
                      >
                        <Paperclip size={14} />
                        {file.originalName || file.filename || "View attachment"}
                      </a>
                    ))}
                </article>
              );
            })
          )}
        </div>

        {canReply ? (
          <form onSubmit={sendReply} className="border-t border-slate-200 bg-slate-50 p-5 sm:p-7">
            <label htmlFor="reply" className="mb-2 block text-sm font-semibold text-slate-700">
              Write a reply
            </label>
            <textarea
              id="reply"
              rows={4}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              maxLength={5000}
              placeholder="Type your message..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Paperclip size={16} /> Attach file
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={handleAttachment}
                    className="sr-only"
                  />
                </label>
                {attachment && (
                  <span className="max-w-[180px] truncate text-xs text-slate-500">
                    {attachment.name}
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="ml-2 font-bold text-red-600"
                    >
                      Remove
                    </button>
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                <Send size={16} />
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            This ticket is {ticket.status?.toLowerCase()}. Replies are disabled. Contact support if you need further assistance.
          </div>
        )}
      </section>
    </div>
  );
}