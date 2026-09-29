import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import {
  FiZap,
  FiClock,
  FiArrowRight,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

const PromoBanner = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [promoProducts, setPromoProducts] = useState([]);
  const [timers, setTimers] = useState({});
  const [loading, setLoading] = useState(true);

  // FETCH PROMO PRODUCTS
  const fetchPromoProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/products/promo");
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.products || [];
      setPromoProducts(list);
    } catch (error) {
      console.error("Promo fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // SCROLL HANDLER
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // CALCULATE TIME LEFT
  const calculateTimeLeft = (endTime) => {
    if (!endTime) return null;
    const difference = new Date(endTime).getTime() - new Date().getTime();

    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  useEffect(() => {
    fetchPromoProducts();
  }, []);

  // 1-SECOND TIMER
  useEffect(() => {
    if (promoProducts.length === 0) return;

    const interval = setInterval(() => {
      const updatedTimers = {};
      promoProducts.forEach((product) => {
        if (product.promoEndTime) {
          updatedTimers[product._id] = calculateTimeLeft(product.promoEndTime);
        }
      });
      setTimers(updatedTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [promoProducts]);

  if (!loading && promoProducts.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 my-6 sm:my-12">
      {/* Background Container */}
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-3.5 sm:p-6 shadow-2xl overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* COMPACT RESPONSIVE HEADER */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80 relative z-10">
          <div className="min-w-0">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <FiTrendingUp className="w-3 h-3" /> Live Sale
            </div>

            {/* Single Line Heading */}
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
              Exclusive Deals{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Live Now
              </span>
            </h2>
          </div>

          {/* Compact Arrow Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer active:scale-90"
              aria-label="Previous"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer active:scale-90"
              aria-label="Next"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HORIZONTAL SWIPE CAROUSEL */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-1 relative z-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {promoProducts.map((product) => {
            const productPrice = product.variants?.[0]?.sizes?.[0]?.price || null;
            const productImage = product.variants?.[0]?.images?.[0] || "/placeholder.png";
            const timer = timers[product._id];

            return (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="snap-start shrink-0 w-[165px] xs:w-[180px] sm:w-[230px] md:w-[250px] group bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Product Image Container (Square aspect ratio for balanced height) */}
                <div className="relative w-full aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 pointer-events-none" />

                  {/* Sale Pill Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/95 text-white text-[9px] font-extrabold uppercase tracking-wide shadow-md">
                    <FiZap className="w-2.5 h-2.5 fill-current" />
                    <span className="truncate max-w-[80px] sm:max-w-none">
                      {product.saleText || "SALE"}
                    </span>
                  </div>

                  {/* Clean Bottom Countdown Strip */}
                  {timer && (
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg py-1 px-1.5 flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold text-white">
                      {timer.days > 0 && (
                        <span className="text-amber-300">{timer.days}d</span>
                      )}
                      <span>{String(timer.hours).padStart(2, "0")}h</span>
                      <span className="text-slate-500">:</span>
                      <span>{String(timer.minutes).padStart(2, "0")}m</span>
                      <span className="text-slate-500">:</span>
                      <span className="text-red-400">
                        {String(timer.seconds).padStart(2, "0")}s
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Info & CTA */}
                <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-1.5">
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                      {product.category || "Apparel"}
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Pricing + Action Button */}
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                    <div>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 block font-medium leading-none mb-0.5">
                        Price
                      </span>
                      <div className="text-xs sm:text-sm font-extrabold text-white">
                        ₹{Number(productPrice || 0).toLocaleString("en-IN")}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product._id}`);
                      }}
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-[10px] sm:text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      View <FiArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;