/** The fields a source write carries when production sends it to review. */
interface ReviewFields {
  review_required?: boolean;
  pr_url?: string | null;
  review_branch?: string | null;
}

/** True when the engine saved the write on a review branch and main is unchanged. */
export const awaitsReview = (response: ReviewFields | undefined): boolean =>
  response?.review_required === true;

const isWebAddress = (url: string | null | undefined): url is string =>
  typeof url === 'string' && /^https?:\/\//i.test(url);

export const AwaitingReviewNote = ({
  detail,
  review,
}: {
  detail?: string;
  review: ReviewFields;
}) => (
  <>
    {detail && <p className="m-0">{detail}</p>}
    {isWebAddress(review.pr_url) ? (
      <a href={review.pr_url} target="_blank" rel="noopener noreferrer">
        Open the review request
      </a>
    ) : review.review_branch ? (
      <p className="m-0">Review branch: {review.review_branch}</p>
    ) : null}
  </>
);
