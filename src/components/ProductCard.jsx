import { Link } from "react-router-dom";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import axiosInstance from "../api/axios";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";

import {
  addToWishlist,
  removeFromWishlist,
} from "../features/wishlist/wishlistSlice";

const ProductCard = ({ product, slider = false }) => {
  const dispatch = useDispatch();
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const wishlistItems = useSelector(
    (state) => state.wishlist?.wishlistItems || []
  );

  const variants = product.variants || [];
  const currentVariant =
    variants[activeVariantIndex] || variants[0];

  const firstImage =
    currentVariant?.images?.[0] ||
    "https://via.placeholder.com/500";

  const sizes = currentVariant?.sizes || [];
  const minPrice = sizes[0]?.price || 0;

  const oldPrice =
    product.originalPrice ||
    product.compareAtPrice ||
    Math.round(minPrice * 1.35);

  const wishlisted = wishlistItems.some(
    (item) => item.product?._id === product._id
  );

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(minPrice);

  const formattedOldPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(oldPrice);

  const wishlistHandler = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        localStorage.setItem(
          "redirectAfterLogin",
          window.location.pathname
        );

        toast.error("Please login to add items to wishlist");
        return;
      }

      const response = await axiosInstance.post(
        `/wishlist/${product._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.isWishlisted) {
        dispatch(addToWishlist({ product }));
        toast.success("Added to wishlist");
      } else {
        dispatch(removeFromWishlist(product._id));
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Your session has expired. Please login again");
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Unable to update wishlist. Please try again."
      );
    }
  };

  return (
    <article
      className={`group relative overflow-hidden border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        slider ? "min-w-[220px]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {product.featured && (
        <span className="absolute left-3 top-3 z-10 bg-black px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
          Trending
        </span>
      )}

      <button
        onClick={wishlistHandler}
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow-sm transition hover:text-red-500"
        aria-label="Add to wishlist"
      >
        {wishlisted ? (
          <FaHeart className="text-sm text-red-500" />
        ) : (
          <FaRegHeart className="text-sm" />
        )}
      </button>

      <Link to={`/product/${product._id}`}>
        <div className="aspect-[4/5] overflow-hidden bg-[#f5f5f5]">
          <img
            src={firstImage}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />
        </div>

        <div className="p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {product.brand || "Menswear"}
          </p>

          <h3 className="truncate text-sm font-semibold text-gray-900">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">
              {formattedPrice}
            </span>

            <span className="text-xs text-gray-400 line-through">
              {formattedOldPrice}
            </span>
          </div>


{/* Rating */}

          {/* <div className="mt-2 flex items-center gap-1 text-[11px] text-yellow-600">
            <span>★★★★★</span>
            <span className="text-gray-400">
              ({product.rating || 0})
            </span>
          </div> */}
        </div>
      </Link>

      {variants.length > 1 && (
        <div className="flex gap-1 px-3 pb-3">
          {variants.slice(0, 4).map((variant, index) => (
            <button
              key={variant._id || index}
              onClick={() => setActiveVariantIndex(index)}
              className={`h-4 w-4 rounded-full border ${
                activeVariantIndex === index
                  ? "border-black ring-1 ring-black ring-offset-1"
                  : "border-gray-300"
              }`}
              style={{
                backgroundColor: variant.color || "#d1d5db",
              }}
              aria-label={`Select ${variant.color || "variant"}`}
            />
          ))}
        </div>
      )}
    </article>
  );
};

export default ProductCard;