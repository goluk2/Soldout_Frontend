import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

const collections = [
  {
    id: "casual",
    title: "Casual Essentials",
    text: "Everyday styles made for you.",
    button: "Shop Now",
  },
  {
    id: "new-arrivals",
    title: "New Arrivals",
    text: "Check out the latest trends and styles.",
    button: "Explore",
  },
  {
    id: "premium",
    title: "Premium Collection",
    text: "Finest fabrics for a premium feel.",
    button: "Shop Now",
  },
];

const FeaturedCollections = () => {
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentProducts, setCurrentProducts] = useState({});
  const [loading, setLoading] = useState(true);

  // Get all images of a product
  const getProductImages = (product) => {
    if (!product?.variants) return [];

    return product.variants.flatMap(
      (variant) => variant.images || []
    );
  };

  // Get random image from product
  const getRandomProductImage = (product) => {
    const images = getProductImages(product);

    if (!images.length) return "";

    return images[
      Math.floor(Math.random() * images.length)
    ];
  };

  // Create random card data
  const getRandomCardProduct = (
    products,
    previousProductId = null
  ) => {
    if (!products?.length) return null;

    let availableProducts = products;

    // Same product avoid karo if multiple products available
    if (products.length > 1 && previousProductId) {
      availableProducts = products.filter(
        (product) => product._id !== previousProductId
      );
    }

    const product =
      availableProducts[
        Math.floor(
          Math.random() * availableProducts.length
        )
      ];

    return {
      product,
      image: getRandomProductImage(product),
    };
  };

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get(
          "/products?featured=true&limit=100"
        );

        const products =
          response.data?.products || [];

        // Only products having at least one image
        const validProducts = products.filter(
          (product) => getProductImages(product).length > 0
        );

        setFeaturedProducts(validProducts);

        // Initially select different random products
        const initialProducts = {};

        collections.forEach((collection, index) => {
          const previousIds = Object.values(initialProducts)
            .map((item) => item?.product?._id)
            .filter(Boolean);

          let availableProducts = validProducts.filter(
            (product) =>
              !previousIds.includes(product._id)
          );

          // Agar products kam hain to same pool se choose karenge
          if (!availableProducts.length) {
            availableProducts = validProducts;
          }

          initialProducts[collection.id] =
            getRandomCardProduct(
              availableProducts
            );
        });

        setCurrentProducts(initialProducts);
      } catch (error) {
        console.error(
          "Featured products fetch error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Change featured product/image every 5 seconds
//   useEffect(() => {
//     if (!featuredProducts.length) return;

//     const interval = setInterval(() => {
//       setCurrentProducts((previous) => {
//         const updated = {};

//         collections.forEach((collection) => {
//           const currentProduct =
//             previous[collection.id]?.product;

//           updated[collection.id] =
//             getRandomCardProduct(
//               featuredProducts,
//               currentProduct?._id
//             );
//         });

//         return updated;
//       });
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [featuredProducts]);

  // Skeleton Loading
  if (loading) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />

          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[300px] animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </section>
    );
  }

  // Don't show section if no featured products
  if (!featuredProducts.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold uppercase tracking-tight sm:text-3xl">
          Featured Collections
        </h2>

        <Link
          to="/search?featured=true"
          className="text-sm font-medium text-gray-700 transition hover:text-black"
        >
          View All →
        </Link>
      </div>

      {/* COLLECTION CARDS */}
      <div className="grid gap-4 md:grid-cols-3">

        {collections.map((collection) => {
          const current =
            currentProducts[collection.id];

          const product = current?.product;
          const image = current?.image;

          return (
            <div
              key={collection.id}
              onClick={() => {
                if (product?._id) {
                  navigate(`/product/${product._id}`);
                }
              }}
              className="
                group
                relative
                min-h-[280px]
                overflow-hidden
                rounded-xl
                bg-gray-200
                cursor-pointer
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
              "
            >

              {/* DYNAMIC PRODUCT IMAGE */}
              {image && (
                <img
                  key={`${product?._id}-${image}`}
                  src={image}
                  alt={product?.name || collection.title}
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    transition-all
                    duration-700
                    ease-in-out
                    animate-[fadeIn_0.7s_ease-in-out]
                    group-hover:scale-110
                  "
                />
              )}

              {/* DARK OVERLAY */}
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-black/80
                  via-black/40
                  to-black/10
                  transition-all
                  duration-300
                  group-hover:from-black/85
                  group-hover:via-black/50
                "
              />

              {/* CONTENT */}
              <div
                className="
                  relative
                  z-10
                  flex
                  min-h-[280px]
                  flex-col
                  items-start
                  justify-end
                  p-6
                  text-white
                "
              >

                <h3 className="text-2xl font-bold">
                  {collection.title}
                </h3>

                <p className="mt-2 max-w-[220px] text-sm text-white/85">
                  {collection.text}
                </p>

                {/* CURRENT PRODUCT NAME */}
                {product?.name && (
                  <p className="mt-3 max-w-[230px] truncate text-xs font-medium text-white/70">
                    {product.name}
                  </p>
                )}

                {/* BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (product?._id) {
                      navigate(`/product/${product._id}`);
                    }
                  }}
                  className="
                    mt-5
                    bg-white
                    px-5
                    py-2.5
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-black
                    transition-all
                    duration-300
                    hover:scale-105
                    group-hover:bg-black
                    group-hover:text-white
                  "
                >
                  {collection.button} →
                </button>

              </div>
            </div>
          );
        })}

      </div>

      {/* Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(1.05);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

    </section>
  );
};

export default FeaturedCollections;