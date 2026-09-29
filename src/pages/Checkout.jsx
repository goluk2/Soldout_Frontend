import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosInstance from "../api/axios";
import { useNavigate } from "react-router-dom";
import ButtonConfetti from "../components/ButtonConfetti";

const Checkout = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [paymentInProgress, setPaymentInProgress] = useState(false); const [failureReported, setFailureReported] = useState(false); const [popupOpen, setPopupOpen] = useState(false);
  
  // NAYE CONTROLS FOR MULTIPLE SAVED ADDRESSES GRID
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveAddressCheckbox, setSaveAddressCheckbox] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
const [showPayConfetti, setShowPayConfetti] = useState(true);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    address: "",
  });

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  // FETCH BOTH CART & USER SAVED ADDRESSES 
  const fetchData = async () => {
    try {
      // 1. Get items in cart
      const cartResponse = await axiosInstance.get("/cart");
      setCartItems(cartResponse.data.items || []);

      // 2. Get user saved addresses array from our new API
      const addressResponse = await axiosInstance.get("/auth/addresses");
      const fetchedAddresses = addressResponse.data.addresses || [];
      setSavedAddresses(fetchedAddresses);

      // Agar user ke paas purane saved addresses hain, toh unhe default form ke badle card select view dikhao
      if (fetchedAddresses.length > 0) {
        setSelectedAddressId(fetchedAddresses[0]._id); // default first selection
        setAddress(fetchedAddresses[0]); // prefill actual active selection payload
        setShowNewAddressForm(false);
      } else {
        setShowNewAddressForm(true); // Address khali hone par automatic form khulega
      }
    } catch (error) {
      console.log("Error loading checkout prerequisites:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    setShowPayConfetti(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

  // Handle click on existing address card select
  const handleSelectSavedAddress = (selectedAddr) => {
    setSelectedAddressId(selectedAddr._id);
    setAddress(selectedAddr);
  };

  // Toggle layout logic to show inputs for new shipping profile
  const handleToggleNewForm = () => {
    setSelectedAddressId(""); 
    setAddress({
      fullName: "",
      phone: "",
      pincode: "",
      city: "",
      state: "",
      country: "",
      address: "",
    });
    setShowNewAddressForm(true);
  };

  // 🛠️ DYNAMIC MATH LOGIC TO GET INDIVIDUAL ITEM PRICE WITH LIVE SALE CHECKS
  const getItemPrice = (item) => {
    if (item.productId?.isLiveSale || item.isLiveSale) {
      return Math.floor(item.price * 0.8); 
    }
    return item.price;
  };

  // CALCULATE EXACT CALCULATED SUB-TOTAL
  const totalBasePrice = cartItems.reduce((acc, item) => {
    return acc + (getItemPrice(item) * item.quantity);
  }, 0);

  // SECURE CALCULATED SHIPPING MATRIX RULES
  const shippingCharges = totalBasePrice > 500 || totalBasePrice === 0 ? 0 : 40;
  const finalPayableAmount = totalBasePrice + shippingCharges;

  const handlePlaceOrder = async () => {
    if (paymentInProgress) return;
    if (!address.fullName || !address.phone || !address.pincode || !address.city || !address.address) {
      alert("Please fill all the shipping details first.");
      return;
    }

    try {
      setPlacingOrder(true);

      // SECURITY RULE: Agar user ne "Save this address" check kiya hai, toh checkout trigger se pehle database save api hit hogi
      if (showNewAddressForm && saveAddressCheckbox) {
        try {
          await axiosInstance.post("/auth/addresses", address);
          console.log("Address secured and saved successfully inside DB profile.");
        } catch (addrErr) {
          console.log("Background address saving skipped or failed safely:", addrErr);
        }
      }

      // COD FLOW 
      // if (paymentMethod === "COD") { 
      //   const codResponse = await axiosInstance.post( 
      //     "/orders/place-cod", { 
      //       shippingAddress: address, 
      //     } ); 
      //     alert(codResponse.data.message || "Order placed successfully"); 
          
      //     setCartItems([]); 
      //     navigate("/my-orders", { 
      //       replace: true, 
      //     }); 
      //     return; 
      //   }
        
        // ONLINE PAYMENT FLOW 
        
        const orderResponse = await axiosInstance.post("/orders/place", { 
          shippingAddress: address, 
          paymentMethod: "RAZORPAY",
         });

      const createdOrder = orderResponse.data.order;

      // If backend returned an existing unpaid order,
// use it instead of creating another one.

const orderToPay =
  orderResponse.data.existingOrder
    ? orderResponse.data.order
    : createdOrder;


      const razorpayResponse = await axiosInstance.post(
"/orders/create-razorpay-order",
{
    orderId: orderToPay._id,
}
);
console.log("Razorpay Response:", razorpayResponse.data);
      const razorpayOrder = razorpayResponse.data.razorpayOrder;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SoldOut",
        description: "Secure Payment",
        order_id: razorpayOrder.id,

        handler: async function (response) { 
          
          try { 
            const verifyResponse = await axiosInstance.post( "/orders/verify-payment",
               { 
                razorpay_order_id: response.razorpay_order_id, 
                razorpay_payment_id: response.razorpay_payment_id, 
                razorpay_signature: response.razorpay_signature, 
                orderId: orderToPay._id, 
              } 
            ); 
            setPopupOpen(false); 
            setPaymentInProgress(false); 
            alert(verifyResponse.data.message || "Payment successful"); 
            setCartItems([]); 
            navigate("/my-orders", 
              { 
                replace: true 
              });
             } catch (error) { 
              setPopupOpen(false); 
              setPaymentInProgress(false); 
              const data = error.response?.data; 
              if (data?.outOfStock && data?.refunded) { 
                alert( 
                  "Payment received, but the item became out of stock. Your refund has been completed automatically."
                 ); 
                 navigate("/my-orders", { replace: true }); 
                 return; 
                } 
                if (data?.outOfStock && data?.refundPending) { 
                  alert( 
                    "Payment received, but the item became out of stock. Your refund is being processed automatically." 
                  ); 
                  navigate("/my-orders", { replace: true }); 
                  return; 
                } 
                if (data?.message?.includes("EXPIRED")) { 
                  alert( 
                    "This payment session has expired. Please place the order again." 
                  ); 
                  
                  return; 
                } 
                alert( data?.message || "Payment verification failed. If money was deducted, please check My Orders before retrying." 

                );
               } 
              },

        prefill: {
          name: address.fullName,
          contact: address.phone,
        },

        theme: {
          color: "#111827",
        },
modal: {
  ondismiss: async function () { 
    setPopupOpen(false);
     if (failureReported) return; 

     setFailureReported(true); 
     try { 
      await axiosInstance.post("/orders/payment-failed", { 
        orderId: orderToPay._id, 
        reason: "User closed Razorpay popup", 
      }); 
      alert("Payment cancelled");
     } catch (err) { 
      console.log(err);
     } finally { 
      setPaymentInProgress(false); 
    } 
  },
},
      
      };

      setPaymentInProgress(true); 
      setFailureReported(false); 
      setPopupOpen(true);
      const razor = new window.Razorpay(options);

razor.on("payment.failed", async function (response) 
{ 
  if (failureReported) return; 
  setFailureReported(true); 
  setPopupOpen(false); 
  try { 
    await axiosInstance.post("/orders/payment-failed", { 
      orderId: orderToPay._id, 
      reason: response.error.description || "Payment Failed", 
    }); 
    alert( response.error.description || "Payment failed" ); 
  } catch (err) 
  { 
    console.log(err); 
  } finally { 
    setPaymentInProgress(false); 
  } 
});

razor.open();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally { 
      setPlacingOrder(false); 
      
      if (!popupOpen) { 
        setPaymentInProgress(false); 
      } 
    }
  };
  return (
    /* 🛠️ FIXED: Added flex flex-col and min-h-screen to parent wrapper to securely push footer down */
    <div className="min-h-screen bg-[#f7f7f8] flex flex-col justify-between">
      <div>
        <Navbar />

        {/* 🛠️ FIXED: Added flex-1 to dynamic contents to auto fill empty screens layout spacing */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

          {/* STEP SECTION */}
          <div className="flex items-center justify-center gap-5 mb-10 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                1
              </div>
              <span className="font-medium text-black">Address</span>
            </div>

            <div className="w-20 h-[2px] bg-gray-300"></div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">
              2
            </div>
            <span className="font-medium text-gray-500">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-8">

          {/* LEFT */}
          <div className="space-y-8">

            {/* ADDRESS SECTION CONTAINER */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 sm:p-8">

              <div className="mb-8 px-2 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-black pl-1">
                    Shipping Information
                  </h2>
                  <p className="text-gray-500 mt-2 pl-1 leading-relaxed">
                    Select a saved delivery address profile or add a new one.
                  </p>
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleNewForm}
                    className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition hover:bg-neutral-800"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {/* DISPLAY MULTIPLE SAVED ADDRESS CARDS GRID */}
              {savedAddresses.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 mb-6 px-2">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedAddressId === addr._id
                          ? "border-black bg-neutral-50/70 ring-1 ring-black"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-black text-base">{addr.fullName}</h4>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedAddressId === addr._id ? "border-black" : "border-gray-300"}`}>
                            {selectedAddressId === addr._id && <span className="w-2 h-2 rounded-full bg-black"></span>}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-600 leading-relaxed line-clamp-2 mb-2">{addr.address}</p>
                        <p className="text-xs text-gray-500 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                      <p className="text-xs text-black font-semibold mt-4 pt-2 border-t border-gray-100/70">📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* INPUT FORM BLOCK: Show only if form toggle or no addresses found */}
              {showNewAddressForm && (
                <div className="border-t pt-6 mt-6 border-gray-100">
                  {savedAddresses.length > 0 && (
                    <div className="mb-4 flex items-center justify-between px-2">
                      <h3 className="text-sm font-bold text-gray-900">Create New Shipping Destination</h3>
                      <button
                        type="button"
                        onClick={() => {
                          if (savedAddresses.length > 0) {
                            handleSelectSavedAddress(savedAddresses[0]);
                            setShowNewAddressForm(false);
                          }
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-black underline"
                      >
                        Cancel & Use Saved Address
                      </button>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-5 ">
                    <input
                      type="text"
                      name="fullName"
                      value={address.fullName || ""}
                      placeholder="Full Name"
                      onChange={handleChange}
                      className="h-14 px-6 rounded-2xl border bg-[#fafafa] border-gray-200 focus:border-black outline-none"
                    />

                    <input
                      type="text"
                      name="phone"
                      value={address.phone || ""}
                      placeholder="Phone Number"
                      onChange={handleChange}
                      className="h-14 px-6 rounded-2xl border bg-[#fafafa] border-gray-200 focus:border-black outline-none"
                    />

                    <input
                      type="text"
                      name="city"
                      value={address.city || ""}
                      placeholder="City"
                      onChange={handleChange}
                      className="h-14 px-6 rounded-2xl border bg-[#fafafa] border-gray-200 focus:border-black outline-none"
                    />

                    <input
                      type="text"
                      name="state"
                      value={address.state || ""}
                      placeholder="State"
                      onChange={handleChange}
                      className="h-14 px-6 rounded-2xl border bg-[#fafafa] border-gray-200 focus:border-black outline-none"
                    />

                    <input
                      type="text"
                      name="country"
                      value={address.country || ""}
                      placeholder="Country"
                      onChange={handleChange}
                      className="h-14 px-6 rounded-2xl border bg-[#fafafa] border-gray-200 focus:border-black outline-none"
                    />

                    <input
                      type="text"
                      name="pincode"
                      value={address.pincode || ""}
                      placeholder="Postal Code"
                      onChange={handleChange}
                      className="h-14 px-6 rounded-2xl border bg-[#fafafa] border-gray-200 focus:border-black outline-none"
                    />

                    <textarea
                      name="address"
                      value={address.address || ""}
                      placeholder="Full Address"
                      onChange={handleChange}
                      className="md:col-span-2 min-h-[140px] p-5 rounded-2xl border bg-[#fafafa] border-gray-200 focus:border-black outline-none resize-none "
                    />
                  </div>

                  {/* DYNAMIC CHECKBOX TO OPT-IN ADDRESS FOR FUTURE SAVING */}
                  <div className="mt-4 px-2 flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="saveAddressId"
                      checked={saveAddressCheckbox}
                      onChange={(e) => setSaveAddressCheckbox(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                    />
                    <label htmlFor="saveAddressId" className="text-xs font-semibold text-gray-600 select-none cursor-pointer">
                      Save this address for future orders
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT CARDS */}
            <div className="space-y-5">
              {cartItems.map((item) => {
                const singlePrice = getItemPrice(item);
                return (
                  <div
                    key={item.sku}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">

                      <div className="w-full sm:w-32 h-40 rounded-2xl overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between pl-2">

                        <div>
                          <h2 className="text-lg font-semibold text-black mb-3">
                            {item.name}
                          </h2>

                          <div className="flex gap-3 flex-wrap text-sm text-gray-500 mb-4">
                            <span className="px-3 py-1 bg-gray-100 rounded-full">
                              {item.color}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 rounded-full">
                              {item.size}
                            </span>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              In Stock
                            </span>

                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Fast Delivery
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-6 pt-4 border-t px-2">
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>

                          <p className="text-2xl font-bold text-black">
                            ₹{singlePrice * item.quantity}
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="sticky top-8 h-fit">

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

              {/* TOP */}
              <div className="px-7 py-6 border-b bg-black text-white">
                <h2 className="text-xl font-bold pl-1">
                  Order Summary
                </h2>
                <p className="text-gray-300 text-sm mt-2 pl-1">
                  Review before payment
                </p>
              </div>

              {/* BODY */}
              <div className="px-7 py-6 space-y-6">

                <div className="flex justify-between items-center text-gray-600 px-1">
                  <span>Subtotal</span>
                  <span>₹{totalBasePrice}</span>
                </div>

                <div className="flex justify-between items-center text-gray-600 px-1">
                  <span>Shipping</span>
                  {shippingCharges === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    <span className="text-gray-900 font-semibold">₹{shippingCharges}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-gray-600 px-1">
                  <span>Platform Fee</span>
                  <span>₹0</span>
                </div>

                <div className="border-t pt-6 px-1 flex justify-between text-2xl font-bold text-black">
                  <span>Total</span>
                  <span>₹{finalPayableAmount}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 px-1">
                  <div className="bg-gray-50 rounded-2xl p-3 text-center text-xs font-medium">
                    Secure
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3 text-center text-xs font-medium">
                    Fast
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3 text-center text-xs font-medium">
                    Trusted
                  </div>
                </div>

             <div className="space-y-3 mt-6">
  <h3 className="text-sm font-semibold text-gray-700 px-1">
    Select Payment Method
  </h3>

  <button
    type="button"
    onClick={() => setPaymentMethod("RAZORPAY")}
    className={`w-full p-4 rounded-2xl border text-left transition ${
      paymentMethod === "RAZORPAY"
        ? "border-black bg-black text-white"
        : "border-gray-200 bg-white text-black hover:border-gray-400"
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold">Online Payment</p>
        <p
          className={`text-sm ${
            paymentMethod === "RAZORPAY"
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          UPI, Cards, Wallets, Net Banking
        </p>
      </div>

      {paymentMethod === "RAZORPAY" && (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
        </div>
      )}
    </div>
  </button>

  {/* <button
    type="button"
    onClick={() => setPaymentMethod("COD")}
    className={`w-full p-4 rounded-2xl border text-left transition ${
      paymentMethod === "COD"
        ? "border-black bg-black text-white"
        : "border-gray-200 bg-white text-black hover:border-gray-400"
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold">Cash on Delivery</p>
        <p
          className={`text-sm ${
            paymentMethod === "COD"
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          Pay when your order arrives
        </p>
      </div>

      {paymentMethod === "COD" && (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
        </div>
      )}
    </div>
  </button> */}
</div>
                <ButtonConfetti className="confetti-full">
  <button
    onClick={handlePlaceOrder}
    disabled={
      placingOrder ||
      paymentInProgress ||
      cartItems.length === 0
    }
    className="
      relative
      z-10
      w-full
      h-14
      rounded-2xl
      bg-black
      text-white
      font-semibold
      text-lg
      hover:scale-[1.02]
      active:scale-[0.98]
      transition-all
      duration-300
      disabled:opacity-50
    "
  >
    {placingOrder
      ? "Creating order..."
      : paymentInProgress
      ? "Waiting for payment..."
      : paymentMethod === "COD"
      ? `Place Order • ₹${finalPayableAmount}`
      : `Pay ₹${finalPayableAmount}`}
  </button>
</ButtonConfetti>

                <p className="text-xs text-gray-400 text-center leading-relaxed px-4 pt-2">
                  {paymentMethod === "COD" ? "You will pay in cash when the order is delivered to your address." : "Your payment is encrypted and securely processed by Razorpay."}
                </p>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  
  );

};

export default Checkout;