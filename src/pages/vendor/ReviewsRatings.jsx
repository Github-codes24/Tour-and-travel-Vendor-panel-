import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Star,
  Search,
  MessageSquareText,
  ThumbsUp,
  Clock,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CalendarDays,
} from "lucide-react";

const initialReviews = [
  {
    id: 1,
    name: "Priya Sharma",
    initials: "PS",
    packageName: "Manali Snow Escape",
    location: "Manali, Himachal Pradesh",
    daysAgo: 5,
    rating: 5,
    title: "An unforgettable trip!",
    comment:
      "Everything was organised perfectly, from the hotel to local sightseeing. The itinerary was clear and our tour coordinator was very helpful.",
    helpful: 12,
    reply: "",
  },
  {
    id: 2,
    name: "Rahul Deshmukh",
    initials: "RD",
    packageName: "Goa Weekend Getaway",
    location: "North Goa, Goa",
    daysAgo: 8,
    rating: 4,
    title: "Great experience overall",
    comment:
      "The package was good value and the hotel was clean. Pickup was slightly delayed, but the support team handled it well.",
    helpful: 8,
    reply:
      "Thank you for your feedback, Rahul. We appreciate your patience and will work to improve pickup timing.",
  },
  {
    id: 3,
    name: "Sneha Patil",
    initials: "SP",
    packageName: "Kerala Backwaters Tour",
    location: "Alleppey, Kerala",
    daysAgo: 12,
    rating: 3,
    title: "Nice destinations, some delays",
    comment:
      "The destinations were beautiful, but the schedule felt rushed on the second day. Better time planning would make this trip even better.",
    helpful: 3,
    reply: "",
  },
  {
    id: 4,
    name: "Amit Kulkarni",
    initials: "AK",
    packageName: "Rajasthan Heritage Trail",
    location: "Jaipur, Rajasthan",
    daysAgo: 16,
    rating: 5,
    title: "Excellent service",
    comment:
      "The guide was knowledgeable and the hotels matched the description. Booking and communication were smooth throughout.",
    helpful: 6,
    reply: "",
  },
  {
    id: 5,
    name: "Neha Joshi",
    initials: "NJ",
    packageName: "Ladakh Adventure",
    location: "Leh, Ladakh",
    daysAgo: 20,
    rating: 4,
    title: "Breathtaking views",
    comment:
      "The route and stays were well planned. Acclimatization day was a thoughtful touch by the team.",
    helpful: 5,
    reply: "",
  },
  {
    id: 6,
    name: "Vikram Rane",
    initials: "VR",
    packageName: "Andaman Island Escape",
    location: "Havelock, Andaman",
    daysAgo: 24,
    rating: 2,
    title: "Ferry timings were confusing",
    comment:
      "Beaches were great, but the ferry schedule changed twice and we were not informed on time.",
    helpful: 2,
    reply: "",
  },
  {
    id: 7,
    name: "Kavita Mehta",
    initials: "KM",
    packageName: "Darjeeling Tea Trails",
    location: "Darjeeling, West Bengal",
    daysAgo: 35,
    rating: 5,
    title: "Peaceful and well organised",
    comment:
      "Loved the tea estate visit and the sunrise at Tiger Hill. Driver and coordinator were both courteous.",
    helpful: 9,
    reply: "Thank you Kavita! We are glad you enjoyed the trip.",
  },
  {
    id: 8,
    name: "Sandeep Wagh",
    initials: "SW",
    packageName: "Coorg Coffee Retreat",
    location: "Madikeri, Karnataka",
    daysAgo: 41,
    rating: 4,
    title: "Good value for money",
    comment:
      "Resort was comfortable and food was excellent. Sightseeing could have had more free time.",
    helpful: 4,
    reply: "",
  },
];

const toneClasses = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
};

const dateRanges = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: Infinity },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function formatDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Returns e.g. [1, "...", 4, 5, 6, "...", 12]
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

function Stars({ rating, size = "h-4 w-4" }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </span>
  );
}

