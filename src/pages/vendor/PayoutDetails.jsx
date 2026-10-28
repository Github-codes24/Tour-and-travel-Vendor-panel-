import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  UserRound,
  CircleAlert,
} from "lucide-react";

const transactions = [
  {
    id: "PAY-2026-001",
    bookingId: "BK-2041",
    customer: "Aarav Patil",
    email: "aarav.patil@example.com",
    phone: "+91 98765 43210",
    packageName: "Goa Beach Holiday",
    destination: "Goa, India",
    travelDate: "2026-10-25",
    date: "2026-10-25",
    travellers: 2,
    amount: 25998,
    commission: 2600,
    netAmount: 23398,
    method: "Bank Transfer",
    status: "Paid",
    reference: "UTR829103456",
    bank: "HDFC Bank",
    account: "XXXX XXXX 4821",
    accountHolder: "Travel Vendor",
    notes: "Settlement completed successfully.",
  },
  {
    id: "PAY-2026-002",
    bookingId: "BK-2042",
    customer: "Priya Deshmukh",
    email: "priya.deshmukh@example.com",
    phone: "+91 98765 12345",
    packageName: "Kerala Backwater Escape",
    destination: "Alappuzha, Kerala",
    travelDate: "2026-11-02",
    date: "2026-10-24",
    travellers: 3,
    amount: 38997,
    commission: 3900,
    netAmount: 35097,
    method: "Bank Transfer",
    status: "Pending",
    reference: "Pending",
    bank: "HDFC Bank",
    account: "XXXX XXXX 4821",
    accountHolder: "Travel Vendor",
    notes: "Awaiting payout processing.",
  },
  {
    id: "PAY-2026-003",
    bookingId: "BK-2038",
    customer: "Rohan Kulkarni",
    email: "rohan.kulkarni@example.com",
    phone: "+91 98765 87654",
    packageName: "Manali Mountain Retreat",
    destination: "Manali, Himachal Pradesh",
    travelDate: "2026-11-05",
    date: "2026-10-22",
    travellers: 2,
    amount: 31998,
    commission: 3200,
    netAmount: 28798,
    method: "Bank Transfer",
    status: "Processing",
    reference: "UTR829103111",
    bank: "HDFC Bank",
    account: "XXXX XXXX 4821",
    accountHolder: "Travel Vendor",
    notes: "Settlement is being processed.",
  },
  {
    id: "PAY-2026-004",
    bookingId: "BK-2033",
    customer: "Sneha Joshi",
    email: "sneha.joshi@example.com",
    phone: "+91 98765 65432",
    packageName: "Rajasthan Heritage Tour",
    destination: "Jaipur, Rajasthan",
    travelDate: "2026-11-12",
    date: "2026-10-20",
    travellers: 2,
    amount: 19998,
    commission: 2000,
    netAmount: 17998,
    method: "Bank Transfer",
    status: "Paid",
    reference: "UTR829102678",
    bank: "HDFC Bank",
    account: "XXXX XXXX 4821",
    accountHolder: "Travel Vendor",
    notes: "Settlement completed successfully.",
  },
  {
    id: "PAY-2026-005",
    bookingId: "BK-2028",
    customer: "Karan Mehta",
    email: "karan.mehta@example.com",
    phone: "+91 98765 11111",
    packageName: "Goa Beach Holiday",
    destination: "Goa, India",
    travelDate: "2026-11-15",
    date: "2026-10-18",
    travellers: 1,
    amount: 12999,
    commission: 1300,
    netAmount: 11699,
    method: "Bank Transfer",
    status: "Failed",
    reference: "Not generated",
    bank: "HDFC Bank",
    account: "XXXX XXXX 4821",
    accountHolder: "Travel Vendor",
    notes:
      "Payout failed in the sample records. Verify with the payment provider.",
  },
  {
    id: "PAY-2026-006",
    bookingId: "BK-2021",
    customer: "Neha Sharma",
    email: "neha.sharma@example.com",
    phone: "+91 98765 22222",
    packageName: "Kerala Backwater Escape",
    destination: "Alappuzha, Kerala",
    travelDate: "2026-11-20",
    date: "2026-10-15",
    travellers: 2,
    amount: 25998,
    commission: 2600,
    netAmount: 23398,
    method: "Bank Transfer",
    status: "Paid",
    reference: "UTR829101934",
    bank: "HDFC Bank",
    account: "XXXX XXXX 4821",
    accountHolder: "Travel Vendor",
    notes: "Settlement completed successfully.",
  },
];

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Processing: "bg-blue-50 text-blue-700 ring-blue-200",
  Failed: "bg-red-50 text-red-700 ring-red-200",
};

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function dateLabel(value) {
  if (!value) return "Not available";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function DetailCard({ label, value, icon: Icon }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-violet-700">
          <Icon size={17} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-900">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
}

export default function PayoutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const payout = transactions.find((item) => item.id === id);

  if (!payout) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <CircleAlert className="mx-auto text-amber-600" size={36} />
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          Payout not found
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          This payout ID does not match the available records.
        </p>
        <button
          type="button"
          onClick={() => navigate("/vendor/earnings")}
          className="mt-5 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
        >
          Back to Earnings
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 pb-8">
      <button
        type="button"
        onClick={() => navigate("/vendor/earnings")}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-violet-700"
      >
        <ArrowLeft size={17} />
        Earnings & Payouts
      </button>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
              Payout transaction
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {payout.id}
              </h1>
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[payout.status]}`}
              >
                {payout.status === "Paid" ? (
                  <CheckCircle2 size={14} />
                ) : payout.status === "Failed" ? (
                  <CircleAlert size={14} />
                ) : (
                  <Clock3 size={14} />
                )}
                {payout.status}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-500">
              Booking reference{" "}
              <span className="font-semibold text-slate-700">
                {payout.bookingId}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-xl bg-slate-50 px-3.5 py-2.5 sm:self-center">
            <CalendarDays size={16} className="text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Payout date
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {dateLabel(payout.date)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-medium text-slate-500">
              Gross booking amount
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">
              {money(payout.amount)}
            </p>
          </div>

          <div className="bg-red-50 px-5 py-4 sm:px-6">
            <p className="text-xs font-medium text-red-700">
              Platform commission
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-red-700">
              − {money(payout.commission)}
            </p>
          </div>

          <div className="bg-violet-50/70 px-5 py-4 sm:px-6">
            <p className="text-xs font-medium text-violet-800">
              Net payout amount
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-violet-800">
              {money(payout.netAmount)}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="font-bold text-slate-900">Booking details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Customer and travel information associated with this settlement.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
          <DetailCard
            label="Customer name"
            value={payout.customer}
            icon={UserRound}
          />
          <DetailCard label="Customer email" value={payout.email} icon={Mail} />
          <DetailCard
            label="Customer phone"
            value={payout.phone}
            icon={Phone}
          />
          <DetailCard
            label="Tour package"
            value={payout.packageName}
            icon={FileText}
          />
          <DetailCard
            label="Destination"
            value={payout.destination}
            icon={MapPin}
          />
          <DetailCard
            label="Number of travellers"
            value={payout.travellers}
            icon={Users}
          />
          <DetailCard
            label="Travel departure"
            value={dateLabel(payout.travelDate)}
            icon={CalendarDays}
          />
          <DetailCard
            label="Booking reference"
            value={payout.bookingId}
            icon={FileText}
          />
          <DetailCard
            label="Transaction date"
            value={dateLabel(payout.date)}
            icon={CalendarDays}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="font-bold text-slate-900">Settlement details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Payment method, destination account and settlement reference.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
          <DetailCard
            label="Payment method"
            value={payout.method}
            icon={CreditCard}
          />
          <DetailCard
            label="Transaction reference"
            value={payout.reference}
            icon={FileText}
          />
          <DetailCard
            label="Settlement bank"
            value={payout.bank}
            icon={Building2}
          />
          <DetailCard
            label="Beneficiary account"
            value={payout.account}
            icon={CreditCard}
          />
          <DetailCard
            label="Account holder"
            value={payout.accountHolder}
            icon={ShieldCheck}
          />
          <DetailCard
            label="Settlement status"
            value={payout.status}
            icon={CheckCircle2}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
            <FileText size={17} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Transaction notes</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {payout.notes}
            </p>
          </div>
        </div>

        {payout.status === "Failed" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            This record is marked as failed in the demo data. Confirm the real
            payment provider's status before retrying a settlement.
          </div>
        )}
      </section>
    </div>
  );
}
