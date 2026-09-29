import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import toast from "react-hot-toast";
import {
  FiStar,
  FiEdit2,
  FiTrash2,
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
  FiSend,
  FiX,
  FiLoader,
  FiSmile,
} from "react-icons/fi";

const ProductReviews = ({ productId }) => {
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // =====================================================
  // REVIEWS
  // =====================================================

  const [reviews, setReviews] = useState([]);
const [imagePreviews, setImagePreviews] =
  useState([]);

const [selectedImageIndex, setSelectedImageIndex] =
  useState(null);
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });

  const [userRating, setUserRating] = useState(null);

  const [canReview, setCanReview] = useState(false);
const [hasReviewed, setHasReviewed] = useState(false);
const [deliveredPurchase, setDeliveredPurchase] =
  useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // REVIEW MODAL
  // =====================================================

  const [reviewModalOpen, setReviewModalOpen] =
    useState(false);

  const [editingReview, setEditingReview] =
    useState(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    images: [],
  });

  // =====================================================
  // REPLY MODAL
  // =====================================================

  const [replyModalOpen, setReplyModalOpen] =
    useState(false);

  const [replyReview, setReplyReview] = useState(null);

  const [editingReply, setEditingReply] =
    useState(null);

  const [replyForm, setReplyForm] = useState({
    comment: "",
  });

  // =====================================================
  // EMOJI PICKER
  // =====================================================

  const [emojiPicker, setEmojiPicker] = useState(null);

  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😎",
    "🤩",
    "🥳",
    "😢",
    "😭",
    "😡",
    "🤬",
    "😱",
    "😮",
    "😴",
    "🤔",
    "👍",
    "👎",
    "👏",
    "🙌",
    "🙏",
    "❤️",
    "🔥",
    "⭐",
    "✨",
    "💯",
    "🎉",
    "👌",
  ];

  // =====================================================
  // REPLY EXPANSION
  // =====================================================

  const [expandedReplies, setExpandedReplies] =
    useState({});

  // =====================================================
  // PAGINATION
  // =====================================================

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] =
    useState(false);

  // =====================================================
  // CURRENT USER ID
  // =====================================================

  const currentUserId = useMemo(() => {
  if (!user) return null;

  return (
    user._id ||
    user.id ||
    user.userId ||
    null
  )?.toString();
}, [user]);

  // =====================================================
  // AUTH CHECK
  // =====================================================

  const isLoggedIn = () => {
    return (
      isAuthenticated ||
      !!localStorage.getItem("token")
    );
  };

  // =====================================================
  // FETCH REVIEWS
  // =====================================================

  const fetchReviews = async (
    pageNumber = 1,
    append = false
  ) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await axiosInstance.get(
        `/reviews/product/${productId}?page=${pageNumber}&limit=10`
      );

      const data = response.data;

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Failed to fetch reviews"
        );
      }

      if (append) {
        setReviews((prev) => [
          ...prev,
          ...(data.reviews || []),
        ]);
      } else {
        setReviews(data.reviews || []);
      }

      setSummary(
        data.summary || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        }
      );

      // Backend se current user's product rating
      setUserRating(
        data.userRating ?? null
      );

      setCanReview(
  data.canReview === true
);

setHasReviewed(
  data.hasReviewed === true
);

