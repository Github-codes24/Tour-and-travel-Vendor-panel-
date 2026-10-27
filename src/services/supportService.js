import {
  getSupportTickets,
  saveSupportTicket,
  getSupportTicketById,
  updateSupportTicket,
} from "./supportStorage";

export const supportService = {
  getTickets() {
    return getSupportTickets();
  },

  getTicketById(ticketId) {
    return getSupportTicketById(ticketId);
  },

  getTicket(ticketId) {
    const ticket = getSupportTicketById(ticketId);
    if (!ticket) throw new Error("Support ticket not found.");
    return { ticket, messages: ticket.messages || [] };
  },

  createTicket(ticketData) {
    if (!ticketData) {
      throw new Error("Ticket data is required.");
    }

    const ticket = {
      ...ticketData,
      ticketId:
        ticketData.ticketId || `SUP-${Date.now().toString().slice(-6)}`,
      status: ticketData.status || "Open",
      createdAt: ticketData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return saveSupportTicket(ticket);
  },

  replyToTicket(ticketId, formData) {
    const message = String(formData.get("message") || "").trim();
    if (!message) throw new Error("Enter a reply before sending.");

    return updateSupportTicket(ticketId, (ticket) => ({
      ...ticket,
      messages: [
        ...(ticket.messages || []),
        {
          id: `${Date.now()}`,
          message,
          senderRole: "vendor",
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
  },

  getTicketStats() {
    const tickets = getSupportTickets();

    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status?.toLowerCase() === "open").length,
      inProgress: tickets.filter(
        (t) => t.status?.toLowerCase() === "in progress"
      ).length,
      resolved: tickets.filter(
        (t) => t.status?.toLowerCase() === "resolved"
      ).length,
      closed: tickets.filter(
        (t) => t.status?.toLowerCase() === "closed"
      ).length,
    };
  },
};