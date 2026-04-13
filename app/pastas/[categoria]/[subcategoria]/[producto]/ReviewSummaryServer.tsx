import { FirebaseService } from "@/lib/firebase-service"

export default async function ReviewSummaryServer({ productId }: { productId: string }) {
  try {
    const { avgRating, total } = await FirebaseService.getReviewSummary(productId)

    if (total === 0) return null

    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="flex" aria-label={`Rating: ${avgRating.toFixed(1)} de 5`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${star <= Math.round(avgRating) ? "text-yellow-400 fill-current" : "text-neutral-300 fill-current"}`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm font-medium text-neutral-700">{avgRating.toFixed(1)}</span>
        <span className="text-sm text-neutral-500">({total} {total === 1 ? "opinión" : "opiniones"})</span>
      </div>
    )
  } catch {
    return null
  }
}