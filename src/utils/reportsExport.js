/**
 * PDF + Excel export. Both consume the SAME report object the dashboard renders, so figures
 * always match. They export the full filtered dataset (every booking, not just the visible page).
 * jsPDF / ExcelJS are loaded on demand so they don't weigh down the main bundle.
 */
import { parseKey } from "./dateUtils";
import { STATUS_META, PAYOUT_STATUS_META } from "./reportsConfig";
import { formatDate, formatDateTime, formatNumber, formatPercent, formatPeriod, formatPlainAmount, formatRating } from "./formatters";

const UNAVAILABLE = "Unavailable";
const orNA = (v, fmt) => (v === null || v === undefined ? UNAVAILABLE : fmt(v));
const slug = (report) => `vendor-report_${report.meta.range.from}_to_${report.meta.range.to}`;

/** Label/value rows shared by the PDF and the Excel "Summary" sheet. */
export function summaryRows(report) {
  const { stats, finance: f, payouts, trips, repeat, ratings, overview } = report;
  return [
    ["Total bookings", formatNumber(stats.total)],
    ["Confirmed / Pending / Completed / Cancelled", `${stats.confirmed} / ${stats.pending} / ${stats.completed} / ${stats.cancelled}`],
    ["Total travellers (excl. cancelled)", formatNumber(stats.travellers)],
    ["Booking cancellation rate", formatPercent(stats.cancellationRate)],
    ["Active packages", formatNumber(overview.activePackages.value)],
    ["Average rating", ratings.average === null ? "No reviews" : `${formatRating(ratings.average)} / 5 (${ratings.count} reviews)`],
    ["Total booking value", formatPlainAmount(f.bookingValue)],
    ["Platform commission", orNA(f.commission, formatPlainAmount)],
    ["Refunds & cancellation deductions", formatPlainAmount(f.refunds)],
    ["Net vendor earnings", orNA(f.net, formatPlainAmount)],
    ["Payouts already paid", formatPlainAmount(payouts.paid)],
    ["Eligible for payout", orNA(f.eligible, formatPlainAmount)],
    ["Awaiting trip completion", orNA(f.awaitingCompletion, formatPlainAmount)],
    ["Payouts in process", formatPlainAmount(payouts.inProcess)],
    ["Upcoming trips (next 90 days)", formatNumber(trips.upcoming)],
    ["Completed trips (by travel date)", formatNumber(trips.completed)],
    ["Repeat customers", repeat.available && repeat.rate !== null ? `${formatPercent(repeat.rate)} (${repeat.repeat} of ${repeat.unique})` : UNAVAILABLE],
  ];
}

const metaRows = (report) => [
  ["Vendor", report.meta.vendorName || "—"],
  ["Reporting period", formatPeriod(report.meta.range)],
  ["Filters", `${report.meta.filterLabels.status} · ${report.meta.filterLabels.package}`],
  ["Generated", formatDateTime(report.meta.generatedAt)],
];

/* ------------------------------- PDF ------------------------------- */

export async function buildPdf(report) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const M = 40;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const accent = [118, 0, 158];

  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(17, 24, 39).text("Reports & Analytics", M, 50);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(75, 85, 99);
  metaRows(report).forEach(([k, v], i) => doc.text(`${k}: ${v}`, M, 70 + i * 13));
  let y = 70 + metaRows(report).length * 13 + 12;

  const heading = (text) => {
    if (y > pageH - 120) { doc.addPage(); y = 50; }
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(17, 24, 39).text(text, M, y);
    y += 8;
  };
  const table = (head, body, opts = {}) => {
    autoTable(doc, {
      startY: y,
      head: [head],
      body: body.length ? body : [[{ content: "No data for this selection", colSpan: head.length, styles: { halign: "center", textColor: [107, 114, 128] } }]],
      margin: { left: M, right: M },
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: accent, textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      ...opts,
    });
    y = doc.lastAutoTable.finalY + 22;
  };

  heading("Summary");
  table(["Metric", "Value"], summaryRows(report), { columnStyles: { 1: { halign: "right" } } });

  heading("Earnings history");
  table(
    ["Period", "Bookings", "Booking value", "Commission", "Refunds", "Net earnings"],
    report.earningsHistory.filter((r) => r.bookings > 0).map((r) => [r.title, r.bookings, formatPlainAmount(r.bookingValue), orNA(r.commission, formatPlainAmount), formatPlainAmount(r.refunds), orNA(r.net, formatPlainAmount)]),
    { columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } } },
  );

  heading("Package performance");
  table(
    ["Package", "Bookings", "Travellers", "Booking value", "Net earnings", "Avg rating"],
    [...report.packages.rows].sort((a, b) => b.bookings - a.bookings).map((p) => [p.name, p.bookings, p.travellers, formatPlainAmount(p.bookingValue), orNA(p.netEarnings, formatPlainAmount), p.avgRating === null ? "—" : `${formatRating(p.avgRating)} (${p.reviewCount})`]),
    { columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } } },
  );

  heading("Payout transactions");
  table(
    ["Payout ID", "Date", "Reference", "Amount", "Status"],
    report.payouts.rows.map((p) => [p.id, formatDate(p.date), p.reference ?? "—", formatPlainAmount(p.amount), PAYOUT_STATUS_META[p.status].label]),
    { columnStyles: { 3: { halign: "right" } } },
  );

  heading(`Bookings (${report.bookingRows.length})`);
  table(
    ["Booking ID", "Package", "Booked", "Travel", "Travellers", "Amount", "Status"],
    report.bookingRows.map((b) => [b.id, b.packageName ?? "Unavailable package", formatDate(b.bookingDate), formatDate(b.travelDate), b.travellers, formatPlainAmount(b.amount), STATUS_META[b.status].label]),
    { columnStyles: { 4: { halign: "right" }, 5: { halign: "right" } } },
  );

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(107, 114, 128);
    doc.text(`${report.meta.vendorName || "Vendor"} · Reports & Analytics`, M, pageH - 20);
    doc.text(`Page ${i} of ${pages}`, pageW - M, pageH - 20, { align: "right" });
  }
  return doc;
}

