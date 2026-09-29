import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import Navbar from "../components/Navbar";
import {
  FiMapPin,
  FiPlus,
  FiHeart,
  FiArrowRight,
  FiLogOut,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";
import { BiPackage } from "react-icons/bi";
import { HiOutlineCog } from "react-icons/hi";
import { HiOutlineArchiveBox } from "react-icons/hi2";

const statusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "text-amber-700 bg-amber-50";
    case "CONFIRMED":
      return "text-blue-700 bg-blue-50";
    case "SHIPPED":
      return "text-indigo-700 bg-indigo-50";
    case "DELIVERED":
      return "text-emerald-700 bg-emerald-50";
    case "CANCELLED":
      return "text-rose-700 bg-rose-50";
    default:
      return "text-gray-700 bg-gray-50";
  }
};

const Profile = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    country: "",
    address: "",
  });

  const wishlistState = useSelector((state) => state.wishlist);
  const wishlistCount = Array.isArray(wishlistState)
    ? wishlistState.length
    : wishlistState?.items?.length || 0;

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      setProfileData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await axiosInstance.get("/orders/my-orders");
      setRecentOrders(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const response = await axiosInstance.get("/auth/addresses");
      setAddresses(response.data.addresses || []);
      setAddressLoading(false);
    } catch (error) {
      console.log(error);
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchRecentOrders(), fetchAddresses()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.pincode || !newAddress.city || !newAddress.address) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      setSavingAddress(true);
      await axiosInstance.post("/auth/addresses", newAddress);
      await fetchAddresses();
      setNewAddress({
        fullName: "",
        phone: "",
        pincode: "",
        city: "",
        state: "",
        country: "",
        address: "",
      });
      setShowAddressForm(false);
      setSavingAddress(false);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
      setSavingAddress(false);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const user = profileData?.user;
  const stats = profileData?.stats;

  const NavItem = ({ id, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-sm rounded-sm transition-colors ${
        active ? "text-[#FF4B12] font-semibold bg-orange-50" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans text-gray-800">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#FF4B12]"></div>
            <p className="text-gray-500 text-sm">Loading your account...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-start">

            {/* LEFT SIDEBAR */}
            <div className="space-y-3 lg:sticky lg:top-20">

              {/* GREETING CARD */}
              <div className="bg-white rounded-sm shadow-sm px-5 py-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FF4B12] text-white flex items-center justify-center text-base font-bold shrink-0">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Hello,</p>
                  <p className="font-semibold text-sm text-gray-900 truncate">{user?.username}</p>
                </div>
              </div>

              {/* NAV CARD */}
              <div className="bg-white rounded-sm shadow-sm overflow-hidden">

                {/* MY ORDERS — top-level link, chevron like flipkart */}
                <button
                  onClick={() => navigate("/my-orders")}
                  className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HiOutlineArchiveBox className="text-lg text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800 tracking-wide">MY ORDERS</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </button>

                {/* ACCOUNT SETTINGS GROUP */}
                <div className="px-5 pt-4 pb-1">
                  <div className="flex items-center gap-3 mb-2">
                    <HiOutlineCog className="text-lg text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800 tracking-wide">ACCOUNT SETTINGS</span>
                  </div>
                  <div className="pl-8 pb-3 space-y-0.5">
                    <NavItem
                      label="Profile Information"
                      active={activeSection === "profile"}
                      onClick={() => setActiveSection("profile")}
                    />
                    <NavItem
                      label="Manage Addresses"
                      active={activeSection === "addresses"}
                      onClick={() => setActiveSection("addresses")}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* MY STUFF GROUP */}
                <div className="px-5 pt-4 pb-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FiUser className="text-lg text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800 tracking-wide">MY STUFF</span>
                  </div>
                  <div className="pl-8 pb-3 space-y-0.5">
                    <button
                      onClick={() => navigate("/wishlist")}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-sm transition-colors flex items-center justify-between"
                    >
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="text-xs text-gray-400">{wishlistCount}</span>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={logoutHandler}
                  className="w-full flex items-center gap-3 px-5 py-4 border-t border-gray-100 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-semibold"
                >
                  <FiLogOut className="text-lg" />
                  Logout
                </button>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="space-y-4">

              {/* PROFILE INFORMATION */}
              {activeSection === "profile" && (
                <>
                  <div className="bg-white rounded-sm shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-5">Personal Information</h2>

                    <div className="grid sm:grid-cols-2 gap-5 mb-6">
                      <div>
                        <div className="w-full h-12 px-4 rounded-sm border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-600">
                          {user?.username}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1.5">Username</p>
                      </div>
                      <div>
                        <div className="w-full h-12 px-4 rounded-sm border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-600">
                          {user?.role || "Customer"}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1.5">Account type</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Email Address</h3>
                      <div className="w-full max-w-md h-12 px-4 rounded-sm border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-600">
                        {user?.email}
                      </div>
                    </div>

                    {user?.createdAt && (
                      <div className="border-t border-gray-100 mt-6 pt-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Member Since</h3>
                        <div className="w-full max-w-md h-12 px-4 rounded-sm border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QUICK STATS STRIP */}
                  <div className="bg-white rounded-sm shadow-sm grid grid-cols-2 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 divide-gray-100">
                    <div className="px-6 py-5">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalOrders ?? 0}</p>
                    </div>
                    <div className="px-6 py-5">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats?.totalSpent ?? 0}</p>
                    </div>
                    <div className="px-6 py-5">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">Wishlist</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{wishlistCount}</p>
                    </div>
                  </div>

                  {/* RECENT ORDERS PREVIEW */}
                  <div className="bg-white rounded-sm shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">Recent Orders</h3>
                      <button
                        onClick={() => setActiveSection("orders")}
                        className="flex items-center gap-1 text-xs font-semibold text-[#FF4B12] hover:gap-1.5 transition-all"
                      >
                        View all <FiArrowRight className="text-sm" />
                      </button>
                    </div>
                    {recentOrders.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500">No orders yet.</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {recentOrders.slice(0, 3).map((order) => (
                          <div
                            key={order._id}
                            onClick={() => navigate(`/my-orders/${order._id}`)}
                            className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/70 transition-colors"
                          >
                            <img
                              src={order.items?.[0]?.image}
                              alt=""
                              className="w-14 h-14 rounded-sm object-cover bg-gray-50 border border-gray-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {order.items?.[0]?.name}
                                {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ""}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-sm ${statusColor(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                            <p className="shrink-0 text-sm font-semibold text-gray-900 w-16 text-right">
                              ₹{order.totalAmount}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ORDERS SECTION */}
              {activeSection === "orders" && (
                <div className="bg-white rounded-sm shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900">My Orders</h2>
                    <button
                      onClick={() => navigate("/my-orders")}
                      className="text-xs font-semibold text-[#FF4B12] hover:underline"
                    >
                      Open full order history
                    </button>
                  </div>

                  {recentOrders.length === 0 ? (
                    <div className="p-10 text-center">
                      <BiPackage className="text-3xl text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No orders yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {recentOrders.map((order) => (
                        <div
                          key={order._id}
                          onClick={() => navigate(`/my-orders/${order._id}`)}
                          className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50/70 transition-colors"
                        >
                          <img
                            src={order.items?.[0]?.image}
                            alt=""
                            className="w-16 h-16 rounded-sm object-cover bg-gray-50 border border-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {order.items?.[0]?.name}
                              {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ""}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-sm ${statusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <p className="shrink-0 text-sm font-semibold text-gray-900 w-20 text-right">
                            ₹{order.totalAmount}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MANAGE ADDRESSES */}
              {activeSection === "addresses" && (
                <div className="bg-white rounded-sm shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-base font-bold text-gray-900">Manage Addresses</h2>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#FF4B12] border border-[#FF4B12] px-3 py-2 rounded-sm hover:bg-[#FF4B12] hover:text-white transition-colors"
                    >
                      <FiPlus className="text-sm" /> Add New Address
                    </button>
                  </div>

                  {showAddressForm && (
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="fullName"
                          value={newAddress.fullName}
                          placeholder="Full Name"
                          onChange={handleAddressChange}
                          className="h-11 px-3.5 rounded-sm border border-gray-300 bg-white focus:border-[#FF4B12] outline-none text-sm"
                        />
                        <input
                          type="text"
                          name="phone"
                          value={newAddress.phone}
                          placeholder="Phone Number"
                          onChange={handleAddressChange}
                          className="h-11 px-3.5 rounded-sm border border-gray-300 bg-white focus:border-[#FF4B12] outline-none text-sm"
                        />
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          placeholder="City"
                          onChange={handleAddressChange}
                          className="h-11 px-3.5 rounded-sm border border-gray-300 bg-white focus:border-[#FF4B12] outline-none text-sm"
                        />
                        <input
                          type="text"
                          name="state"
                          value={newAddress.state}
                          placeholder="State"
                          onChange={handleAddressChange}
                          className="h-11 px-3.5 rounded-sm border border-gray-300 bg-white focus:border-[#FF4B12] outline-none text-sm"
                        />
                        <input
                          type="text"
                          name="country"
                          value={newAddress.country}
                          placeholder="Country"
                          onChange={handleAddressChange}
                          className="h-11 px-3.5 rounded-sm border border-gray-300 bg-white focus:border-[#FF4B12] outline-none text-sm"
                        />
                        <input
                          type="text"
                          name="pincode"
                          value={newAddress.pincode}
                          placeholder="Postal Code"
                          onChange={handleAddressChange}
                          className="h-11 px-3.5 rounded-sm border border-gray-300 bg-white focus:border-[#FF4B12] outline-none text-sm"
                        />
                        <textarea
                          name="address"
                          value={newAddress.address}
                          placeholder="Full Address"
                          onChange={handleAddressChange}
                          className="sm:col-span-2 min-h-[90px] p-3.5 rounded-sm border border-gray-300 bg-white focus:border-[#FF4B12] outline-none resize-none text-sm"
                        />
                      </div>
                      <button
                        onClick={handleSaveAddress}
                        disabled={savingAddress}
                        className="mt-4 bg-[#FF4B12] hover:bg-[#e2410c] text-white text-sm font-semibold px-6 py-2.5 rounded-sm transition-colors disabled:opacity-50"
                      >
                        {savingAddress ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  )}

                  {addressLoading ? (
                    <div className="p-8 text-center text-sm text-gray-500">Loading addresses...</div>
                  ) : addresses.length === 0 ? (
                    <div className="p-10 text-center">
                      <FiMapPin className="text-3xl text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No saved addresses yet.</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4 p-6">
                      {addresses.map((addr, idx) => (
                        <div key={addr._id || idx} className="p-5 rounded-sm border border-gray-200">
                          <h4 className="font-semibold text-gray-900 text-sm">{addr.fullName}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed mt-1.5">{addr.address}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs text-gray-700 font-medium mt-3 pt-2.5 border-t border-gray-100">
                            {addr.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;