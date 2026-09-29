import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response =
  await axiosInstance.get(
    "/orders/my-orders"
  );

const confirmedOrders = response.data.filter((order) => {
  return [
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ].includes(order.orderStatus);
});

setOrders(confirmedOrders);

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
  switch (status) {
    case "CREATED":
      return "text-yellow-500";

    case "PAYMENT_PENDING":
      return "text-orange-500";

    case "PAYMENT_FAILED":
      return "text-red-500";

    case "CONFIRMED":
      return "text-blue-500";

    case "SHIPPED":
      return "text-purple-500";

    case "OUT_FOR_DELIVERY":
      return "text-indigo-500";

    case "DELIVERED":
      return "text-green-600";

    case "OUT_OF_STOCK":
      return "text-red-600";

    case "CANCELLED":
      return "text-red-500";

    default:
      return "text-gray-500";
  }
};

const canShowDelivery = (status) => { 
  return [ 
    "CONFIRMED", 
    "SHIPPED", 
    "OUT_FOR_DELIVERY", 
    "DELIVERED", 
  ].includes(status); 
};

  const getDeliveryMessage = (order) => {

  if (!order.estimatedDeliveryDate) {
    return {
      title: "",
      subtitle: "",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const delivery = new Date(order.estimatedDeliveryDate);
  delivery.setHours(0, 0, 0, 0);

  const diff =
    Math.floor(
      (delivery - today) /
        (1000 * 60 * 60 * 24)
    );

  if (order.orderStatus === "DELIVERED") {

    return {
      title: "Delivered",
      subtitle: new Date(
        order.deliveredAt ||
          order.estimatedDeliveryDate
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };

  }

  if (order.orderStatus === "OUT_FOR_DELIVERY") {

    if (diff === 0) {
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
    subtitle: new Date(
      order.estimatedDeliveryDate
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };

};

const getStepDate = (status) => { 
  const entry = order?.statusHistory?.find((h) => h.status === status); 
  if (!entry) return null; 
  return new Date(entry.date).toLocaleDateString("en-IN", { 
    day: "2-digit", 
    month: "short", 
  }); 
};

  return (
    <div className="min-h-screen bg-[#f1f3f6]">

      <Navbar />

      <div className="max-w-[1240px] mx-auto py-8 px-4">

        <h1 className="text-3xl font-bold mb-8">
          My Orders
        </h1>

        {loading ? (
          <h2>Loading...</h2>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-gray-100"> 
          <div className="text-5xl mb-4">📦
            </div> <h3 className="text-xl font-semibold text-gray-900 mb-2"> 
              No orders yet 
              </h3> 
              <p className="text-gray-500"> 
                Your placed orders will appear here. 
                </p> 
                
                </div>
        ) : (
          <div className="space-y-5">

            {orders.map((order) => (

              <div
                key={order._id}
                onClick={() =>
                  navigate(
                    `/my-orders/${order._id}`
                  )
                }
                className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-100"
              >

                {order.items.map((item) => (

                  <div
                    key={item._id}
                    className="grid md:grid-cols-[120px_1fr_150px_220px] gap-6 p-5 border-b last:border-none items-center"
                  >

                    {/* IMAGE */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover border border-gray-100"
                    />

                    {/* INFO */}
                    <div>
                      <h2 className="text-lg font-medium text-black">
                        {item.name}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        Color: {item.color}
                      </p>

                      <p className="text-gray-500">
                        Size: {item.size}
                      </p>

                      <p className="text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* PRICE */}
                    <div>
                      <h2 className="font-semibold text-lg text-black">
                        ₹{item.total}
                      </h2>
                    </div>

                    {/* STATUS */}
                    <div>

  <span 
  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-opacity-10 ${ 
    order.orderStatus === "CONFIRMED" 
    ? "bg-blue-100 text-blue-700" 
    : order.orderStatus === "DELIVERED" 
    ? "bg-green-100 text-green-700" 
    : order.orderStatus === "SHIPPED" 
    ? "bg-purple-100 text-purple-700" 
    : order.orderStatus === "OUT_FOR_DELIVERY" 
    ? "bg-indigo-100 text-indigo-700" 
    : order.orderStatus === "OUT_OF_STOCK" 
    ? "bg-red-100 text-red-700" 
    : order.orderStatus === "PAYMENT_FAILED" 
    ? "bg-red-100 text-red-700" 
    : order.orderStatus === "PAYMENT_PENDING" 
    ? "bg-orange-100 text-orange-700" 
    : "bg-gray-100 text-gray-700" 
    }`} 
    > 
    {order.orderStatus.replaceAll("_", " ")} 
    </span>

  <p className="text-gray-500 text-sm"> 
    {order.orderStatus === "DELIVERED" 
    ? "Delivered successfully" 
    : order.orderStatus === "PAYMENT_FAILED" 
    ? "Payment failed" 
    : order.orderStatus === "PAYMENT_PENDING" 
    ? "Payment pending" 
    : order.orderStatus === "OUT_OF_STOCK" 
    ? "Refund completed" 
    : order.orderStatus === "CREATED" 
    ? "Awaiting payment" 
    : "Order in process"} 
    </p>

  {canShowDelivery(order.orderStatus) && order.estimatedDeliveryDate && (

    <div className="mt-3">

      <p className="text-gray-500 text-sm">
  {getDeliveryMessage(order).title}
</p>

<p className="text-green-600 font-semibold mt-1">
  {getDeliveryMessage(order).subtitle}
</p>
    </div>

  )}

</div>

                  </div>
                ))}

                {/* FOOTER */}
                <div className="px-5 py-4 bg-gray-50 flex justify-between items-center">

                  {/* <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="text-sm font-medium text-gray-700">
                      {order._id}
                    </p>
                  </div> */}

                  <div>   <p className="text-sm text-gray-500">Order Number</p>   <p className="text-sm font-semibold text-black tracking-wide">     SO-{order._id.slice(-8).toUpperCase()}   </p>   <p className="text-xs text-gray-400 mt-1">     Ref: {order._id}   </p> </div>

                  <div className="text-right">
                    <p className="text-gray-500 text-sm">
                      Grand Total
                    </p>

                    <h2 className="text-xl font-bold text-black">
                      ₹{order.totalAmount}
                    </h2>
                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
      <Footer />
    </div>
    
  );
};

export default MyOrders;