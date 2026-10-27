const STORAGE_KEY = "vendor_support_tickets";

export function getSupportTickets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSupportTicket(ticket) {
  const tickets = getSupportTickets();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([ticket, ...tickets])
  );

  return ticket;
}

export function getSupportTicketById(ticketId) {
  return getSupportTickets().find(
    (ticket) =>
      String(ticket.ticketId) === String(ticketId) ||
      String(ticket._id) === String(ticketId) ||
      String(ticket.id) === String(ticketId)
  );
}

export function updateSupportTicket(ticketId, updater) {
  const tickets = getSupportTickets();
  const ticketIndex = tickets.findIndex(
    (ticket) =>
      String(ticket.ticketId) === String(ticketId) ||
      String(ticket._id) === String(ticketId) ||
      String(ticket.id) === String(ticketId)
  );

  if (ticketIndex === -1) {
    throw new Error("Support ticket not found.");
  }

  const updatedTicket = updater(tickets[ticketIndex]);
  tickets[ticketIndex] = updatedTicket;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  return updatedTicket;
}