import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axios";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";
import { CheckCircle, Package, Truck, Home, XCircle, Clock } from "lucide-react";

const statusSteps = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const statusMeta = {
  PENDING: {
    label: "Pending",
    step: 0,
    icon: Clock,
    color: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    dot: "bg-amber-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    step: 1,
    icon: CheckCircle,
    color: "border-blue-400/40 bg-blue-400/10 text-blue-200",
    dot: "bg-blue-400",
  },
  PACKED: {
    label: "Packed",
    step: 2,
    icon: Package,
    color: "border-orange-400/40 bg-orange-400/10 text-orange-200",
    dot: "bg-orange-400",
  },
  SHIPPED: {
    label: "Shipped",
    step: 3,
    icon: Truck,
    color: "border-indigo-400/40 bg-indigo-400/10 text-indigo-200",
    dot: "bg-indigo-400",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    step: 4,
    icon: Truck,
    color: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
    dot: "bg-cyan-400",
  },
  DELIVERED: {
    label: "Delivered",
    step: 5,
    icon: Home,
    color: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    dot: "bg-emerald-400",
  },
  CANCELLED: {
    label: "Cancelled",
    step: 0,
    icon: XCircle,
    color: "border-rose-400/40 bg-rose-400/10 text-rose-200",
    dot: "bg-rose-400",
  },
};

