import { useMemo, useState } from "react";
import {
  Star,
  Search,
  MessageSquareText,
  ThumbsUp,
  CalendarDays,
  MapPin,
  ChevronDown,
  Filter,
} from "lucide-react";

const initialReviews = [
  {
    id: 1,
    name: "Priya Sharma",
    initials: "PS",
    packageName: "Manali Snow Escape",
    location: "Manali, Himachal Pradesh",
    date: "Oct 22, 2026",
    rating: 5,
    title: "An unforgettable trip!",
    comment:
      "Everything was organised perfectly, from the hotel to local sightseeing. The itinerary was clear and our tour coordinator was very helpful.",
    status: "Published",
    helpful: 12,
    reply: "",
  },
  {
    id: 2,
    name: "Rahul Deshmukh",
    initials: "RD",
    packageName: "Goa Weekend Getaway",
    location: "North Goa, Goa",
    date: "Oct 19, 2026",
    rating: 4,
    title: "Great experience overall",
    comment:
      "The package was good value and the hotel was clean. Pickup was slightly delayed, but the support team handled it well.",
    status: "Published",
    helpful: 8,
    reply: "Thank you for your feedback, Rahul. We appreciate your patience and will work to improve pickup timing.",
  },
  {
    id: 3,
    name: "Sneha Patil",
    initials: "SP",
    packageName: "Kerala Backwaters Tour",
    location: "Alleppey, Kerala",
    date: "Oct 15, 2026",
    rating: 3,
    title: "Nice destinations, some delays",
    comment:
      "The destinations were beautiful, but the schedule felt rushed on the second day. Better time planning would make this trip even better.",
    status: "Needs response",
    helpful: 3,
    reply: "",
  },
  {
    id: 4,
    name: "Amit Kulkarni",
    initials: "AK",
    packageName: "Rajasthan Heritage Trail",
    location: "Jaipur, Rajasthan",
    date: "Oct 11, 2026",
    rating: 5,
    title: "Excellent service",
    comment:
      "The guide was knowledgeable and the hotels matched the description. Booking and communication were smooth throughout.",
    status: "Published",
    helpful: 6,
    reply: "",
  },
];

const ratingLabel = (rating) => `${rating}.0 out of 5`;

function Stars({ rating, size = "h-4 w-4" }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={ratingLabel(rating)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </span>
  );
}