function StatCard({ label, value, helper, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function SelectBox({ value, onChange, label, children }) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100 sm:w-44"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export default function ReviewsRatings() {
  const [allReviews, setAllReviews] = useState(initialReviews);
  const [rangeFilter, setRangeFilter] = useState("Last 30 days");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All ratings");
  const [statusFilter, setStatusFilter] = useState("All reviews");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const reviews = useMemo(() => {
    const days =
      dateRanges.find((range) => range.label === rangeFilter)?.days ?? Infinity;
    return allReviews.filter((review) => review.daysAgo <= days);
  }, [allReviews, rangeFilter]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        [review.name, review.packageName, review.title, review.comment].some(
          (value) => value.toLowerCase().includes(query),
        );
      const matchesRating =
        ratingFilter === "All ratings" ||
        review.rating === Number(ratingFilter);
      const matchesStatus =
        statusFilter === "All reviews" ||
        (statusFilter === "Needs response"
          ? !review.reply
          : Boolean(review.reply));
      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const displayedPage = Math.min(currentPage, totalPages);

  const paginatedReviews = useMemo(() => {
    const start = (displayedPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, displayedPage, pageSize]);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    setExpandedId(null);
  };

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [search, ratingFilter, statusFilter, rangeFilter]);

  const publishReply = (reviewId) => {
    const reply = (replyDrafts[reviewId] || "").trim();
    if (!reply) return;
    setAllReviews((current) =>
      current.map((review) =>
        review.id === reviewId ? { ...review, reply } : review,
      ),
    );
    setReplyDrafts((current) => ({ ...current, [reviewId]: "" }));
  };

  const respondedCount = reviews.filter((review) => review.reply).length;
  const responseNeeded = reviews.length - respondedCount;
  const positiveCount = reviews.filter((review) => review.rating >= 4).length;
  const positivePercent = reviews.length
    ? Math.round((positiveCount / reviews.length) * 100)
    : 0;
  const coveragePercent = reviews.length
    ? Math.round((respondedCount / reviews.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Engagement</span>
            <span className="text-slate-300">/</span>
            <span>Reviews</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Reviews &amp; Ratings
          </h1>
          <p className="mt-2 text-slate-500">
            Monitor guest satisfaction, manage feedback and respond to
            travellers.
          </p>
        </div>
        <label className="relative inline-flex h-12 w-fit shrink-0 items-center rounded-xl border border-slate-200 bg-white shadow-sm focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100">
          <CalendarDays className="pointer-events-none absolute left-4 h-4 w-4 text-violet-700" />
          <select
            aria-label="Filter by date range"
            value={rangeFilter}
            onChange={(event) => setRangeFilter(event.target.value)}
            className="h-full appearance-none rounded-xl bg-transparent pl-11 pr-10 text-sm font-semibold text-slate-700 outline-none"
          >
            {dateRanges.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
        </label>
      </div>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Overall Rating"
          value={averageRating}
          helper="Based on guest reviews"
          icon={Star}
          tone="amber"
        />
        <StatCard
          label="Total Reviews"
          value={reviews.length}
          helper="Across all your packages"
          icon={MessageSquareText}
          tone="blue"
        />
        <StatCard
          label="Positive Reviews"
          value={`${positivePercent}%`}
          helper="Rated 4 stars or higher"
          icon={ThumbsUp}
          tone="emerald"
        />
        <StatCard
          label="Needs Response"
          value={responseNeeded}
          helper="Waiting for your reply"
          icon={Clock}
          tone="rose"
        />
      </section>

      {/* Rating breakdown + response summary */}
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Rating Breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Guest satisfaction at a glance
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">
                {averageRating}
              </p>
              <Stars rating={Math.round(Number(averageRating))} />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(
                (review) => review.rating === rating,
              ).length;
              const percent = reviews.length
                ? (count / reviews.length) * 100
                : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 whitespace-nowrap text-sm text-slate-600">
                    {rating} star
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-sm text-slate-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Response Activity
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                How well you are engaging with guests
              </p>
            </div>
            <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {responseNeeded} awaiting response
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Responses added</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {respondedCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Response coverage</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {coveragePercent}%
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-900">Quick tip</p>
            <p className="mt-1 text-sm leading-5 text-violet-800">
              Thank guests for positive feedback and answer concerns with a
              clear next step.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews table */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Guest Reviews</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search, filter and respond to package feedback.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
            <label className="relative block sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search guest, package or review..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </label>
            <SelectBox
              label="Filter by rating"
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option>All ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={String(rating)}>
                  {rating} stars
                </option>
              ))}
            </SelectBox>
            <SelectBox
              label="Filter by response status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All reviews</option>
              <option>Needs response</option>
              <option>Responded</option>
            </SelectBox>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Guest</th>
                <th className="px-4 py-4">Package</th>
                <th className="px-4 py-4">Review</th>
                <th className="px-4 py-4">Rating</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReviews.map((review) => {
                const isOpen = expandedId === review.id;
                return (
                  <Fragment key={review.id}>
                    <tr className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-bold text-violet-800">
                            {review.initials}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {review.name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {formatDate(review.daysAgo)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-semibold text-slate-900">
                          {review.packageName}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {review.location}
                        </p>
                      </td>
                      <td className="max-w-xs px-4 py-5">
                        <p className="font-medium text-slate-800">
                          {review.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {review.comment}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <Stars rating={review.rating} />
                        <p className="mt-1 text-xs text-slate-500">
                          {review.rating}/5
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium ${
                            review.reply
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {review.reply ? "Responded" : "Needs response"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isOpen ? null : review.id)
                          }
                          aria-expanded={isOpen}
                          className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                          {isOpen ? "Hide Details" : "View Details"}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={6} className="px-6 py-6">
                          <div className="max-w-3xl space-y-4">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {review.title}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {review.comment}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
                                {review.helpful} found this helpful
                              </p>
                            </div>

                            {review.reply ? (
                              <div className="rounded-xl border-l-4 border-violet-600 bg-violet-50/70 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-violet-800">
                                  Your response
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-700">
                                  {review.reply}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <textarea
                                  rows={3}
                                  value={replyDrafts[review.id] || ""}
                                  onChange={(event) =>
                                    setReplyDrafts((current) => ({
                                      ...current,
                                      [review.id]: event.target.value,
                                    }))
                                  }
                                  placeholder="Write a polite response to this guest..."
                                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                                />
                                <button
                                  type="button"
                                  onClick={() => publishReply(review.id)}
                                  disabled={
                                    !(replyDrafts[review.id] || "").trim()
                                  }
                                  className="rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Publish response
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <MessageSquareText className="mx-auto h-9 w-9 text-slate-300" />
                    <h3 className="mt-3 font-semibold text-slate-900">
                      No reviews found
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredReviews.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              <p>
                Showing{" "}
                <span className="font-semibold tabular-nums text-slate-800">
                  {(displayedPage - 1) * pageSize + 1}–
                  {Math.min(displayedPage * pageSize, filteredReviews.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold tabular-nums text-slate-800">
                  {filteredReviews.length}
                </span>{" "}
                reviews
              </p>

              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

              <p>
                {responseNeeded} need response · {reviews.length} total
              </p>

              <label className="flex items-center gap-2">
                <span>Rows per page</span>
                <span className="relative">
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                      setExpandedId(null);
                    }}
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 text-sm font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
                </span>
              </label>
            </div>

            <nav
              className="flex flex-wrap items-center gap-2"
              aria-label="Pagination"
            >
              <button
                type="button"
                disabled={displayedPage === 1}
                onClick={() => goToPage(displayedPage - 1)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              {getPageNumbers(displayedPage, totalPages).map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="flex h-10 w-6 items-center justify-center text-sm text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={page === displayedPage ? "page" : undefined}
                    className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold tabular-nums transition ${
                      page === displayedPage
                        ? "border-violet-700 bg-violet-700 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={displayedPage === totalPages}
                onClick={() => goToPage(displayedPage + 1)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white"
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        )}
      </section>
    </div>
  );
}