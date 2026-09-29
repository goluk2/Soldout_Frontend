import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { FaMinus, FaPlus, FaTrash, FaShoppingBag, FaTruck } from "react-icons/fa";
import ButtonConfetti from "../components/ButtonConfetti";
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // FETCH CART
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/cart");
      setCartItems(response.data.items || []);
      setGrandTotal(response.data.grandTotal || 0);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // UPDATE QUANTITY
  const updateQuantity = async (sku, quantity) => {
    try {
      await axiosInstance.put("/cart/update", {
        sku,
        quantity,
      });
      fetchCart();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // REMOVE ITEM
  const removeItem = async (sku) => {
    try {
      await axiosInstance.delete("/cart/remove", {
        data: { sku },
      });
      fetchCart();
    } catch (error) {
      console.log(error);
    }
  };

  // 🚚 DELIVERY CHARGES LOGIC (Same as Checkout)
  const shippingCharges = grandTotal > 500 || grandTotal === 0 ? 0 : 40;
  const finalPayable = grandTotal + shippingCharges;
  const amountNeededForFreeDelivery = 500 - grandTotal;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white max-w-md mx-auto p-8 rounded-2xl shadow-sm border border-slate-100 text-center mt-12">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <FaShoppingBag className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-6 text-sm">
              Looks like you haven't added anything to your cart yet. Let's find something awesome!
            </p>
            <Link
              to="/"
              className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition text-center"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* LEFT: CART ITEMS LIST */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* 🚚 FREE DELIVERY PROGRESS NOTIFIER */}
              {shippingCharges > 0 ? (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800 text-sm font-medium">
                  <FaTruck className="text-lg text-amber-600 shrink-0" />
                  <span>
                    Add items worth <strong className="text-amber-950 font-bold">₹{amountNeededForFreeDelivery}</strong> more to get <strong>FREE Delivery</strong>! (Current delivery fee: ₹40)
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium">
                  <FaTruck className="text-lg text-emerald-600 shrink-0" />
                  <span>🎉 Yay! You have unlocked <strong>FREE Delivery</strong> on this order.</span>
                </div>
              )}

              {cartItems.map((item) => (
                <div
                  key={item.sku}
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 transition hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* PRODUCT IMAGE & QUANTITY CONTROLLER */}
                    <div className="flex flex-row sm:flex-col items-center gap-4 sm:w-40 justify-between sm:justify-start">
                      <div className="w-24 h-24 sm:w-40 sm:h-40 bg-slate-50 rounded-xl overflow-hidden p-2 border border-slate-100 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>

                      {/* QUANTITY COUNTER */}
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="font-semibold text-slate-800 px-1 w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h2 className="text-lg font-semibold text-slate-900 line-clamp-2 hover:text-blue-600 transition">
                            {item.name}
                          </h2>
                        </div>

                        {/* ATTRIBUTES */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-medium text-slate-500">
                          {item.color && (
                            <span className="bg-slate-100 px-2.5 py-1 rounded-md">
                              Color: <span className="text-slate-800">{item.color}</span>
                            </span>
                          )}
                          {item.size && (
                            <span className="bg-slate-100 px-2.5 py-1 rounded-md">
                              Size: <span className="text-slate-800">{item.size}</span>
                            </span>
                          )}
                        </div>

                        {/* PRICING BLOCK */}
                        <div className="flex items-baseline gap-2.5 mt-4">
                          <span className="text-xl font-bold text-slate-900">
                            ₹{item.price}
                          </span>
                          <span className="text-sm line-through text-slate-400">
                            ₹{item.price + 500}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            70% OFF
                          </span>
                        </div>

                        <p className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          Delivery in 7 days
                        </p>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex gap-6 mt-6 pt-4 border-t border-slate-100 text-sm">
                        <button
                          onClick={() => removeItem(item.sku)}
                          className="font-semibold text-slate-500 hover:text-red-600 flex items-center gap-2 transition"
                        >
                          <FaTrash className="text-xs" />
                          <span>Remove</span>
                        </button>
                        <button className="font-semibold text-slate-500 hover:text-blue-600 transition">
                          Save for later
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: PRICE SUMMARY SIDEBAR */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <h2 className="text-sm font-bold text-slate-500 tracking-wider uppercase">
                    Price Details
                  </h2>
                </div>

                <div className="p-6 space-y-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Price ({cartItems.length} items)</span>
                    <span className="font-semibold text-slate-900">₹{grandTotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-semibold text-emerald-600">− ₹500</span>
                  </div>

                  {/* DYNAMIC DELIVERY CHARGES */}
                  <div className="flex justify-between pb-4 border-b border-slate-100 items-center">
                    <span>Delivery Charges</span>
                    {shippingCharges === 0 ? (
                      <span className="font-bold text-emerald-600 uppercase text-xs bg-emerald-50 px-2 py-0.5 rounded">
                        FREE
                      </span>
                    ) : (
                      <div className="text-right">
                        <span className="line-through text-slate-400 text-xs mr-1.5">₹40</span>
                        <span className="font-bold text-slate-900">₹40</span>
                      </div>
                    )}
                  </div>

                  {/* FINAL PAYABLE AMOUNT */}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2">
                    <span>Total Amount</span>
                    <span className="text-lg text-blue-600">₹{finalPayable}</span>
                  </div>

                  <div className="text-xs bg-emerald-50 text-emerald-700 font-medium p-3 rounded-xl border border-emerald-100 text-center">
                    🎉 You will save ₹500 on this order
                  </div>
                </div>

                {/* PLACE ORDER BUTTON */}
                {/* PROCEED TO CHECKOUT BUTTON WITH CONFETTI */}
<div className="p-6 pt-0">
  <ButtonConfetti className="confetti-full">
    <Link
      to="/checkout"
      className="
        relative
        z-10
        w-full
        bg-blue-600
        hover:bg-blue-700
        text-white
        font-bold
        py-3.5
        px-4
        rounded-xl
        transition
        text-center
        block
        shadow-md
        shadow-blue-200
        uppercase
        tracking-wide
        text-sm
        hover:scale-[1.02]
        active:scale-[0.98]
      "
    >
      Proceed to Checkout
    </Link>
  </ButtonConfetti>
</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;