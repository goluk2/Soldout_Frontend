import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

const categories = [
  {
    name: "T-Shirts",
    query: "t-shirt",
  },
  {
    name: "Shirts",
    query: "shirt",
  },
  {
    name: "Pants",
    query: "pant",
  },
  {
    name: "Jeans",
    query: "jeans",
  },
  {
    name: "Jackets",
    query: "jacket",
  },
  {
    name: "Hoodies",
    query: "hoodie",
  },
];

const ShopByCategory = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [categoryImages, setCategoryImages] = useState({});
  const [currentImages, setCurrentImages] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get(
          "/products?limit=500"
        );

        const products = response.data.products || [];
        const grouped = {};

        // Create category image arrays
        categories.forEach((category) => {
          grouped[category.query] = [];
        });

        // Collect images category-wise
        products.forEach((product) => {
          const productCategory =
            product.category?.toLowerCase() || "";

          const images =
            product.variants?.flatMap(
              (variant) => variant.images || []
            ) || [];

          if (!images.length) return;

          categories.forEach((category) => {
            if (
              productCategory.includes(category.query)
            ) {
              grouped[category.query].push(...images);
            }
          });
        });

        // Remove duplicate images
        Object.keys(grouped).forEach((key) => {
          grouped[key] = [...new Set(grouped[key])];
        });

        // =================================================
        // SHOW NEXT IMAGE ON EVERY PAGE REFRESH / RETURN
        // =================================================

        const nextImages = {};

        Object.keys(grouped).forEach((key) => {
          const images = grouped[key];

          if (!images || images.length === 0) {
            return;
          }

          // Get previously shown image index
          const storageKey = `categoryImageIndex_${key}`;

          const previousIndex = Number(
            sessionStorage.getItem(storageKey)
          );

          let nextIndex;

          if (
            Number.isNaN(previousIndex) ||
            previousIndex < 0 ||
            previousIndex >= images.length
          ) {
            // First visit
            nextIndex = 0;
          } else {
            // Next page refresh / revisit = next image
            nextIndex =
              (previousIndex + 1) % images.length;
          }

          // Save current index
          sessionStorage.setItem(
            storageKey,
            String(nextIndex)
          );

          // Set image
          nextImages[key] = images[nextIndex];
        });

        setCategoryImages(grouped);
        setCurrentImages(nextImages);

      } catch (error) {
        console.log(
          "Category products error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Product image counts
  const counts = useMemo(() => {
    const countMap = {};

    Object.keys(categoryImages).forEach((key) => {
      countMap[key] =
        categoryImages[key]?.length || 0;
    });

    return countMap;
  }, [categoryImages]);

  const handleCategoryClick = (query) => {
    navigate(`/search?q=${query}`);
  };

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">

      {/* SECTION HEADER */}
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            Explore styles
          </p>

          <h2 className="text-2xl font-bold uppercase tracking-tight text-gray-900 sm:text-3xl">
            Shop By Category
          </h2>
        </div>

        <button
          onClick={() => navigate("/shop")}
          className="hidden items-center gap-1 text-sm font-medium text-gray-700 transition hover:text-black sm:flex"
        >
          View All
          <span className="text-lg">→</span>
        </button>
      </div>


      {/* MOBILE CATEGORY LIST */}
      <div className="flex gap-5 overflow-x-auto pb-3 no-scrollbar sm:hidden">
        {loading
          ? Array.from({ length: 6 }).map(
              (_, index) => (
                <CategorySkeleton
                  key={index}
                  mobile
                />
              )
            )
          : categories.map((category) => (
              <CategoryCard
                key={category.query}
                category={category}
                image={
                  currentImages[
                    category.query
                  ]
                }
                count={
                  counts[
                    category.query
                  ]
                }
                mobile
                onClick={() =>
                  handleCategoryClick(
                    category.query
                  )
                }
              />
            ))}
      </div>


      {/* DESKTOP CATEGORY GRID */}
      <div className="hidden grid-cols-3 gap-x-5 gap-y-8 sm:grid lg:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map(
              (_, index) => (
                <CategorySkeleton
                  key={index}
                />
              )
            )
          : categories.map((category) => (
              <CategoryCard
                key={category.query}
                category={category}
                image={
                  currentImages[
                    category.query
                  ]
                }
                count={
                  counts[
                    category.query
                  ]
                }
                onClick={() =>
                  handleCategoryClick(
                    category.query
                  )
                }
              />
            ))}
      </div>


      {/* MOBILE VIEW ALL */}
      <button
        onClick={() => navigate("/shop")}
        className="mt-6 flex w-full items-center justify-center gap-2 border border-gray-300 py-3 text-xs font-semibold uppercase tracking-wide text-gray-800 transition hover:border-black hover:bg-black hover:text-white sm:hidden"
      >
        View All Categories
        <span className="text-base">→</span>
      </button>
    </section>
  );
};


const CategoryCard = ({
  category,
  image,
  count,
  onClick,
  mobile = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-center ${
        mobile
          ? "min-w-[100px] shrink-0"
          : "w-full"
      }`}
    >
      {/* IMAGE CIRCLE */}
      <div
        className={`relative mx-auto overflow-hidden rounded-full bg-[#f1f1f1] ${
          mobile
            ? "h-24 w-24"
            : "h-28 w-28 lg:h-32 lg:w-32"
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] text-gray-400">
            No Image
          </div>
        )}

        {/* HOVER OVERLAY */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition duration-300 group-hover:bg-black/35">
          <span className="translate-y-2 text-xs font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Shop →
          </span>
        </div>
      </div>

      {/* CATEGORY NAME */}
      <p className="mt-3 text-sm font-semibold text-gray-800 transition group-hover:text-black">
        {category.name}
      </p>

      {/* PRODUCT COUNT */}
      <p className="mt-1 text-[11px] text-gray-500">
        {count > 0
          ? `${count}+ styles`
          : "New arrivals"}
      </p>
    </button>
  );
};


const CategorySkeleton = ({
  mobile = false,
}) => {
  return (
    <div
      className={`animate-pulse text-center ${
        mobile
          ? "min-w-[100px] shrink-0"
          : "w-full"
      }`}
    >
      <div
        className={`mx-auto rounded-full bg-gray-200 ${
          mobile
            ? "h-24 w-24"
            : "h-28 w-28 lg:h-32 lg:w-32"
        }`}
      />

      <div className="mx-auto mt-3 h-3 w-16 bg-gray-200" />

      <div className="mx-auto mt-2 h-2 w-20 bg-gray-100" />
    </div>
  );
};


export default ShopByCategory;