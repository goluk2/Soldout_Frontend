import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import SimilarProducts from "../components/SimilarProducts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiShoppingBag, FiTruck, FiCheckCircle, FiInfo, FiClock, FiShare2, FiX, FiCopy, FiMail, FiMessageSquare,FiArrowRight } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaLinkedin } from "react-icons/fa";
import toast from "react-hot-toast";

import ButtonConfetti from "../components/ButtonConfetti";

import ProductReviews from "../components/ProductReviews";


/* Lightweight scroll-reveal wrapper — no extra dependency needed */
const Reveal = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: show ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
      } ${className}`}
    >
      {children}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [mainImage, setMainImage] = useState("");

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isInCart, setIsInCart] = useState(false);
const [checkingCart, setCheckingCart] = useState(false);

  const fetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      setProduct(response.data);

      const similarResponse = await axiosInstance.get(
        `/products?category=${response.data.category}`
      );

      setSimilarProducts(
        similarResponse.data.products.filter((item) => item._id !== response.data._id)
      );

      const firstVariant = response.data.variants?.[0] || null;
      const firstSize = firstVariant?.sizes?.[0] || null;
      setSelectedVariant(firstVariant);
      setSelectedSize(firstSize);
      setMainImage(firstVariant?.images?.[0] || "");
    } catch (error) {
      console.log(error);
    }
  };



  useEffect(() => {
    fetchProduct();
  }, [id]);
  useEffect(() => {
  const checkCartStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token || !selectedSize?.sku) {
      setIsInCart(false);
      return;
    }

    try {
      setCheckingCart(true);

      const response = await axiosInstance.get("/cart");

      const items = response.data.items || [];

      const alreadyInCart = items.some(
        (item) => item.sku === selectedSize.sku
      );

      setIsInCart(alreadyInCart);
    } catch (error) {
      console.log("Cart status check failed:", error);

      // Agar cart fetch fail ho gaya to Add to Cart hi dikhao
      setIsInCart(false);
    } finally {
      setCheckingCart(false);
    }
  };

  checkCartStatus();
}, [selectedSize?.sku]);

  useEffect(() => {
    if (!product?.isLiveSale || !product?.promoEndTime) return;

    const timer = setInterval(() => {
      const difference = new Date(product.promoEndTime) - new Date();

      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 / 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [product]);

  useEffect(() => {
    if (selectedVariant?.images?.length && !mainImage) {
      setMainImage(selectedVariant.images[0]);
    }
  }, [selectedVariant, mainImage]);

  if (!product || !selectedVariant || !selectedSize) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <div className="w-10 h-10 border-2 border-[#16161A]/15 border-t-[#FF4B12] rounded-full animate-spin"></div>
      </div>
    );
  }

  const basePrice = selectedSize.price;
  const currentPrice = product.isLiveSale ? Math.floor(basePrice * 0.8) : basePrice;
  const upiDiscountPrice = currentPrice > 500 ? currentPrice - 50 : currentPrice - 20;
  const bankOfferPrice = currentPrice > 1000 ? currentPrice - 100 : currentPrice - 30;

  // const handleAddToCart = async () => {
  //   try {
  //     const finalPrice = product.isLiveSale ? Math.floor(selectedSize.price * 0.8) : selectedSize.price;

  //     await axiosInstance.post("/cart/add", {
  //       productId: product._id,
  //       color: selectedVariant.color,
  //       size: selectedSize.size,
  //       quantity: 1,
  //       sku: selectedSize.sku,
  //       price: finalPrice,
  //     });

  //     navigate("/cart");
  //   } catch (error) {
  //     console.log("Error adding to cart:", error);
  //     alert("Something went wrong. Please try again.");
  //   }
  // };


  const handleAddToCart = async () => {
  try {
    const token = localStorage.getItem("token");

    // Login check before API call
    if (!token) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    // Already in cart
    if(isInCart){
      navigate("/cart");
      return;
    }


    const finalPrice = product.isLiveSale
      ? Math.floor(selectedSize.price * 0.8)
      : selectedSize.price;

    await axiosInstance.post("/cart/add", {
      productId: product._id,
      color: selectedVariant.color,
      size: selectedSize.size,
      quantity: 1,
      sku: selectedSize.sku,
      price: finalPrice,
    });
    setIsInCart(true);

    toast.success("Added to cart successfully",{
      icon: "🛒",

    });
    

  } catch (error) {
    console.error("Add to cart error:", error);

    // Unauthorized
    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    // Validation or custom backend message
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      return;
    }

    // Network error
    if (error.code === "ERR_NETWORK") {
      toast.error("Check your internet connection");
      return;
    }

    // Server error
    toast.error("Something went wrong. Please try again");
  }
};

  return (
    <div className="bg-[#F5F3EE] min-h-screen w-full flex flex-col items-center font-[Inter] antialiased text-[#16161A]">
      <Navbar />

      <main className="w-full max-w-[1240px] px-4 sm:px-6 py-8 lg:py-12">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ---------------- GALLERY ---------------- */}
         {/* ---------------- GALLERY ---------------- */}

<section
  className="
    lg:col-span-5
    lg:sticky
    lg:top-[92px]
    lg:self-start
    lg:h-fit
    lg:z-10
  "
>
  <div className="space-y-4 relative">
    <button
      onClick={() => setIsShareModalOpen(true)}
      className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm p-2.5 rounded-full border border-[#E4E1D9] text-[#6B6862] hover:text-[#FF4B12] hover:bg-white shadow-sm transition-all"
      title="Share Product"
    >
      <FiShare2 className="text-lg" />
    </button>
    {/* IMAGE GALLERY */}

    <div className="lg:flex lg:flex-row-reverse lg:gap-3">
      {/* MAIN IMAGE */}

      <div
        className="
          relative
          flex-1
          bg-white
          border
          border-[#E4E1D9]
          overflow-hidden
          aspect-[4/5]
          group
        "
      >
        {product.isLiveSale && (
          <div className="absolute -left-2 top-6 z-10 -rotate-6 flex items-center gap-1.5 bg-[#16161A] text-white text-[11px] font-[JetBrains_Mono] font-semibold tracking-wide px-3 py-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B12] animate-pulse" />

            20% OFF
          </div>
        )}

        <img
          src={mainImage || selectedVariant.images[0]}
          alt={`${product.name} - ${selectedVariant.color}`}
          className="
            w-full
            h-full
            object-contain
            bg-white
            transition-transform
            duration-700
            ease-out
            group-hover:scale-[1.06]
          "
        />
      </div>

      {/* THUMBNAILS */}

      <div
        className="
          mt-3
          flex
          gap-2.5
          overflow-x-auto
          pb-1

          lg:mt-0
          lg:flex-col
          lg:w-[76px]
          lg:max-h-[560px]
          lg:overflow-y-auto
          lg:overflow-x-hidden
          lg:pb-0

          subtle-scrollbar
        "
      >
        {selectedVariant.images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={`
              w-16
              h-20

              lg:w-full
              lg:h-20

              overflow-hidden
              border-2
              flex-shrink-0
              transition

              ${
                mainImage === img
                  ? "border-[#16161A]"
                  : "border-[#E4E1D9] hover:border-[#16161A]/40"
              }
            `}
          >
            <img
              src={img}
              alt={`${product.name} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>

    {/* DESKTOP ACTION BUTTONS */}

    {/* DESKTOP ACTION BUTTONS */}