function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <span className="rounded-xl bg-teal-50 p-3 text-teal-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export default function ReviewsRatings() {
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All ratings");
  const [statusFilter, setStatusFilter] = useState("All reviews");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        [review.name, review.packageName, review.title, review.comment]
          .some((value) => value.toLowerCase().includes(query));
      const matchesRating = ratingFilter === "All ratings" || review.rating === Number(ratingFilter);
      const matchesStatus =
        statusFilter === "All reviews" ||
        (statusFilter === "Needs response" ? !review.reply : Boolean(review.reply));
      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const publishReply = (reviewId) => {
    const reply = (replyDrafts[reviewId] || "").trim();
    if (!reply) return;
    setReviews((current) =>
      current.map((review) => (review.id === reviewId ? { ...review, reply } : review))
    );
    setReplyDrafts((current) => ({ ...current, [reviewId]: "" }));
    setReplyingTo(null);
  };

  const publishedCount = reviews.filter((review) => review.reply).length;
  const responseNeeded = reviews.filter((review) => !review.reply).length;
  const positiveCount = reviews.filter((review) => review.rating >= 4).length;
  const positivePercent = reviews.length ? Math.round((positiveCount / reviews.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Vendor Portal</span>
              <span className="text-slate-300">/</span>
              <span>Engagement</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reviews &amp; Ratings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Monitor guest satisfaction, manage feedback, and build trust with every response.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
            <CalendarDays className="h-4 w-4 text-teal-700" />
            Last 30 days
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Overall rating" value={averageRating} helper="Based on guest reviews" icon={Star} />
          <StatCard label="Total reviews" value={reviews.length} helper="Across all your packages" icon={MessageSquareText} />
          <StatCard label="Positive reviews" value={`${positivePercent}%`} helper="Rated 4 stars or higher" icon={ThumbsUp} />
          <StatCard label="Needs response" value={responseNeeded} helper="Keep guests feeling heard" icon={Filter} />
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Rating breakdown</h2>
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
                    <span className="w-8 text-sm text-slate-600">{rating} star</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-7 text-right text-sm text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl bg-teal-50 p-4">
              <p className="text-sm font-semibold text-teal-900">Quick tip</p>
              <p className="mt-1 text-sm leading-5 text-teal-800">
                Reply to every review professionally. Thank guests for positive feedback and address concerns with a clear next step.
              </p>
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold text-slate-900">Review activity</h2>
                <p className="mt-1 text-sm text-slate-500">Recent feedback from your travellers</p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {responseNeeded} awaiting response
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Responses added</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{publishedCount}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Response coverage</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {reviews.length ? Math.round((publishedCount / reviews.length) * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-100 p-4">
              <span className="rounded-lg bg-teal-50 p-2 text-teal-700">
                <MessageSquareText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Make every response count</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Personalised replies help build trust and show future travellers that you value their experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex min-w-0 flex-col justify-between gap-4 2xl:flex-row 2xl:items-center">
              <div>
                <h2 className="font-semibold text-slate-900">Guest reviews</h2>
                <p className="mt-1 text-sm text-slate-500">Search, filter, and respond to package feedback.</p>
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 2xl:flex">
                <label className="relative block sm:min-w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search reviews..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <select
                  value={ratingFilter}
                  onChange={(event) => setRatingFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600"
                  aria-label="Filter by rating"
                >
                  <option>All ratings</option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={String(rating)}>{rating} stars</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600"
                  aria-label="Filter by response status"
                >
                  <option>All reviews</option>
                  <option>Needs response</option>
                  <option>Responded</option>
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <article key={review.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                    {review.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col justify-between gap-3 lg:flex-row">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{review.name}</h3>
                          <Stars rating={review.rating} />
                          <span className="text-xs text-slate-500">{review.rating}/5</span>
                        </div>
                        <p className="mt-1 font-medium text-slate-800">{review.title}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {review.date}
                        <span className={`rounded-full px-2.5 py-1 font-medium ${
                          review.reply
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {review.reply ? "Responded" : "Needs response"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {review.location}
                      </span>
                      <span className="font-medium text-slate-700">{review.packageName}</span>
                      <span>{review.helpful} found this helpful</span>
                    </div>

                    {review.reply && (
                      <div className="mt-4 rounded-xl border-l-4 border-teal-600 bg-teal-50/70 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-teal-800">Your response</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{review.reply}</p>
                      </div>
                    )}

                    {!review.reply && (
                      <div className="mt-4">
                        {replyingTo === review.id ? (
                          <div className="space-y-3">
                            <textarea
                              rows={3}
                              value={replyDrafts[review.id] || ""}
                              onChange={(event) =>
                                setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))
                              }
                              placeholder="Write a polite response to this guest..."
                              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => publishReply(review.id)}
                                disabled={!(replyDrafts[review.id] || "").trim()}
                                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Publish response
                              </button>
                              <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReplyingTo(review.id)}
                            className="rounded-lg border border-teal-200 px-3.5 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                          >
                            Write a response
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {filteredReviews.length === 0 && (
              <div className="px-6 py-14 text-center">
                <MessageSquareText className="mx-auto h-9 w-9 text-slate-300" />
                <h3 className="mt-3 font-semibold text-slate-900">No reviews found</h3>
                <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center">
            <span>Showing {filteredReviews.length} of {reviews.length} reviews</span>
            <span className="text-xs">Demo data · Replies are stored in component state only</span>
          </div>
        </section>
      </div>
    </main>
  );
}