const paymentMeta = {
  PENDING: { label: "Payment Pending", color: "bg-amber-100 text-amber-700" },
  PAID: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "Failed", color: "bg-rose-100 text-rose-700" },
};

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [loading, setLoading] = useState(true);

  const downloadInvoice = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 35, "F");

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("SOLD OUTS", 20, 20);

    doc.setFontSize(14);
    doc.text("INVOICE", 160, 20);

    // Order Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);

    doc.text(`Order ID: ${order._id}`, 20, 50);
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      20,
      60
    );

    // Customer Section
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 75, 170, 35, "F");

    doc.setFontSize(16);
    doc.text("Customer Details", 25, 85);

    doc.setFontSize(12);
    doc.text(`Name: ${order.shippingAddress?.fullName}`, 25, 95);
    doc.text(`Phone: ${order.shippingAddress?.phone}`, 25, 102);
    doc.text(`Address: ${order.shippingAddress?.address}`, 25, 109);

    // Product Section
    let y = 130;

    doc.setFontSize(16);
    doc.text("Products", 20, y);

    y += 10;

    order.items.forEach((item, index) => {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, y - 5, 170, 25, "F");

      doc.setFontSize(13);
      doc.text(`${index + 1}. ${item.name}`, 25, y);

      doc.setFontSize(11);
      doc.text(`Qty: ${item.quantity}`, 25, y + 8);
      doc.text(`Price: ₹${item.total}`, 120, y + 8);

      y += 35;
    });

    // Payment Section
    doc.setFillColor(240, 255, 244);
    doc.rect(20, y, 170, 35, "F");

    doc.setFontSize(16);
    doc.text("Payment Summary", 25, y + 10);

    doc.setFontSize(12);
    doc.text(`Method: ${order.paymentMethod}`, 25, y + 20);
    doc.text(`Status: ${order.paymentStatus}`, 120, y + 20);

    doc.setFontSize(14);
    doc.text(`Total Amount: ₹${order.totalAmount}`, 25, y + 30);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for shopping with SOLD OUTS ❤️", 55, 285);

    doc.save(`Invoice-${order._id}.pdf`);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${id}`);
        setOrder(response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowTimeline(false);
    };

    if (showTimeline) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showTimeline]);

  const subtotal = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce(
      (sum, item) => sum + (item.total || item.price * item.quantity || 0),
      0
    );
  }, [order]);

  const shippingFee = order?.totalAmount > 999 ? 0 : 49;
  const discount = Math.max(
    subtotal + shippingFee - (order?.totalAmount || 0),
    0
  );
  const currentMeta = statusMeta[order?.orderStatus] || statusMeta.PENDING;
  const paymentCurrent =
    paymentMeta[order?.paymentStatus] || paymentMeta.PENDING;

  const getDeliveryMessage = () => {
    if (!order?.estimatedDeliveryDate) {
      return {
        title: "Expected Delivery",
        subtitle: "Not Available",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const delivery = new Date(order.estimatedDeliveryDate);
    delivery.setHours(0, 0, 0, 0);

    const diff = Math.floor((delivery - today) / (1000 * 60 * 60 * 24));

    if (order.orderStatus === "DELIVERED") {
      return {
        title: "Delivered On",
        subtitle: new Date(
          order.deliveredAt || order.estimatedDeliveryDate
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      };
    }

    if (order.orderStatus === "OUT_FOR_DELIVERY") {
      if (diff <= 0) {
        return {
          title: "🚚 Arriving Today",
          subtitle: "Expected by 11:00 PM",
        };
      }

      if (diff === 1) {
        return {
          title: "🚚 Arriving Tomorrow",
          subtitle: "Expected by 11:00 PM",
        };
      }
    }

    return {
      title: "Expected Delivery",
      subtitle: new Date(order.estimatedDeliveryDate).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  };

const getStepDate = (status) => { 
  if (!order?.statusHistory?.length) return ""; 
  const entry = order.statusHistory.find((h) => h.status === status); 
  if (!entry) return ""; 
  return new Date(entry.date).toLocaleDateString("en-IN", { 
    day: "2-digit", 
    month: "short", 
  }); 
};

  // Flipkart-style compact timeline - sirf completed status dikhayega
// Flipkart-style compact timeline - sirf PENDING (start) aur current status dikhayega
  const getCompactTimeline = () => {
    if (!order?.statusHistory?.length) return [];

    const latestStatusMap = new Map();
    order.statusHistory.forEach((h) => {
      latestStatusMap.set(h.status, h);
    });

    if (order.orderStatus === "CANCELLED") {
      const cancelled = latestStatusMap.get("CANCELLED");
      return cancelled ? [cancelled] : [];
    }

    const pendingEntry = latestStatusMap.get("PENDING");
    const currentEntry = latestStatusMap.get(order.orderStatus);

    const result = [];
    if (pendingEntry) result.push(pendingEntry);

    // Agar current status khud PENDING nahi hai, to alag se add karo
    if (currentEntry && order.orderStatus !== "PENDING") {
      result.push(currentEntry);
    }

    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
        
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-40 rounded-3xl bg-white/70 shadow-sm" />
            <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6">
              <div className="h-96 rounded-3xl bg-white/70 shadow-sm" />
              <div className="h-96 rounded-3xl bg-white/70 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl shadow-lg p-10">
            <h1 className="text-2xl font-bold text-slate-900">
              Order not found
            </h1>
            <p className="text-slate-500 mt-2">
              Please check the order id and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="mb-6 rounded-3xl bg-slate-900 text-white p-6 lg:p-8 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#60a5fa,_transparent_35%),radial-gradient(circle_at_bottom_left,_#34d399,_transparent_30%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">Order Details</p>
              <h1 className="text-2xl lg:text-4xl font-bold mt-1">
                #{order._id?.slice(-8)?.toUpperCase()}
              </h1>
              <p className="text-slate-300 mt-2">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${currentMeta.color} bg-white/10 text-white border-white/20`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${currentMeta.dot}`}
                />
                {currentMeta.label}
              </span>
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${paymentCurrent.color}`}
              >
                {paymentCurrent.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.7fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Items</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  {order.items?.length || 0}
                </h3>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total Amount</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  ₹{order.totalAmount}
                </h3>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Payment</p>
                <h3 className="text-xl font-semibold text-slate-900 mt-2">
                  {order.paymentMethod}
                </h3>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Delivery</p>
                <h3 className="text-xl font-semibold text-slate-900 mt-2">
                  {order.orderStatus}
                </h3>
              </div>
            </div>

            {/* ORDER PROGRESS STEPPER */}
            {/* FLIPKART STYLE COMPACT TIMELINE */}
            {/* ORDER PROGRESS STEPPER */}
<div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6"> 
  <div className="flex items-center justify-between mb-6"> 
    <div> 
      <h2 className="text-xl font-bold text-slate-900">Order Progress</h2> 
      <p className="text-sm text-slate-500 mt-1">Real-time shipment updates</p> 
    </div> 
    <button 
      onClick={() => setShowTimeline(true)} 
      className="text-sm font-semibold text-blue-600 hover:text-blue-700" 
    > 
      View All 
    </button> 
  </div> 

  {/* DESKTOP TIMELINE (Hidden on Mobile) */}
  <div className="hidden md:flex items-start justify-between relative px-2 py-4">
    {statusSteps.map((step, index) => { 
      const meta = statusMeta[step]; 
      const Icon = meta.icon; 
      const currentStep = statusMeta[order.orderStatus]?.step ?? 0; 
      const completed = index < currentStep; 
      const active = index === currentStep; 
      const future = index > currentStep; 

      return ( 
        <div key={step} className="flex-1 flex flex-col items-center relative">
          {index !== statusSteps.length - 1 && ( 
            <div className="absolute top-5 left-1/2 w-full h-1"> 
              <div className="h-full bg-slate-200"> 
                <div className={`h-full transition-all duration-700 ${ completed ? "w-full bg-emerald-500" : active ? "w-1/2 bg-blue-500" : "w-0 bg-slate-200" }`} /> 
              </div> 
            </div> 
          )} 
          <div className="relative z-10">
            {active && <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />} 
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${ 
              completed ? "bg-emerald-500 border-emerald-500 text-white" : active ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200 scale-110" : "bg-white border-slate-300 text-slate-400" 
            }`}> 
              <Icon className="w-5 h-5" /> 
            </div> 
          </div> 
          <div className="mt-3 text-center"> 
            <p className={`text-xs font-semibold ${ active ? "text-blue-600" : completed ? "text-emerald-600" : "text-slate-400" }`}> 
              {meta.label} 
            </p> 
            <p className="text-[10px] text-slate-400 mt-1"> 
              {getStepDate(step) || (future ? "Pending" : "")} 
            </p> 
          </div> 
        </div> 
      ); 
    })} 
  </div>

  {/* MOBILE TIMELINE (Vertical - Only visible on small screens) */}
  <div className="flex md:hidden flex-col gap-6 pl-2">
    {statusSteps.map((step, index) => { 
      const meta = statusMeta[step]; 
      const Icon = meta.icon; 
      const currentStep = statusMeta[order.orderStatus]?.step ?? 0; 
      const completed = index < currentStep; 
      const active = index === currentStep; 
      const future = index > currentStep; 

      return (
        <div key={step} className="flex items-center gap-4 relative">
          {index !== statusSteps.length - 1 && (
            <div className={`absolute left-5 top-10 w-0.5 h-8 -translate-x-1/2 ${completed ? "bg-emerald-500" : "bg-slate-200"}`} />
          )}
          <div className="relative z-10">
            {active && <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />} 
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${ 
              completed ? "bg-emerald-500 border-emerald-500 text-white" : active ? "bg-blue-500 border-blue-500 text-white shadow-lg" : "bg-white border-slate-300 text-slate-400" 
            }`}> 
              <Icon className="w-5 h-5" /> 
            </div> 
          </div>
          <div>
            <p className={`text-sm font-semibold ${ active ? "text-blue-600" : completed ? "text-emerald-600" : "text-slate-400" }`}>
              {meta.label}
            </p>
            <p className="text-xs text-slate-400">
              {getStepDate(step) || (future ? "Pending" : "")}
            </p>
          </div>
        </div>
      );
    })}
  </div>
