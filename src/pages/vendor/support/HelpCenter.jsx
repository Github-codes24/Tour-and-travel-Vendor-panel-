import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, Plus, LifeBuoy } from "lucide-react";

const faqs = [
  {
    category: "Booking",
    question: "How can I view my bookings?",
    answer:
      "Open Bookings from your Vendor Panel sidebar. Select a booking to view its details and current status.",
  },
  {
    category: "Booking",
    question: "How can I handle a booking issue?",
    answer:
      "Open Support Center, create a ticket under Booking Issues, and include the relevant booking reference and a clear description.",
  },
  {
    category: "Booking",
    question: "What should I do if booking details are incorrect?",
    answer:
      "Review the booking details and raise a support ticket with the booking reference and the information that needs correction.",
  },
  {
    category: "Payments & Payouts",
    question: "How can I check my earnings?",
    answer:
      "Open Earnings & Payouts in your Vendor Panel to review the financial information available for your account.",
  },
  {
    category: "Payments & Payouts",
    question: "How do I request an advance payment?",
    answer:
      "Contact the platform support team to confirm whether an advance payment is supported and what eligibility requirements apply.",
  },
  {
    category: "Payments & Payouts",
    question: "When will I receive my final payout?",
    answer:
      "Payout timing depends on the platform's actual payout policy and your transaction status. Check your payout details or contact support for confirmation.",
  },
  {
    category: "Payments & Payouts",
    question: "Why is my payout pending or on hold?",
    answer:
      "A payout may require additional verification or transaction review. Check your payout status and raise a ticket if you need clarification.",
  },
  {
    category: "Packages",
    question: "Why was my package rejected?",
    answer:
      "Review the package's approval status and any feedback provided by the platform. If the reason is unclear, contact support with the package reference.",
  },
  {
    category: "Packages",
    question: "How can I update package information?",
    answer:
      "Open My Packages, select the relevant package, and use the available edit options. Some changes may require approval.",
  },
  {
    category: "Packages",
    question: "How do I check package approval status?",
    answer:
      "Open My Packages and check the package's current publication or approval status.",
  },
  {
    category: "Documents & Verification",
    question: "Why is my document pending verification?",
    answer:
      "Your submitted documents may still be under review. Check Business Profile & Verification for the latest status.",
  },
  {
    category: "Documents & Verification",
    question: "What should I do if a document is rejected?",
    answer:
      "Review the rejection reason shown in your verification section, correct the issue, and upload a replacement if the platform allows it.",
  },
  {
    category: "Documents & Verification",
    question: "How can I upload a replacement document?",
    answer:
      "Open Business Profile & Verification and use the replacement or re-upload option available for the relevant document.",
  },
  {
    category: "Account",
    question: "How can I update my business profile?",
    answer:
      "Open Business Profile in your Vendor Panel and update the fields that are editable for your account.",
  },
  {
    category: "Account",
    question: "How can I change my payout bank details?",
    answer:
      "Use the platform's approved payout or verification workflow. Additional verification may be required before changes are accepted.",
  },
];

const categories = [
  "All",
  "Booking",
  "Payments & Payouts",
  "Packages",
  "Documents & Verification",
  "Account",
];

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        category === "All" || faq.category === category;

      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 text-white sm:px-10">
        <p className="text-sm font-semibold text-teal-300">Vendor resources</p>
        <h1 className="mt-2 text-3xl font-bold">Help Center</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Find answers about bookings, packages, verification, and payouts.
        </p>

        <div className="relative mt-6 max-w-2xl">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setExpanded(null);
            }}
            placeholder="Search help articles..."
            aria-label="Search help articles"
            className="w-full rounded-xl border border-slate-700 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => {
              setCategory(item);
              setExpanded(null);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              category === item
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-800"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredFaqs.length} article{filteredFaqs.length === 1 ? "" : "s"} found
          </p>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="p-10 text-center">
            <Search className="mx-auto text-slate-400" size={30} />
            <h3 className="mt-3 font-semibold text-slate-800">
              No matching articles
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try another search or contact the support team.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFaqs.map((faq) => {
              const isOpen = expanded === faq.question;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setExpanded(isOpen ? null : faq.question)
                    }
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left hover:bg-slate-50"
                  >
                    <span>
                      <span className="mb-1 block text-xs font-semibold text-teal-700">
                        {faq.category}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {faq.question}
                      </span>
                    </span>
                    <ChevronDown
                      size={19}
                      className={`shrink-0 text-slate-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-sm leading-6 text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-white p-3 text-teal-700">
            <LifeBuoy size={23} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">
              Still need help?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Create a support ticket and explain your issue to the team.
            </p>
          </div>
        </div>

        <Link
          to="/vendor/support/create"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Plus size={17} /> Create Ticket
        </Link>
      </section>
    </div>
  );
}