export async function exportPdf(report) {
  const doc = await buildPdf(report);
  doc.save(`${slug(report)}.pdf`);
}

/* ------------------------------ Excel ------------------------------ */

// ExcelJS serialises Dates as UTC, so build UTC-midnight dates; local midnight would shift a day back in IST.
const toDate = (key) => {
  if (!key) return null;
  const d = parseKey(key);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};
const CURRENCY = '"₹"#,##0';
const DATE = "dd mmm yyyy";

function addSheet(wb, name, columns, rows) {
  const ws = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 16, style: c.fmt ? { numFmt: c.fmt } : {} }));
  rows.forEach((r) => ws.addRow(r));
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D9488" } };
  head.alignment = { vertical: "middle" };
  if (rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  return ws;
}

export async function buildWorkbook(report) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "TravelPartner Vendor Panel";
  wb.created = new Date();

  const summary = addSheet(wb, "Summary", [{ header: "Item", key: "k", width: 44 }, { header: "Value", key: "v", width: 40 }], [...metaRows(report), ["", ""], ...summaryRows(report)]);
  summary.getColumn("v").alignment = { horizontal: "left" };

  const money = (v) => (v === null || v === undefined ? UNAVAILABLE : v);

  addSheet(wb, "Bookings", [
    { header: "Booking ID", key: "id", width: 14 },
    { header: "Package", key: "pkg", width: 30 },
    { header: "Booking date", key: "bd", width: 14, fmt: DATE },
    { header: "Travel date", key: "td", width: 14, fmt: DATE },
    { header: "Travellers", key: "tr", width: 12 },
    { header: "Booking amount (₹)", key: "amt", width: 18, fmt: CURRENCY },
    { header: "Status", key: "st", width: 14 },
  ], report.bookingRows.map((b) => [b.id, b.packageName ?? "Unavailable package", toDate(b.bookingDate), toDate(b.travelDate), b.travellers, b.amount, STATUS_META[b.status].label]));

  addSheet(wb, "Earnings history", [
    { header: "Period", key: "p", width: 26 },
    { header: "Bookings", key: "b", width: 12 },
    { header: "Booking value (₹)", key: "v", width: 18, fmt: CURRENCY },
    { header: "Commission (₹)", key: "c", width: 16, fmt: CURRENCY },
    { header: "Refunds (₹)", key: "r", width: 14, fmt: CURRENCY },
    { header: "Net earnings (₹)", key: "n", width: 18, fmt: CURRENCY },
  ], report.earningsHistory.filter((r) => r.bookings > 0).map((r) => [r.title, r.bookings, r.bookingValue, money(r.commission), r.refunds, money(r.net)]));

  addSheet(wb, "Payouts", [
    { header: "Payout ID", key: "id", width: 14 },
    { header: "Payout date", key: "d", width: 14, fmt: DATE },
    { header: "Reference", key: "ref", width: 22 },
    { header: "Amount (₹)", key: "a", width: 16, fmt: CURRENCY },
    { header: "Status", key: "s", width: 14 },
  ], report.payouts.rows.map((p) => [p.id, toDate(p.date), p.reference ?? "", p.amount, PAYOUT_STATUS_META[p.status].label]));

  addSheet(wb, "Packages", [
    { header: "Package", key: "n", width: 32 },
    { header: "Status", key: "s", width: 12 },
    { header: "Bookings", key: "b", width: 12 },
    { header: "Cancelled", key: "c", width: 12 },
    { header: "Travellers", key: "t", width: 12 },
    { header: "Booking value (₹)", key: "v", width: 18, fmt: CURRENCY },
    { header: "Net earnings (₹)", key: "e", width: 18, fmt: CURRENCY },
    { header: "Avg rating", key: "r", width: 12, fmt: "0.0" },
    { header: "Reviews", key: "rc", width: 10 },
  ], [...report.packages.rows].sort((a, b) => b.bookings - a.bookings).map((p) => [p.name, p.removed ? "Removed" : p.status === "active" ? "Active" : "Inactive", p.bookings, p.cancelled, p.travellers, p.bookingValue, money(p.netEarnings), p.avgRating, p.reviewCount]));

  return wb;
}

export async function exportExcel(report) {
  const wb = await buildWorkbook(report);
  const buffer = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${slug(report)}.xlsx`);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