setDeliveredPurchase(
  data.deliveredPurchase === true
);

      setPage(pageNumber);

      setHasMore(
        data.pagination?.hasMore || false
      );
    } catch (error) {
      console.error(
        "Fetch reviews error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load reviews"
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    if (!productId) return;

    setReviews([]);
    setPage(1);
    setUserRating(null);
    setExpandedReplies({});

    fetchReviews(1, false);
  }, [productId]);


 

  // =====================================================
  // IS OWN REVIEW
  // =====================================================

  const isOwnReview = (review) => {
  if (!currentUserId || !review) {
    return false;
  }

  const reviewUserId =
    review.user?._id ||
    review.user?.id ||
    review.user?.userId ||
    review.userId ||
    review.user;
    console.log("REVIEW OWNERSHIP:", {
    currentUserId,
    reviewUserId,
    reviewUser: review.user,
    isOwn:
      reviewUserId &&
      String(reviewUserId) ===
        String(currentUserId),
  });

  if (!reviewUserId) {
    return false;
  }

  return (
    String(reviewUserId) ===
    String(currentUserId)
  );
};

  // =====================================================
  // IS OWN REPLY
  // =====================================================

  const isOwnReply = (reply) => {
  if (!currentUserId || !reply) {
    return false;
  }

  const replyUserId =
    reply.user?._id ||
    reply.user?.id ||
    reply.user?.userId ||
    reply.userId ||
    reply.user;

  if (!replyUserId) {
    return false;
  }

  return (
    String(replyUserId) ===
    String(currentUserId)
  );
};

  // =====================================================
  // STAR COMPONENT
  // =====================================================

  const Stars = ({
    rating = 0,
    interactive = false,
    onChange,
    size = "text-base",
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= rating;

          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                onClick={() =>
                  onChange(star)
                }
                className="transition-transform hover:scale-110"
                aria-label={`Rate ${star} star`}
              >
                <FiStar
                  className={`${size} ${
                    filled
                      ? "fill-[#FFB000] text-[#FFB000]"
                      : "text-[#C9C5BC]"
                  }`}
                />
              </button>
            );
          }

          return (
            <FiStar
              key={star}
              className={`${size} ${
                filled
                  ? "fill-[#FFB000] text-[#FFB000]"
                  : "text-[#D5D1C8]"
              }`}
            />
          );
        })}
      </div>
    );
  };

  // =====================================================
  // EMOJI INSERT HELPER
  // =====================================================

  const insertEmoji = (emoji, type) => {
    if (type === "review") {
      setReviewForm((prev) => ({
        ...prev,
        comment: `${prev.comment}${emoji}`,
      }));
    }

    if (type === "reply") {
      setReplyForm((prev) => ({
        ...prev,
        comment: `${prev.comment}${emoji}`,
      }));
    }

    setEmojiPicker(null);
  };


// =====================================================
// REVIEW IMAGE SELECT
// =====================================================

const handleReviewImages = (e) => {
  const files = Array.from(
    e.target.files || []
  );

  if (!files.length) return;

  if (
    reviewForm.images.length +
      files.length >
    5
  ) {
    toast.error(
      "You can upload maximum 5 images"
    );

    e.target.value = "";
    return;
  }

  const validFiles = files.filter((file) => {
    if (!file.type.startsWith("image/")) {
      toast.error(
        `${file.name} is not a valid image`
      );
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        `${file.name} is larger than 5MB`
      );
      return false;
    }

    return true;
  });

  const newImages = [
    ...reviewForm.images,
    ...validFiles,
  ];

  setReviewForm((prev) => ({
    ...prev,
    images: newImages,
  }));

  setImagePreviews(
    newImages.map((file) =>
      URL.createObjectURL(file)
    )
  );

  e.target.value = "";
};

  // =====================================================
  // OPEN CREATE REVIEW
  // =====================================================

  const openCreateReview = () => {
  if (!isLoggedIn()) {
    toast.error(
      "Please login to write a review"
    );

    navigate("/login");
    return;
  }

  if (!deliveredPurchase) {
    toast.error(
      "You can review this product after your order is delivered."
    );
    return;
  }

  if (hasReviewed) {
    toast.error(
      "You have already reviewed this product."
    );
    return;
  }

  if (!canReview) {
    toast.error(
      "You are not eligible to review this product yet."
    );
    return;
  }

  setEditingReview(null);

  setReviewForm({
  rating: 5,
  title: "",
  comment: "",
  images: [],
});

  setImagePreviews([]);
  setEmojiPicker(null);
  setReviewModalOpen(true);
};
  // =====================================================
  // OPEN EDIT REVIEW
  // =====================================================

  const openEditReview = (review) => {
    if (!isLoggedIn()) {
      toast.error(
        "Please login to edit your review"
      );

      navigate("/login");
      return;
    }

    setEditingReview(review);

    setReviewForm({
      rating: userRating ?? 5,
      title: review.title || "",
      comment: review.comment || "",
      images:[],
    });
setImagePreviews(
  review.images || []
);
    setEmojiPicker(null);
    setReviewModalOpen(true);
  };

  // =====================================================
  // CLOSE REVIEW MODAL
  // =====================================================

  const closeReviewModal = () => {
    if (submitting) return;

    setReviewModalOpen(false);
    setEditingReview(null);
    setEmojiPicker(null);

    setReviewForm({
      rating: 5,
      title: "",
      comment: "",
      images:[],
    });
    setImagePreviews([]);
  };

  // =====================================================
  // SUBMIT / UPDATE REVIEW
  // =====================================================

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewForm.comment.trim()) {
      toast.error(
        "Please write your review"
      );
      return;
    }

    // First rating required
    // Rating is required for every new review