<div className="hidden lg:grid grid-cols-2 gap-3 pt-1">

  {/* PRIMARY CART BUTTON */}
  <ButtonConfetti className="confetti-full">
    <button
      onClick={() => {
        if (isInCart) {
          navigate("/cart");
        } else {
          handleAddToCart();
        }
      }}
      disabled={checkingCart}
      className={`
        relative
        w-full
        h-14
        border-2
        font-semibold
        text-[15px]
        tracking-wide
        active:scale-[0.99]
        transition-all
        duration-300
        flex
        items-center
        justify-center
        gap-2
        overflow-hidden
        disabled:opacity-60
        ${
          isInCart
            ? "border-[#157F3C] bg-[#157F3C] text-white hover:bg-[#126B32]"
            : "border-[#16161A] text-[#16161A] hover:bg-[#16161A] hover:text-white"
        }
      `}
    >
      {checkingCart ? (
        <>
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          Checking...
        </>
      ) : isInCart ? (
        <>
          <FiShoppingBag className="text-lg" />
          View Cart
          <FiArrowRight className="text-base transition-transform group-hover:translate-x-1" />
        </>
      ) : (
        <>
          <FiShoppingBag className="text-lg" />
          Add to Cart
        </>
      )}
    </button>
  </ButtonConfetti>

  {/* SECONDARY FUN BUTTON */}
  <button
    onClick={() => navigate("/")}
    className="
      group
      h-14
      border-2
      border-[#E4E1D9]
      bg-white
      text-[#16161A]
      font-bold
      text-[15px]
      tracking-wide
      transition-all
      duration-300
      flex
      items-center
      justify-center
      gap-2
      hover:border-[#16161A]
      hover:bg-[#F8F7F4]
      active:scale-[0.99]
    "
  >
    <span className="transition-transform duration-300 group-hover:-rotate-12">
      ✨
    </span>

    Keep Shopping

    <FiArrowRight
      className="
        transition-transform
        duration-300
        group-hover:translate-x-1
      "
    />
  </button>

</div>
  </div>
</section>

          {/* ---------------- DETAILS ---------------- */}
          <section className="lg:col-span-7">
            <div className="space-y-8">

              <div className="flex flex-col gap-4 pb-6 border-b border-[#E4E1D9]">
                {product.brand && (
                  <span className="inline-flex w-fit items-center gap-2 text-[11px] font-[JetBrains_Mono] font-semibold tracking-[0.2em] uppercase text-[#FF4B12]">
                    <span className="w-4 h-px bg-[#FF4B12]" /> {product.brand}
                  </span>
                )}

                <h1 className="text-4xl sm:text-5xl font-[Bebas_Neue] tracking-wide leading-[0.95] text-[#16161A]">
                  {product.name}
                </h1>

                {product.description && (
                  <p className="max-w-xl text-[#6B6862] text-[15px] leading-relaxed">
                    {product.description}
                  </p>
                )}


              {/* Rattings */}
              
                {/* <div className="flex items-center gap-3 pt-1">
                  <div className="bg-[#16161A] text-white px-2.5 py-1 text-xs font-[JetBrains_Mono] font-bold flex items-center gap-1">
                    4.2 ★
                  </div>
                  <span className="text-xs font-medium text-[#6B6862]">
                    10,370 Ratings
                  </span>
                </div> */}
              </div>

              {/* PRICE TAG */}
              {/* PRICE TAG */}
<Reveal>
  {product.isLiveSale ? (
    <div className="relative overflow-hidden border border-[#E4E1D9] bg-white">
      
      {/* TOP SALE BAR */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E4E1D9] bg-[#16161A] px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4B12] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF4B12]" />
          </span>

          <span className="text-[11px] font-[JetBrains_Mono] font-bold tracking-[0.18em] uppercase text-white">
            Live Sale Active
          </span>
        </div>

        {timeLeft && (
          <div className="flex items-center gap-1.5">
            {[
              ["D", timeLeft.days],
              ["H", timeLeft.hours],
              ["M", timeLeft.minutes],
              ["S", timeLeft.seconds],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center gap-1 sm:gap-1.5"
              >
                <span className="min-w-[28px] bg-white px-1.5 py-1 text-center text-[10px] font-[JetBrains_Mono] font-bold text-[#16161A] sm:min-w-[32px]">
                  {String(value).padStart(2, "0")}
                </span>

                <span className="hidden text-[9px] font-[JetBrains_Mono] text-white/50 sm:inline">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRICE CONTENT */}
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        
        {product.saleText && (
          <p className="mb-3 text-sm font-medium text-[#6B6862]">
            {product.saleText}
          </p>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          
          {/* PRICE */}
          <div>
            <p className="mb-1 text-[10px] font-[JetBrains_Mono] font-semibold tracking-[0.16em] uppercase text-[#6B6862]">
              Special Sale Price
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl font-[Bebas_Neue] tracking-wide text-[#16161A] sm:text-5xl">
                ₹{currentPrice}
              </span>

              <span className="text-sm font-[JetBrains_Mono] text-[#8C8880] line-through">
                ₹{basePrice}
              </span>
            </div>
          </div>

          {/* DISCOUNT */}
          <div className="border-l border-[#E4E1D9] pl-4 sm:pl-5">
            <p className="text-[10px] font-[JetBrains_Mono] tracking-wider uppercase text-[#6B6862]">
              You Save
            </p>

            <p className="mt-1 text-lg font-bold text-[#157F3C]">
              ₹{basePrice - currentPrice}
            </p>

            <span className="mt-1 inline-block bg-[#FF4B12] px-2 py-1 text-[10px] font-[JetBrains_Mono] font-bold text-white">
              20% OFF
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM MESSAGE */}
      <div className="border-t border-dashed border-[#E4E1D9] bg-[#F8F7F4] px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <FiClock className="text-[#FF4B12]" />

          <p className="text-xs text-[#6B6862]">
            Limited-time offer. Price will automatically update when the sale ends.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className="border border-[#E4E1D9] bg-white px-5 py-5 sm:px-6 sm:py-6">
      <p className="mb-2 text-[10px] font-[JetBrains_Mono] font-semibold tracking-[0.16em] uppercase text-[#6B6862]">
        Price
      </p>

      <span className="text-4xl font-[Bebas_Neue] tracking-wide text-[#16161A] sm:text-5xl">
        ₹{currentPrice}
      </span>
    </div>
  )}
</Reveal>

              {/* COLOR + SIZE */}
              <Reveal delay={60} className="grid gap-6">
                <div>
                  <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.2em] text-[#6B6862] uppercase block mb-3">
                    Color — <span className="text-[#16161A] font-semibold normal-case">{selectedVariant.color}</span>
                  </label>
                  <div className="flex gap-4 overflow-x-auto subtle-scrollbar pb-1">
                    {product.variants.map((variant) => (
                      <button
                        key={variant._id}
                        onClick={() => {
                          setSelectedVariant(variant);
                          setSelectedSize(variant.sizes[0]);
                          setMainImage(variant.images[0]);
                        }}
                        className="flex flex-col items-center gap-1.5 shrink-0"
                      >
                        <span
                          className={`w-14 h-14 rounded-full overflow-hidden border-2 transition ${
                            selectedVariant._id === variant._id
                              ? "border-[#16161A] ring-2 ring-offset-2 ring-[#16161A]/15"
                              : "border-[#E4E1D9] opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={variant.images[0]} alt="" className="w-full h-full object-cover" />
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[#6B6862] font-medium">
                          {variant.color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.2em] text-[#6B6862] uppercase block mb-3">
                    Select Size
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {selectedVariant.sizes.map((size) => (
                      <button
                        key={size._id}
                        onClick={() => setSelectedSize(size)}
                        className={`h-11 min-w-11 px-4 border font-[JetBrains_Mono] font-semibold text-sm transition-all flex items-center justify-center ${
                          selectedSize._id === size._id
                            ? "border-[#16161A] bg-[#16161A] text-white"
                            : "border-[#E4E1D9] text-[#16161A] hover:border-[#16161A]/50"
                        }`}
                      >
                        {size.size}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* OFFERS */}
              <Reveal delay={90}>
                <div className="border border-[#E4E1D9] bg-white">
                  <div className="flex items-center gap-2 text-[#16161A] font-semibold text-sm px-5 py-4 border-b border-[#E4E1D9]">
                    <FiInfo className="text-[#FF4B12]" /> Exclusive Pricing &amp; Offers
                  </div>
                  <div className="divide-y divide-dashed divide-[#E4E1D9]">
                    <div className="flex justify-between items-center px-5 py-4 gap-4">
                      <span className="text-sm text-[#6B6862]">Pay via UPI &amp; get flat cash discount</span>
                      <span className="font-[JetBrains_Mono] font-bold text-[#16161A] whitespace-nowrap">₹{upiDiscountPrice}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4 gap-4">
                      <span className="text-sm text-[#6B6862]">Applicable Debit Card / NetBanking tier</span>
                      <span className="font-[JetBrains_Mono] font-bold text-[#157F3C] whitespace-nowrap">₹{bankOfferPrice}</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* DELIVERY */}
              <Reveal delay={120} className="space-y-4">
                <h4 className="text-[11px] font-[JetBrains_Mono] tracking-[0.2em] text-[#6B6862] uppercase flex items-center gap-2">
                  <FiTruck /> Delivery Information
                </h4>

                <div className="border border-[#E4E1D9] bg-white divide-y divide-[#E4E1D9]">
                  <div className="flex justify-between gap-4 px-5 py-4">
                    <span className="text-sm text-[#6B6862]">Delivery</span>
                    <span className="font-semibold text-sm text-right">Within {product.deliveryDays} Days</span>
                  </div>

                  {/* Return policy  */}


                  {/* <div className="flex justify-between gap-4 px-5 py-4">
                    <span className="text-sm text-[#6B6862]">Return</span>
                    <span className="font-semibold text-sm text-right">{product.returnPolicy}</span>
                  </div> */}

                  
                  {/* <div className="flex justify-between gap-4 px-5 py-4">
                    <span className="text-sm text-[#6B6862]">Cash On Delivery</span>
                    <span className={`font-semibold text-sm ${product.codAvailable ? "text-[#157F3C]" : "text-[#FF4B12]"}`}>
                      {product.codAvailable ? "Available" : "Not Available"}
                    </span>
                  </div> */}

                  
  <div className="flex justify-between gap-4 px-5 py-4">
    <span className="text-sm text-[#6B6862]">Payment</span>
    <span className="font-semibold text-sm text-[#157F3C] text-right">
      Secure Online Payment
    </span>
  </div>
                  <div className="flex justify-between gap-4 px-5 py-4">
                    <span className="text-sm text-[#6B6862]">Seller</span>
                    <span className="font-semibold text-sm text-right">{product.sellerName}</span>
                  </div>
                </div>
              </Reveal>

              {/* HIGHLIGHTS */}
              {product.highlights && product.highlights.length > 0 && (
                <Reveal delay={150} className="pt-2">
                  <h4 className="text-[11px] font-[JetBrains_Mono] tracking-[0.2em] text-[#6B6862] uppercase mb-4">
                    Product Attributes &amp; Highlights
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 text-sm">
                    {product.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-3 py-2.5 border-b border-[#E4E1D9]">
                        <FiCheckCircle className="text-[#157F3C] flex-shrink-0" />
                        <span className="text-[#16161A] font-medium">{highlight}</span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#E4E1D9]">
                      <span className="text-[#6B6862]">Inventory Status</span>
                      <span className={`font-bold text-right font-[JetBrains_Mono] ${selectedSize.stock > 0 ? "text-[#157F3C]" : "text-[#FF4B12]"}`}>
                        {selectedSize.stock > 0 ? `${selectedSize.stock} Units Left` : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </Reveal>
              )}

              {/* SPECIFICATIONS */}
              {product.specifications && (
                <Reveal delay={180} className="pt-6 border-t border-[#E4E1D9]">
                  <h3 className="text-xl font-[Bebas_Neue] tracking-wide mb-5">Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4 border-b border-[#E4E1D9] py-3.5">
                        <span className="capitalize text-[#6B6862] text-sm">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="font-medium text-sm text-right">{value || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}

              {/* PACKAGE CONTENTS */}
              {product.packageContents?.length > 0 && (
                <Reveal delay={210} className="pt-6 border-t border-[#E4E1D9]">
                  <h3 className="text-xl font-[Bebas_Neue] tracking-wide mb-4">Package Contents</h3>
                  <ul className="space-y-2.5">
                    {product.packageContents.map((item, index) => (
                      <li key={index} className="flex gap-2.5 items-start text-sm">
                        <FiCheckCircle className="text-[#157F3C] mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              <ProductReviews productId={product._id} />
            </div>
          </section>
        </div>

        <div className="mt-16 mb-28 lg:mb-0">
          <SimilarProducts similarProducts={similarProducts} />
        </div>
      </main>

      {/* MOBILE STICKY CTA */}
     {/* MOBILE STICKY CTA */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E4E1D9] px-4 py-3">
  <div className="max-w-[1240px] mx-auto flex gap-3">

    {/* CART / VIEW CART */}
    <ButtonConfetti className="flex-1">
      <button
        onClick={() => {
          if (isInCart) {
            navigate("/cart");
          } else {
            handleAddToCart();
          }
        }}
        disabled={checkingCart}
        className={`
          w-full
          h-12
          border-2
          font-semibold
          text-sm
          flex
          items-center
          justify-center
          gap-2
          active:scale-[0.98]
          transition-all
          duration-300
          disabled:opacity-60
          ${
            isInCart
              ? "border-[#157F3C] bg-[#157F3C] text-white"
              : "border-[#16161A] text-[#16161A] hover:bg-[#16161A] hover:text-white"
          }
        `}
      >
        {checkingCart ? (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : isInCart ? (
          <>
            <FiShoppingBag />
            View Cart
          </>
        ) : (
          <>
            <FiShoppingBag />
            Add
          </>
        )}
      </button>
    </ButtonConfetti>

    {/* KEEP SHOPPING */}
    <button
      onClick={() => navigate("/")}
      className="
        flex-1
        h-12
        bg-[#FF4B12]
        text-white
        font-bold
        text-sm
        flex
        items-center
        justify-center
        gap-2
        active:scale-[0.98]
        transition-all
        duration-300
        hover:bg-[#16161A]
      "
    >
      <span>✨</span>
      Keep Shopping
    </button>

  </div>
</div>

      <Footer />

      {/* SHARE MODAL */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productUrl={window.location.href}
        productName={product.name}
      />

    </div>
  );
};
const ShareModal = ({ isOpen, onClose, productUrl, productName }) => {
  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(productUrl);
  const encodedName = encodeURIComponent(`Check out ${productName} on SoldOut!`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    toast.success("Link copied to clipboard!");
    onClose();
  };

  const shareOptions = [
    { name: "Copy Link", icon: FiCopy, action: handleCopyLink, color: "bg-gray-100 text-gray-700" },
    { name: "WhatsApp", icon: FaWhatsapp, url: `https://wa.me/?text=${encodedName}%20${encodedUrl}`, color: "bg-emerald-50 text-emerald-600" },
    { name: "Facebook", icon: FaFacebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: "bg-blue-50 text-blue-600" },
    { name: "Gmail", icon: FiMail, url: `mailto:?subject=${encodedName}&body=${encodedUrl}`, color: "bg-red-50 text-red-600" },
    { name: "LinkedIn", icon: FaLinkedin, url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedName}`, color: "bg-sky-50 text-sky-600" },
    { name: "SMS", icon: FiMessageSquare, url: `sms:?&body=${encodedName}%20${encodedUrl}`, color: "bg-gray-100 text-gray-700" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">Share Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black p-1">
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          {shareOptions.map((opt) => {
            const Icon = opt.icon;
            if (opt.action) {
              return (
                <button key={opt.name} onClick={opt.action} className="flex flex-col items-center gap-2 group">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${opt.color}`}>
                    <Icon className="text-2xl" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{opt.name}</span>
                </button>
              );
            }
            return (
              <a key={opt.name} href={opt.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group" onClick={onClose}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${opt.color}`}>
                  <Icon className="text-2xl" />
                </div>
                <span className="text-xs font-medium text-gray-600">{opt.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default ProductDetails;