</div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Items in Order
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Complete product breakdown with pricing.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item._id || item.sku}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-100 hover:shadow-sm transition"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-28 h-28 rounded-2xl object-cover bg-slate-100"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            SKU: {item.sku}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                              Color: {item.color}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                              Size: {item.size}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-left lg:text-right">
                          <p className="text-sm text-slate-500">Price</p>
                          <p className="text-lg font-bold text-slate-900">
                            ₹{item.price}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Total: ₹{item.total}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Delivery Details
              </h2>
              <div className="mt-5 space-y-4 text-slate-700">
                <div>
                  <p className="text-sm text-slate-500">Recipient</p>
                  <p className="font-semibold">
                    {order.shippingAddress?.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-semibold">
                    {order.shippingAddress?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-semibold leading-7">
                    {[
                      order.shippingAddress?.address,
                      order.shippingAddress?.city,
                      order.shippingAddress?.state,
                      order.shippingAddress?.pincode,
                      order.shippingAddress?.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Shipment Information
                </h2>
                <span className="text-2xl">🚚</span>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm text-slate-500">Courier</p>
                  <p className="font-semibold text-slate-900">
                    {order.courierName || "Not Assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Tracking ID</p>
                  <p className="font-semibold text-slate-900 break-all">
                    {order.trackingId || "Not Available"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    {getDeliveryMessage().title}
                  </p>
                  <p className="font-semibold text-slate-900">
                    {getDeliveryMessage().subtitle}
                  </p>
                </div>

                <button
                  disabled={!order.trackingUrl}
                  onClick={() => window.open(order.trackingUrl, "_blank")}
                  className={`w-full py-3 rounded-xl font-semibold transition ${
                    order.trackingUrl
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {order.trackingUrl
                    ? "Track Package"
                    : "Tracking Not Available"}
                </button>

                {order.refundStatus !== "NONE" && (
  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-emerald-700">
          Refund {order.refundStatus}
        </p>
        <p className="text-sm text-emerald-600 mt-1">
          Amount: ₹{order.refundAmount}
        </p>
      </div>
      <span className="text-2xl">💸</span>
    </div>
  </div>
)}
              </div>

              <h2 className="text-xl font-bold text-slate-900 mt-8">
                Price Details
              </h2>
              <div className="mt-5 space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>
                    {shippingFee === 0 ? "Free" : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-slate-900 text-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-bold">Support</h3>
              <p className="text-sm text-indigo-100 mt-2">
                Need help with this order? Keep your order ID ready while
                contacting support.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={() => setShowTimeline(true)}
                  className="w-full rounded-xl bg-white text-slate-900 py-3 font-semibold hover:bg-slate-100 transition"
                >
                  Open Timeline
                </button>
                <button
                  onClick={downloadInvoice}
                  className="w-full rounded-xl border border-white/20 py-3 font-semibold hover:bg-white/10 transition"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE MODAL POPUP */}
      {showTimeline && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setShowTimeline(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Order Timeline
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Full status history for this order.
                </p>
              </div>
              <button
                onClick={() => setShowTimeline(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xl flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                {(() => {
                  const orderedStatuses = [
                    "PENDING",
                    "CONFIRMED",
                    "PACKED",
                    "SHIPPED",
                    "OUT_FOR_DELIVERY",
                    "DELIVERED",
                  ];

                  // Unique map: LATEST log for each status code
                  const latestStatusMap = new Map();
                  order?.statusHistory?.forEach((history) => {
                    latestStatusMap.set(history.status, history);
                  });

                  const currentStatusIndex =
                    statusMeta[order?.orderStatus]?.step ?? 0;

                  // Active DB status tak hi render honge
                  const filteredTimeline = orderedStatuses
                    .map((status) => latestStatusMap.get(status))
                    .filter((history) => {
                      if (!history) return false;
                      const stepIndex = statusMeta[history.status]?.step ?? 0;
                      if (order?.orderStatus === "CANCELLED") {
                        return (
                          history.status === "CANCELLED" ||
                          history.status === "PENDING"
                        );
                      }
                      return stepIndex <= currentStatusIndex;
                    });

                  if (filteredTimeline.length === 0) {
                    return (
                      <div className="text-center text-slate-500 py-8">
                        No timeline available.
                      </div>
                    );
                  }

                  return filteredTimeline.map((history, index) => (
                    <div key={history._id || index} className="flex gap-4 group">
                      <div className={`w-5 h-5 mt-1 rounded-full flex items-center justify-center text-white flex-shrink-0 ${ history.status === order.orderStatus ? "bg-blue-500 shadow-lg shadow-blue-200" : "bg-emerald-500" }` }/>
                      <div className="flex-1 pb-5 border-b border-slate-100 transition-all duration-300 group-hover:translate-x-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900">
                            {history.status.replaceAll("_", " ")}
                          </h3>
                          <span className="text-xs text-slate-400">
                            {new Date(history.date).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                          {history.message}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;