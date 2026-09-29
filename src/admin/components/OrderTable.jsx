import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { toast } from "react-toastify";
import OrderUpdateModal from "./OrderUpdateModal";

const OrderTable = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderStatus: "",
    courierName: "",
    trackingId: "",
    trackingUrl: "",
    estimatedDeliveryDate: "",
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/orders/admin/all");
      setOrders(response.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setFormData({
      orderStatus: order.orderStatus,
      courierName: order.courierName || "",
      trackingId: order.trackingId || "",
      trackingUrl: order.trackingUrl || "",
      estimatedDeliveryDate: order.estimatedDeliveryDate
        ? order.estimatedDeliveryDate.slice(0, 10)
        : "",
    });
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;
    try {
      const response = await axiosInstance.put(
        `/orders/admin/status/${selectedOrder._id}`,
        formData
      );
      toast.success(response.data.message || "Order updated successfully");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
      case "PAYMENT_PENDING":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "PACKED":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "SHIPPED":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "OUT_FOR_DELIVERY":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "CANCELLED":
      case "FAILED":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-slate-800 text-slate-300 border border-slate-700";
    }
  };

  return (
    <>
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">All Orders</h2>
            <p className="text-xs sm:text-sm text-slate-400">Track and update customer fulfillment statuses</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-300 self-start sm:self-auto">
            Total Orders: <span className="font-bold text-white ml-1">{orders.length}</span>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading orders list...</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[850px] text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[11px] sm:text-xs">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap">Order ID</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Customer</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Payment</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Total</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-4 font-mono text-xs text-blue-400 whitespace-nowrap">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">
                          {order.shippingAddress?.fullName || order.user?.username || "Customer"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.shippingAddress?.phone || order.user?.email || ""}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : order.paymentStatus === "FAILED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {order.paymentMethod === "COD" ? "COD" : order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                        ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openUpdateModal(order)}
                          className="bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg text-white font-medium text-xs transition cursor-pointer active:scale-95"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-500">
                      No orders recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderUpdateModal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        formData={formData}
        setFormData={setFormData}
        onSave={updateOrderStatus}
      />
    </>
  );
};

export default OrderTable;