import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import {
  FiHeart,
  FiTrash2,
  FiArrowRight,
  FiShoppingBag,
  FiUser,
  FiBox,
  FiCircle,
} from "react-icons/fi";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchWishlist = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    // LOGIN CHECK
    if (!token) {
      toast.error("Please login to view your wishlist");
      navigate("/login");
      return;
    }

    const response = await axiosInstance.get("/wishlist", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setWishlist(response.data);

  } catch (error) {
    console.error("Wishlist fetch error:", error);

    // SESSION EXPIRED
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      toast.error("Your session has expired. Please login again");
      navigate("/login");
      return;
    }

    // BACKEND ERROR
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      return;
    }

    // NETWORK ERROR
    if (error.code === "ERR_NETWORK") {
      toast.error(
        "Unable to connect. Please check your internet connection."
      );
      return;
    }

    toast.error("Unable to load wishlist. Please try again.");

  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchWishlist();
  }, []);

 const handleRemoveWishlist = async (productId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to manage your wishlist");
      navigate("/login");
      return;
    }

    await axiosInstance.delete(`/wishlist/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setWishlist((prevWishlist) =>
      prevWishlist.filter(
        (item) => item.product?._id !== productId
      )
    );

    toast.success("Removed from wishlist");

  } catch (error) {
    console.error("Remove wishlist error:", error);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      toast.error("Your session has expired. Please login again");
      navigate("/login");
      return;
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      return;
    }

    if (error.code === "ERR_NETWORK") {
      toast.error(
        "Unable to connect. Please check your internet connection."
      );
      return;
    }

    toast.error("Unable to remove item. Please try again.");
  }
};

  const getTotalStock = (product) => {
    return (
      product?.variants?.reduce(
        (variantTotal, variant) =>
          variantTotal +
          (variant?.sizes?.reduce(
            (sizeTotal, size) =>
              sizeTotal + (Number(size?.stock) || 0),
            0
          ) || 0),
        0
      ) || 0
    );
  };

  const getStartingPrice = (product) => {
    const prices =
      product?.variants?.flatMap(
        (variant) =>
          variant?.sizes
            ?.map((size) => Number(size?.price))
            .filter((price) => !Number.isNaN(price)) || []
      ) || [];

    if (!prices.length) return 0;

    return Math.min(...prices);
  };

  const allItems = useMemo(() => {
    return wishlist.filter((item) => item?.product);
  }, [wishlist]);

  const inStockCount = useMemo(() => {
    return allItems.filter(
      (item) => getTotalStock(item.product) > 0
    ).length;
  }, [allItems]);

  const outOfStockCount = useMemo(() => {
    return allItems.filter(
      (item) => getTotalStock(item.product) <= 0
    ).length;
  }, [allItems]);

  const onSaleCount = useMemo(() => {
    return allItems.filter(
      (item) => item.product?.isLiveSale
    ).length;
  }, [allItems]);

  const filteredWishlist = useMemo(() => {
    if (activeFilter === "stock") {
      return allItems.filter(
        (item) => getTotalStock(item.product) > 0
      );
    }

    if (activeFilter === "out") {
      return allItems.filter(
        (item) => getTotalStock(item.product) <= 0
      );
    }

    if (activeFilter === "sale") {
      return allItems.filter(
        (item) => item.product?.isLiveSale
      );
    }

    return allItems;
  }, [allItems, activeFilter]);

  const filters = [
    {
      id: "all",
      label: "All Items",
      mobileLabel: "All",
      count: allItems.length,
    },
    {
      id: "stock",
      label: "In Stock",
      mobileLabel: "In Stock",
      count: inStockCount,
    },
    {
      id: "out",
      label: "Out of Stock",
      mobileLabel: "Out of Stock",
      count: outOfStockCount,
    },
    {
      id: "sale",
      label: "On Sale",
      mobileLabel: "On Sale",
      count: onSaleCount,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col">
        <Navbar />

        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />

      <main className="w-full flex-1 flex justify-center">
        <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-5 lg:px-8 xl:px-10 py-5 sm:py-7 lg:py-9">

          {/* ================= HEADER ================= */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6 lg:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white border border-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                <FiHeart className="text-red-500 text-xl sm:text-2xl fill-red-500" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight">
                  My Wishlist
                </h1>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Your favourite products, saved for later
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5">
              <p className="text-sm font-bold text-gray-700 whitespace-nowrap">
                {allItems.length}{" "}
                <span className="hidden xs:inline">Items</span>
              </p>

              <button
                onClick={() => navigate("/")}
                className="h-10 sm:h-11 px-4 sm:px-6 bg-black text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition"
              >
                Continue Shopping

                <FiArrowRight />
              </button>
            </div>
          </div>

          {/* ================= MOBILE FILTERS ================= */}

          {allItems.length > 0 && (
            <div className="lg:hidden mb-5">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() =>
                      setActiveFilter(filter.id)
                    }
                    className={`flex-shrink-0 px-4 py-2 rounded-full border text-xs font-semibold transition ${
                      activeFilter === filter.id
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {filter.mobileLabel} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= EMPTY ================= */}

          {allItems.length === 0 ? (
            <div className="min-h-[480px] bg-white border border-gray-200 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center px-5 py-12 shadow-sm">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <FiHeart className="text-3xl sm:text-4xl text-red-400" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Your wishlist is empty
              </h2>

              <p className="text-gray-500 mt-3 max-w-md text-sm sm:text-base leading-6 sm:leading-7">
                Save products you love and find them here
                whenever you're ready to shop.
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-7 h-12 px-7 bg-black text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-800 transition"
              >
                <FiShoppingBag />

                Explore Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
              {/* ================= DESKTOP SIDEBAR ================= */}

             {/* ================= DESKTOP SIDEBAR ================= */}

<aside className="hidden lg:block lg:sticky lg:top-24 w-full space-y-5">

  {/* WISHLIST OVERVIEW */}

  <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

    {/* TOP SUMMARY */}

    <div className="px-6 py-6 border-b border-gray-200">

      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.12em]">
        Wishlist Overview
      </p>

      <div className="flex items-center justify-between gap-5 mt-5">

        <div className="min-w-0">

          <p className="text-4xl font-black text-gray-950 leading-none">
            {allItems.length}
          </p>

          <p className="text-sm text-gray-500 mt-2 whitespace-nowrap">
            Saved Items
          </p>

        </div>

        <div className="w-16 h-16 flex-shrink-0 bg-red-50 rounded-full flex items-center justify-center">

          <FiHeart className="text-red-500 text-2xl fill-red-500" />

        </div>

      </div>

    </div>

    {/* FILTER LIST */}

    <div className="py-2">

      {filters.map((filter) => {

        const isActive =
          activeFilter === filter.id;

        return (

          <button
            key={filter.id}
            onClick={() =>
              setActiveFilter(filter.id)
            }
            className={`
              relative
              w-full
              min-h-[62px]
              px-6
              grid
              grid-cols-[minmax(0,1fr)_48px]
              items-center
              gap-4
              text-left
              transition-colors
              ${
                isActive
                  ? "bg-gray-50"
                  : "bg-white hover:bg-gray-50"
              }
            `}
          >

            {/* ACTIVE LINE */}

            {isActive && (

              <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />

            )}

            {/* FILTER NAME */}

            <span
              className={`
                min-w-0
                text-sm
                truncate
                ${
                  isActive
                    ? "font-bold text-gray-950"
                    : "font-medium text-gray-600"
                }
              `}
            >

              {filter.label}

            </span>

            {/* FILTER COUNT */}

            <span
              className={`
                w-10
                h-8
                justify-self-end
                flex
                items-center
                justify-center
                rounded-lg
                text-sm
                font-black
                ${
                  filter.id === "stock"
                    ? "bg-green-50 text-green-600"
                    : filter.id === "out"
                    ? "bg-red-50 text-red-500"
                    : filter.id === "sale"
                    ? "bg-orange-50 text-orange-500"
                    : "bg-gray-100 text-gray-900"
                }
              `}
            >

              {filter.count}

            </span>

          </button>

        );

      })}

    </div>

  </div>


  {/* DON'T MISS OUT CARD */}

  <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

    <div className="flex flex-col items-center text-center">

      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">

        <FiShoppingBag className="text-3xl text-red-500" />

      </div>

      <h3 className="text-lg font-black text-gray-950 mt-5">
        Don't Miss Out!
      </h3>

      <p className="text-sm text-gray-500 leading-6 mt-2 max-w-[220px]">
        Items in your wishlist can go out of stock.
      </p>

      <button
        onClick={() => navigate("/")}
        className="
          w-full
          h-11
          mt-5
          bg-black
          text-white
          rounded-xl
          text-sm
          font-semibold
          flex
          items-center
          justify-center
          gap-2
          hover:bg-gray-800
          active:scale-[0.98]
          transition
        "
      >

        Explore Now

        <FiArrowRight />

      </button>

    </div>

  </div>

</aside>

              {/* ================= PRODUCTS ================= */}

              <section className="min-w-0">
                {filteredWishlist.length === 0 ? (
                  <div className="bg-white min-h-[350px] border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                    <FiHeart className="text-4xl text-gray-300" />

                    <h3 className="text-xl font-black mt-4">
                      No products found
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      No wishlist items available in this
                      filter.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredWishlist.map((item) => {
                      const product = item.product;

                      if (!product) return null;

                      const image =
                        product?.variants?.[0]?.images?.[0];

                      const price =
                        getStartingPrice(product);

                      const totalStock =
                        getTotalStock(product);

                      const optionCount =
                        product?.variants?.length || 0;

                      return (
                        <article
                          key={item._id}
                          className="group bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all"
                        >

                          {/* ========== MOBILE / TABLET ========== */}

                          <div className="lg:hidden">
                            <div className="flex gap-3 sm:gap-5">

                              <div
                                onClick={() =>
                                  navigate(
                                    `/product/${product._id}`
                                  )
                                }
                                className="relative w-[105px] h-[135px] sm:w-[150px] sm:h-[180px] flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
                              >
                                <img
                                  src={image}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />

                                <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center">
                                  <FiHeart className="text-red-500 fill-red-500" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col">
                                <div>
                                  <h2
                                    onClick={() =>
                                      navigate(
                                        `/product/${product._id}`
                                      )
                                    }
                                    className="text-sm sm:text-lg font-black text-gray-950 line-clamp-2 cursor-pointer"
                                  >
                                    {product.name}
                                  </h2>

                                  {product.brand && (
                                    <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-bold mt-1.5">
                                      {product.brand}
                                    </p>
                                  )}

                                  <p
                                    className={`text-xs font-semibold mt-2 ${
                                      totalStock > 0
                                        ? "text-green-600"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {totalStock > 0
                                      ? "In Stock"
                                      : "Out of Stock"}
                                  </p>
                                </div>

                                <div className="mt-auto">
                                  <p className="text-xl sm:text-2xl font-black text-gray-950">
                                    ₹{price}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/product/${product._id}`
                                  )
                                }
                                disabled={totalStock <= 0}
                                className={`flex-1 h-10 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition ${
                                  totalStock > 0
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                              >
                                {totalStock > 0
                                  ? "View Product"
                                  : "Out of Stock"}

                                {totalStock > 0 && (
                                  <FiArrowRight />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  handleRemoveWishlist(
                                    product._id
                                  )
                                }
                                className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition"
                                aria-label="Remove wishlist item"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>

                          {/* ========== DESKTOP ========== */}

                          <div className="hidden lg:grid lg:grid-cols-[125px_minmax(170px,1.15fr)_minmax(200px,1fr)_130px_150px] xl:grid-cols-[140px_minmax(220px,1.2fr)_minmax(240px,1fr)_140px_170px] items-center gap-4 xl:gap-6">

                            {/* IMAGE */}

                            <div
                              onClick={() =>
                                navigate(
                                  `/product/${product._id}`
                                )
                              }
                              className="relative w-full aspect-[4/4.2] bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
                            >
                              <img
                                src={image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              />

                              <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                                <FiHeart className="text-red-500 fill-red-500" />
                              </div>
                            </div>

                            {/* PRODUCT */}

                            <div className="min-w-0">
                              <h2
                                onClick={() =>
                                  navigate(
                                    `/product/${product._id}`
                                  )
                                }
                                className="text-base xl:text-lg font-black text-gray-950 line-clamp-2 cursor-pointer hover:text-red-500 transition"
                              >
                                {product.name}
                              </h2>

                              {product.brand && (
                                <p className="text-[10px] xl:text-xs uppercase tracking-[0.16em] font-bold text-gray-500 mt-2">
                                  {product.brand}
                                </p>
                              )}
                            </div>

                            {/* DETAILS */}

                            <div className="border-l border-gray-100 pl-5 space-y-3">
                              <div className="flex items-start gap-3">
                                <FiUser className="text-gray-400 mt-0.5 flex-shrink-0" />

                                <div>
                                  <p className="text-[10px] text-gray-400">
                                    Category
                                  </p>

                                  <p className="text-xs font-bold text-gray-800 mt-0.5 capitalize">
                                    {product.category}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <FiCircle className="text-gray-400 mt-0.5 flex-shrink-0" />

                                <div>
                                  <p className="text-[10px] text-gray-400">
                                    Color Options
                                  </p>

                                  <p className="text-xs font-bold text-gray-800 mt-0.5">
                                    {optionCount}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <FiBox className="text-gray-400 mt-0.5 flex-shrink-0" />

                                <div>
                                  <p className="text-[10px] text-gray-400">
                                    Availability
                                  </p>

                                  <p
                                    className={`text-xs font-bold mt-0.5 ${
                                      totalStock > 0
                                        ? "text-green-600"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {totalStock > 0
                                      ? "In Stock"
                                      : "Out of Stock"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* PRICE */}

                            <div className="border-l border-gray-100 pl-5">
                              <p className="text-[11px] text-gray-400">
                                Starting from
                              </p>

                              <p className="text-2xl xl:text-3xl font-black text-gray-950 mt-1">
                                ₹{price}
                              </p>

                              {product.isLiveSale && (
                                <span className="inline-block mt-2 text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-md">
                                  LIVE SALE
                                </span>
                              )}
                            </div>

                            {/* ACTION */}

                            <div className="flex flex-col items-stretch gap-3">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/product/${product._id}`
                                  )
                                }
                                disabled={totalStock <= 0}
                                className={`w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                                  totalStock > 0
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                }`}
                              >
                                {totalStock > 0
                                  ? "View Product"
                                  : "Out of Stock"}

                                {totalStock > 0 && (
                                  <FiArrowRight />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  handleRemoveWishlist(
                                    product._id
                                  )
                                }
                                className="w-full h-9 text-red-500 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-red-50 rounded-lg transition"
                              >
                                <FiTrash2 />

                                Remove
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;