if (
  !editingReview &&
  (reviewForm.rating < 1 ||
    reviewForm.rating > 5)
) {
  toast.error(
    "Please select a rating"
  );
  return;
}

    try {
      setSubmitting(true);

      // =================================================
      // UPDATE REVIEW
      // =================================================

      if (editingReview) {
       const formData = new FormData();

formData.append(
  "title",
  reviewForm.title.trim()
);

formData.append(
  "comment",
  reviewForm.comment.trim()
);

reviewForm.images.forEach((file) => {
  formData.append("images", file);
});

await axiosInstance.put(
  `/reviews/${editingReview._id}`,
  formData
);

        toast.success(
          "Review updated successfully"
        );
      }

      // =================================================
      // CREATE REVIEW
      // =================================================

      else {
  const formData = new FormData();

  formData.append(
    "title",
    reviewForm.title.trim()
  );

  formData.append(
    "comment",
    reviewForm.comment.trim()
  );

  // Rating only for first rating
  // Rating is required for every new review
formData.append(
  "rating",
  reviewForm.rating
);

  // Images
  reviewForm.images.forEach((file) => {
    formData.append("images", file);
  });

  await axiosInstance.post(
    `/reviews/product/${productId}`,
    formData
  );

  if (userRating === null) {
    setUserRating(
      reviewForm.rating
    );
  }

  toast.success(
    "Review submitted successfully"
  );
}

      closeReviewModal();

      await fetchReviews(1, false);
    } catch (error) {
      console.error(
        "Review submit error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to save review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE REVIEW
  // =====================================================

  const handleDeleteReview = async (
    reviewId
  ) => {
    if (!isLoggedIn()) {
      toast.error(
        "Please login to delete your review"
      );

      navigate("/login");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete your review?"
      );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      await axiosInstance.delete(
        `/reviews/${reviewId}`
      );

      toast.success(
        "Review deleted successfully"
      );

      await fetchReviews(1, false);
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to delete review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // TOGGLE REPLIES
  // =====================================================

  const toggleReplies = (reviewId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [reviewId]:
        !prev[reviewId],
    }));
  };

  // =====================================================
  // OPEN CREATE REPLY
  // =====================================================

  const openCreateReply = (review) => {
    if (!isLoggedIn()) {
      toast.error(
        "Please login to reply"
      );

      navigate("/login");
      return;
    }

    setReplyReview(review);
    setEditingReply(null);

    setReplyForm({
      comment: "",
    });

    setEmojiPicker(null);
    setReplyModalOpen(true);
  };

  // =====================================================
  // OPEN EDIT REPLY
  // =====================================================

  const openEditReply = (reply, review) => {
    if (!isLoggedIn()) {
      toast.error(
        "Please login to edit your reply"
      );

      navigate("/login");
      return;
    }

    setReplyReview(review);
    setEditingReply(reply);

    setReplyForm({
      comment: reply.comment || "",
    });

    setEmojiPicker(null);
    setReplyModalOpen(true);
  };

  // =====================================================
  // CLOSE REPLY MODAL
  // =====================================================

  const closeReplyModal = () => {
    if (submitting) return;

    setReplyModalOpen(false);
    setReplyReview(null);
    setEditingReply(null);
    setEmojiPicker(null);

    setReplyForm({
      comment: "",
    });
  };

  // =====================================================
  // SUBMIT / UPDATE REPLY
  // =====================================================

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyForm.comment.trim()) {
      toast.error(
        "Please write your reply"
      );
      return;
    }

    if (!replyReview?._id) {
      toast.error(
        "Unable to identify this review"
      );
      return;
    }

    try {
      setSubmitting(true);

      // =================================================
      // UPDATE REPLY
      // =================================================

      if (editingReply) {
        await axiosInstance.put(
          `/reviews/replies/${editingReply._id}`,
          {
            comment:
              replyForm.comment.trim(),
          }
        );

        toast.success(
          "Reply updated successfully"
        );
      }

      // =================================================
      // CREATE REPLY
      // =================================================

      else {
        await axiosInstance.post(
          `/reviews/${replyReview._id}/replies`,
          {
            comment:
              replyForm.comment.trim(),
          }
        );

        toast.success(
          "Reply added successfully"
        );
      }

      const reviewId =
        replyReview._id;

      closeReplyModal();

      // Keep this review expanded
      setExpandedReplies((prev) => ({
        ...prev,
        [reviewId]: true,
      }));

      await fetchReviews(1, false);
    } catch (error) {
      console.error(
        "Reply submit error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to save reply"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE REPLY
  // =====================================================

  const handleDeleteReply = async (
    replyId
  ) => {
    if (!isLoggedIn()) {
      toast.error(
        "Please login to delete your reply"
      );

      navigate("/login");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this reply?"
      );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      await axiosInstance.delete(
        `/reviews/replies/${replyId}`
      );

      toast.success(
        "Reply deleted successfully"
      );

      await fetchReviews(1, false);
    } catch (error) {
      console.error(
        "Delete reply error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to delete reply"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOAD MORE
  // =====================================================

  const handleLoadMore = () => {
    if (
      !hasMore ||
      loadingMore
    ) {
      return;
    }

    fetchReviews(
      page + 1,
      true
    );
  };

  // =====================================================
  // RATING BAR
  // =====================================================

  const getRatingPercentage = (
    rating
  ) => {
    if (!summary.totalReviews) {
      return 0;
    }

    return Math.round(
      ((summary.ratingDistribution?.[
        rating
      ] || 0) /
        summary.totalReviews) *
        100
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="pt-10 border-t border-[#E4E1D9]">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-sm text-[#6B6862]">
            <FiLoader className="animate-spin text-[#FF4B12]" />
            Loading customer reviews...
          </div>
        </div>
      </section>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <section className="pt-10 border-t border-[#E4E1D9]">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">

          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-[JetBrains_Mono] font-semibold tracking-[0.2em] uppercase text-[#FF4B12] mb-2">
              <span className="w-4 h-px bg-[#FF4B12]" />
              Customer Feedback
            </span>

            <h2 className="text-3xl sm:text-4xl font-[Bebas_Neue] tracking-wide text-[#16161A]">
              Customer Reviews & Ratings
            </h2>

            <p className="text-sm text-[#6B6862] mt-1">
              See what customers think about this product.
            </p>
          </div>

          {canReview && (
  <button
    type="button"
    onClick={openCreateReview}
    className="shrink-0 h-11 px-5 bg-[#16161A] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#FF4B12] transition-colors"
  >
    <FiStar />
    Write a Review
  </button>
)}
        </div>

        {/* ================================================= */}
        {/* RATING SUMMARY */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] border border-[#E4E1D9] bg-white mb-10">

          {/* Average */}
          <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#E4E1D9] flex flex-col items-center justify-center text-center">

            <div className="text-5xl font-[Bebas_Neue] tracking-wide text-[#16161A]">
              {summary.averageRating || "0.0"}
            </div>

            <Stars
              rating={Math.round(
                summary.averageRating || 0
              )}
              size="text-lg"
            />

            <p className="text-xs text-[#6B6862] mt-2">
              Based on{" "}
              <span className="font-bold text-[#16161A]">
                {summary.totalReviews}
              </span>{" "}
              review
              {summary.totalReviews === 1
                ? ""
                : "s"}
            </p>
          </div>

          {/* Distribution */}
          <div className="p-6 sm:p-8">

            {[5, 4, 3, 2, 1].map(
              (rating) => (
                <div
                  key={rating}
                  className="flex items-center gap-3 mb-3 last:mb-0"
                >
                  <div className="w-10 flex items-center gap-1 text-xs font-semibold text-[#16161A]">
                    {rating}
                    <FiStar className="text-[#FFB000] fill-[#FFB000]" />
                  </div>

                  <div className="flex-1 h-2 bg-[#F0EEE9] overflow-hidden">
                    <div
                      className="h-full bg-[#FFB000] transition-all duration-500"
                      style={{
                        width: `${getRatingPercentage(
                          rating
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="w-8 text-right text-xs text-[#6B6862] font-[JetBrains_Mono]">
                    {summary
                      .ratingDistribution?.[
                      rating
                    ] || 0}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* REVIEW LIST */}
        {/* ================================================= */}

        {reviews.length === 0 ? (
          <div className="border border-dashed border-[#D8D4CB] bg-white py-14 px-6 text-center">

            <div className="w-14 h-14 mx-auto mb-4 border border-[#E4E1D9] flex items-center justify-center">
              <FiMessageCircle className="text-2xl text-[#8C8880]" />
            </div>

            <h3 className="font-semibold text-[#16161A]">
              No reviews yet
            </h3>

            <p className="text-sm text-[#6B6862] mt-1 mb-5">
              Be the first customer to review this product.
            </p>

            {canReview && (
  <button
    type="button"
    onClick={openCreateReview}
    className="inline-flex items-center gap-2 px-5 h-10 bg-[#FF4B12] text-white text-sm font-semibold hover:bg-[#16161A] transition-colors"
  >
    <FiStar />
    Write First Review
  </button>
)}
          </div>
        ) : (
          <div className="space-y-4">

            {reviews.map((review) => {
              const ownReview =
                isOwnReview(review);

              const replies =
                review.replies || [];

              const repliesOpen =
                expandedReplies[
                  review._id
                ];

              return (
                <article
                  key={review._id}
                  className="border border-[#E4E1D9] bg-white"
                >

                  {/* ================================================= */}
                  {/* REVIEW */}
                  {/* ================================================= */}

                  <div className="p-5 sm:p-6">

                    {/* User + actions */}
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-[#16161A] text-white flex items-center justify-center text-sm font-bold uppercase">
                          {review.user?.username
                            ?.charAt(0) ||
                            "U"}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#16161A]">
                              {review.user
                                ?.username ||
                                "Customer"}
                            </span>

                            {review.isVerifiedPurchase === true && (
  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#EAF7EE] text-[#157F3C] text-[10px] font-medium whitespace-nowrap">
    <span className="w-3.5 h-3.5 rounded-full bg-[#157F3C] text-white flex items-center justify-center">
      <span className="text-[9px] font-bold leading-none">
        ✓
      </span>
    </span>

    Verified Purchase
  </span>
)}
                          </div>

                          <p className="text-[11px] text-[#8C8880] mt-0.5">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}

                            {review.updatedAt !==
                              review.createdAt && (
                              <span>
                                {" "}
                                · Edited
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Own review actions */}
                      {ownReview && (
                        <div className="flex items-center gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              openEditReview(
                                review
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#6B6862] hover:text-[#16161A] hover:bg-[#F5F3EE] transition"
                            title="Edit review"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            disabled={
                              submitting
                            }
                            onClick={() =>
                              handleDeleteReview(
                                review._id
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#8C8880] hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                            title="Delete review"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="mt-4">
                      <Stars
                        rating={
                          review.rating ||
                          0
                        }
                        size="text-sm"
                      />
                    </div>

                    {/* Title */}
                    {review.title && (
                      <h4 className="font-semibold text-[#16161A] mt-3">
                        {review.title}
                      </h4>
                    )}

                    {/* Comment */}
                    <p className="text-sm text-[#5F5B55] leading-relaxed mt-2 whitespace-pre-wrap break-words">
                      {review.comment}
                    </p>
                    
                    {/* ================================================= */}
{/* REVIEW IMAGES */}
{/* ================================================= */}

{review.images?.length > 0 && (
  <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
    {review.images.map(
      (image, index) => (
        <button
          key={`${image}-${index}`}
          type="button"
          onClick={() =>
            setSelectedImageIndex({
              images: review.images,
              index,
            })
          }
          className="relative aspect-square overflow-hidden border border-[#E4E1D9] bg-[#F8F7F4] group"
        >
          <img
            src={image}
            alt={`Review photo ${index + 1}`}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        </button>
      )
    )}
  </div>
)}

                    {/* ================================================= */}
                    {/* REPLIES */}
                    {/* ================================================= */}

                    <div className="mt-5 pt-4 border-t border-[#E4E1D9]">

                      <button
                        type="button"
                        onClick={() =>
                          toggleReplies(
                            review._id
                          )
                        }
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B6862] hover:text-[#FF4B12] transition"
                      >
                        <FiMessageCircle />

                        {replies.length > 0
                          ? `${replies.length} ${
                              replies.length ===
                              1
                                ? "Reply"
                                : "Replies"
                            }`
                          : "Reply"}

                        {replies.length > 0 &&
                          (repliesOpen ? (
                            <FiChevronUp />
                          ) : (
                            <FiChevronDown />
                          ))}
                      </button>

                      {/* Reply area */}
                      {repliesOpen && (
                        <div className="mt-4 pl-4 border-l-2 border-[#E4E1D9] space-y-3">

                          {/* Existing replies */}
                          {replies.map(
                            (reply) => {
                              const ownReply =
                                isOwnReply(
                                  reply
                                );

                              return (
                                <div
                                  key={
                                    reply._id
                                  }
                                  className="bg-[#F8F7F4] p-3"
                                >
                                  <div className="flex items-start justify-between gap-3">

                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-semibold text-[#16161A]">
                                          {reply
                                            .user
                                            ?.username ||
                                            "Customer"}
                                        </span>

                                        {isOwnReply(reply) && (
                                          <span className="text-[9px] uppercase tracking-wide font-bold px-1.5 py-0.5 bg-[#16161A]/10 text-[#16161A]">
                                            You
                                          </span>
                                        )}
                                      </div>

                                      <span className="text-[10px] text-[#8C8880] block mt-0.5">
                                        {new Date(
                                          reply.createdAt
                                        ).toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                          }
                                        )}

                                        {reply.updatedAt !==
                                          reply.createdAt && (
                                          <span>
                                            {" "}
                                            · Edited
                                          </span>
                                        )}
                                      </span>
                                    </div>

                                    {/* Own reply actions */}
                                    {ownReply && (
                                      <div className="flex items-center gap-1 shrink-0">

                                        <button
                                          type="button"
                                          onClick={() =>
                                            openEditReply(
                                              reply,
                                              review
                                            )
                                          }
                                          className="w-7 h-7 flex items-center justify-center text-[#6B6862] hover:text-[#16161A] hover:bg-white transition"
                                          title="Edit reply"
                                        >
                                          <FiEdit2 className="text-xs" />
                                        </button>

                                        <button
                                          type="button"
                                          disabled={
                                            submitting
                                          }
                                          onClick={() =>
                                            handleDeleteReply(
                                              reply._id
                                            )
                                          }
                                          className="w-7 h-7 flex items-center justify-center text-[#8C8880] hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                          title="Delete reply"
                                        >
                                          <FiTrash2 className="text-xs" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <p className="text-xs text-[#5F5B55] mt-2 leading-relaxed whitespace-pre-wrap break-words">
                                    {reply.comment}
                                  </p>
                                </div>
                              );
                            }
                          )}

                          {/* Reply button */}
                          <button
                            type="button"
                            onClick={() =>
                              openCreateReply(
                                review
                              )
                            }
                            className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF4B12] hover:underline"
                          >
                            <FiMessageCircle />
                            + Reply to this review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {/* ================================================= */}
            {/* LOAD MORE */}
            {/* ================================================= */}

            {hasMore && (
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={
                    handleLoadMore
                  }
                  className="h-11 px-6 border border-[#E4E1D9] bg-white text-sm font-semibold text-[#16161A] hover:border-[#16161A] transition flex items-center gap-2 disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FiChevronDown />
                      Load More Reviews
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =================================================== */}
      {/* REVIEW MODAL */}
      {/* =================================================== */}

      {reviewModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !submitting
            ) {
              closeReviewModal();
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-white shadow-2xl border border-[#E4E1D9] max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E1D9] sticky top-0 bg-white z-10">

              <div>
                <span className="text-[10px] font-[JetBrains_Mono] font-bold tracking-[0.18em] uppercase text-[#FF4B12]">
                  {editingReview
                    ? "Edit Feedback"
                    : "Your Feedback"}
                </span>

                <h3 className="text-2xl font-[Bebas_Neue] tracking-wide text-[#16161A] mt-1">
                  {editingReview
                    ? "Edit Your Review"
                    : "Write a Review"}
                </h3>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={
                  closeReviewModal
                }
                className="w-9 h-9 flex items-center justify-center text-[#6B6862] hover:text-[#16161A] hover:bg-[#F5F3EE] disabled:opacity-50"
              >
                <FiX />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={
                handleReviewSubmit
              }
              className="p-6 space-y-5"
            >

              {/* Rating */}
              {!editingReview &&
               (
                  <div>
                    <label className="block text-[11px] font-[JetBrains_Mono] tracking-[0.16em] uppercase text-[#6B6862] mb-3">
                      Your Rating
                    </label>

                    <div className="flex items-center gap-2">
                      <Stars
                        rating={
                          reviewForm.rating
                        }
                        interactive
                        onChange={(
                          rating
                        ) =>
                          setReviewForm(
                            (prev) => ({
                              ...prev,
                              rating,
                            })
                          )
                        }
                        size="text-2xl"
                      />

                      <span className="ml-2 text-sm font-semibold text-[#16161A]">
                        {
                          reviewForm.rating
                        }
                        /5
                      </span>
                    </div>
                  </div>
                )}

              {/* Title */}
              <div>
                <label className="block text-[11px] font-[JetBrains_Mono] tracking-[0.16em] uppercase text-[#6B6862] mb-2">
                  Review Title
                  <span className="normal-case text-[#A09C94]">
                    {" "}
                    (Optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={
                    reviewForm.title
                  }
                  maxLength={120}
                  onChange={(e) =>
                    setReviewForm(
                      (prev) => ({
                        ...prev,
                        title:
                          e.target.value,
                      })
                    )
                  }
                  placeholder="e.g. Great quality and fit"
                  className="w-full h-11 px-4 border border-[#E4E1D9] text-sm outline-none focus:border-[#16161A]"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-[11px] font-[JetBrains_Mono] tracking-[0.16em] uppercase text-[#6B6862] mb-2">
                  Your Review
                </label>
{/* ================================================= */}
{/* REVIEW IMAGES */}
{/* ================================================= */}

<div>
  <div className="flex items-center justify-between mb-2">
    <label className="block text-[11px] font-[JetBrains_Mono] tracking-[0.16em] uppercase text-[#6B6862]">
      Photos
      <span className="normal-case text-[#A09C94]">
        {" "}
        (Optional)
      </span>
    </label>

    <span className="text-[10px] text-[#8C8880] font-[JetBrains_Mono]">
      {reviewForm.images.length}/5
    </span>
  </div>

  <div className="border border-dashed border-[#D8D4CB] bg-[#FAF9F6] p-4">

    <label className="flex flex-col items-center justify-center min-h-[110px] cursor-pointer hover:bg-white transition">

      <div className="w-10 h-10 border border-[#E4E1D9] bg-white flex items-center justify-center mb-2">
        <span className="text-lg">📷</span>
      </div>

      <span className="text-sm font-semibold text-[#16161A]">
        Add photos
      </span>

      <span className="text-[11px] text-[#8C8880] mt-1">
        JPG, PNG, WEBP · Max 5MB each
      </span>

      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleReviewImages}
        disabled={
          submitting ||
          reviewForm.images.length >= 5
        }
      />
    </label>

    {/* Image previews */}
    {imagePreviews.length > 0 && (
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
        {imagePreviews.map(
          (src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-square bg-white border border-[#E4E1D9] overflow-hidden group"
            >
              <img
                src={src}
                alt={`Review ${index + 1}`}
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={() =>
                  removeReviewImage(index)
                }
                disabled={submitting}
                className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Remove image"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          )
        )}
      </div>
    )}
  </div>
</div>
                <div className="relative">

                  <textarea
                    value={
                      reviewForm.comment
                    }
                    maxLength={2000}
                    rows={5}
                    onChange={(e) =>
                      setReviewForm(
                        (prev) => ({
                          ...prev,
                          comment:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-3 pb-12 border border-[#E4E1D9] text-sm outline-none resize-none focus:border-[#16161A]"
                  />

                  {/* Emoji button */}
                  <button
                    type="button"
                    onClick={() =>
                      setEmojiPicker(
                        emojiPicker ===
                          "review"
                          ? null
                          : "review"
                      )
                    }
                    className="absolute left-3 bottom-3 w-8 h-8 flex items-center justify-center text-[#6B6862] hover:text-[#FF4B12] hover:bg-[#F5F3EE] transition"
                    title="Add emoji"
                  >
                    <FiSmile />
                  </button>

                  {/* Emoji picker */}
                  {emojiPicker ===
                    "review" && (
                    <div className="absolute left-0 bottom-12 w-full sm:w-[320px] bg-white border border-[#E4E1D9] shadow-xl p-3 z-20">

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.14em] text-[#6B6862]">
                          Emoji
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setEmojiPicker(
                              null
                            )
                          }
                          className="text-[#8C8880] hover:text-[#16161A]"
                        >
                          <FiX />
                        </button>
                      </div>

                      <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                        {emojis.map(
                          (
                            emoji,
                            index
                          ) => (
                            <button
                              key={`${emoji}-${index}`}
                              type="button"
                              onClick={() =>
                                insertEmoji(
                                  emoji,
                                  "review"
                                )
                              }
                              className="h-8 w-8 flex items-center justify-center text-lg hover:bg-[#F5F3EE] rounded transition"
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute right-3 bottom-3 text-[10px] text-[#8C8880]">
                    {
                      reviewForm
                        .comment
                        .length
                    }
                    /2000
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">

                <button
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={
                    closeReviewModal
                  }
                  className="h-11 px-5 border border-[#E4E1D9] text-sm font-semibold text-[#6B6862] hover:border-[#16161A] hover:text-[#16161A] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="h-11 px-6 bg-[#FF4B12] text-white text-sm font-bold flex items-center gap-2 hover:bg-[#16161A] transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      {editingReview
                        ? "Update Review"
                        : "Submit Review"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* REPLY MODAL */}
      {/* =================================================== */}

      {replyModalOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !submitting
            ) {
              closeReplyModal();
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-white shadow-2xl border border-[#E4E1D9]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4E1D9]">

              <div>
                <span className="text-[10px] font-[JetBrains_Mono] font-bold tracking-[0.18em] uppercase text-[#FF4B12]">
                  {editingReply
                    ? "Edit Response"
                    : "Your Response"}
                </span>

                <h3 className="text-2xl font-[Bebas_Neue] tracking-wide text-[#16161A] mt-1">
                  {editingReply
                    ? "Edit Your Reply"
                    : "Reply to Review"}
                </h3>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={
                  closeReplyModal
                }
                className="w-9 h-9 flex items-center justify-center text-[#6B6862] hover:text-[#16161A] hover:bg-[#F5F3EE] disabled:opacity-50"
              >
                <FiX />
              </button>
            </div>

            {/* Original review preview */}
            {replyReview && (
              <div className="mx-6 mt-5 p-4 bg-[#F8F7F4] border border-[#E4E1D9]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#16161A] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                    {replyReview.user?.username
                      ?.charAt(0) ||
                      "U"}
                  </div>

                  <span className="text-xs font-semibold text-[#16161A]">
                    {replyReview.user
                      ?.username ||
                      "Customer"}
                  </span>
                </div>

                <p className="text-xs text-[#5F5B55] leading-relaxed line-clamp-3">
                  {replyReview.comment}
                </p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={
                handleReplySubmit
              }
              className="p-6 space-y-5"
            >

              <div>
                <label className="block text-[11px] font-[JetBrains_Mono] tracking-[0.16em] uppercase text-[#6B6862] mb-2">
                  Your Reply
                </label>

                <div className="relative">

                  <textarea
                    value={
                      replyForm.comment
                    }
                    maxLength={2000}
                    rows={5}
                    autoFocus
                    onChange={(e) =>
                      setReplyForm(
                        (prev) => ({
                          ...prev,
                          comment:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Write your reply..."
                    className="w-full px-4 py-3 pb-12 border border-[#E4E1D9] text-sm outline-none resize-none focus:border-[#16161A]"
                  />

                  {/* Emoji button */}
                  <button
                    type="button"
                    onClick={() =>
                      setEmojiPicker(
                        emojiPicker ===
                          "reply"
                          ? null
                          : "reply"
                      )
                    }
                    className="absolute left-3 bottom-3 w-8 h-8 flex items-center justify-center text-[#6B6862] hover:text-[#FF4B12] hover:bg-[#F5F3EE] transition"
                    title="Add emoji"
                  >
                    <FiSmile />
                  </button>

                  {/* Emoji picker */}
                  {emojiPicker ===
                    "reply" && (
                    <div className="absolute left-0 bottom-12 w-full sm:w-[320px] bg-white border border-[#E4E1D9] shadow-xl p-3 z-20">

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.14em] text-[#6B6862]">
                          Emoji
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setEmojiPicker(
                              null
                            )
                          }
                          className="text-[#8C8880] hover:text-[#16161A]"
                        >
                          <FiX />
                        </button>
                      </div>

                      <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                        {emojis.map(
                          (
                            emoji,
                            index
                          ) => (
                            <button
                              key={`${emoji}-${index}`}
                              type="button"
                              onClick={() =>
                                insertEmoji(
                                  emoji,
                                  "reply"
                                )
                              }
                              className="h-8 w-8 flex items-center justify-center text-lg hover:bg-[#F5F3EE] rounded transition"
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute right-3 bottom-3 text-[10px] text-[#8C8880]">
                    {
                      replyForm
                        .comment
                        .length
                    }
                    /2000
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">

                <button
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={
                    closeReplyModal
                  }
                  className="h-11 px-5 border border-[#E4E1D9] text-sm font-semibold text-[#6B6862] hover:border-[#16161A] hover:text-[#16161A] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="h-11 px-6 bg-[#FF4B12] text-white text-sm font-bold flex items-center gap-2 hover:bg-[#16161A] transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      {editingReply
                        ? "Update Reply"
                        : "Send Reply"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReviews;