import { Fragment, useMemo, useState } from "react";
import {
  Star,
  Search,
  MessageSquareText,
  ThumbsUp,
  Clock,
  MapPin,
  ChevronDown,
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

function formatDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Stars({ rating, size = "h-4 w-4" }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
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
        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:w-44"
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

  const reviews = useMemo(() => {
    const days = dateRanges.find((range) => range.label === rangeFilter)?.days ?? Infinity;
    return allReviews.filter((review) => review.daysAgo <= days);
  }, [allReviews, rangeFilter]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        [review.name, review.packageName, review.title, review.comment].some((value) =>
          value.toLowerCase().includes(query)
        );
      const matchesRating =
        ratingFilter === "All ratings" || review.rating === Number(ratingFilter);
      const matchesStatus =
        statusFilter === "All reviews" ||
        (statusFilter === "Needs response" ? !review.reply : Boolean(review.reply));
      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const publishReply = (reviewId) => {
    const reply = (replyDrafts[reviewId] || "").trim();
    if (!reply) return;
    setAllReviews((current) =>
      current.map((review) => (review.id === reviewId ? { ...review, reply } : review))
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reviews &amp; Ratings</h1>
        <p className="mt-2 text-slate-500">
          Monitor guest satisfaction, manage feedback and respond to travellers.
        </p>
      </div>
      <label className="relative inline-flex h-12 w-fit shrink-0 items-center rounded-xl border border-slate-200 bg-white shadow-sm focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
        <CalendarDays className="pointer-events-none absolute left-4 h-4 w-4 text-teal-700" />
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
              <h2 className="text-lg font-bold text-slate-900">Rating Breakdown</h2>
              <p className="mt-1 text-sm text-slate-500">Guest satisfaction at a glance</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">{averageRating}</p>
              <Stars rating={Math.round(Number(averageRating))} />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((review) => review.rating === rating).length;
              const percent = reviews.length ? (count / reviews.length) * 100 : 0;
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
                  <span className="w-6 shrink-0 text-right text-sm text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Response Activity</h2>
              <p className="mt-1 text-sm text-slate-500">How well you are engaging with guests</p>
            </div>
            <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {responseNeeded} awaiting response
            </span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Responses added</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{respondedCount}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Response coverage</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{coveragePercent}%</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-teal-50 p-4">
            <p className="text-sm font-semibold text-teal-900">Quick tip</p>
            <p className="mt-1 text-sm leading-5 text-teal-800">
              Thank guests for positive feedback and answer concerns with a clear next step.
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
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
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
              {filteredReviews.map((review) => {
                const isOpen = expandedId === review.id;
                return (
                  <Fragment key={review.id}>
                    <tr className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                            {review.initials}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{review.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{formatDate(review.daysAgo)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-semibold text-slate-900">{review.packageName}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {review.location}
                        </p>
                      </td>
                      <td className="max-w-xs px-4 py-5">
                        <p className="font-medium text-slate-800">{review.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{review.comment}</p>
                      </td>
                      <td className="px-4 py-5">
                        <Stars rating={review.rating} />
                        <p className="mt-1 text-xs text-slate-500">{review.rating}/5</p>
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
                          onClick={() => setExpandedId(isOpen ? null : review.id)}
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
                              <p className="font-semibold text-slate-900">{review.title}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {review.comment}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
                                {review.helpful} found this helpful
                              </p>
                            </div>

                            {review.reply ? (
                              <div className="rounded-xl border-l-4 border-teal-600 bg-teal-50/70 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
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
                                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />
                                <button
                                  type="button"
                                  onClick={() => publishReply(review.id)}
                                  disabled={!(replyDrafts[review.id] || "").trim()}
                                  className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <h3 className="mt-3 font-semibold text-slate-900">No reviews found</h3>
                    <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500 sm:flex-row sm:items-center">
          <span>
            Showing {filteredReviews.length} of {reviews.length} reviews
          </span>
          <span className="text-xs">Demo data. Replies are stored in component state only.</span>
        </div>
      </section>
    </div>
  );
}