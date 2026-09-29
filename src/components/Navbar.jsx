import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axios";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { BiPackage } from "react-icons/bi";
import { useSelector } from "react-redux";
import ProfileMenu from "./ProfileMenu";
import logo from "../assets/lll.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const isAuthenticated = !!token;

  const cartItems = useSelector((state) => state.cart?.items || []);
  const cartCount = cartItems.length;

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef();
  const mobileDropdownRef = useRef();
  const profileRef = useRef();
  const currentPath = location.pathname;

  // Check if current page is Home page
  const isHomePage = currentPath === "/";

  const fetchSuggestions = async (value) => {
    try {
      const response = await axiosInstance.get(`/products?search=${value}`);
      setSuggestions(response.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (search.trim()) {
      fetchSuggestions(search);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const clickedOutsideMobile =
        mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    setProfileDropdownOpen(false);
    navigate("/");
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50 w-full font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* MAIN TOP NAVBAR ROW */}
        <div className="h-16 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* 1. LOGO + BRAND NAME (Always visible on mobile & desktop) */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <img src={logo} alt="SoldOut" className="h-9 sm:h-11 w-auto" />
            <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 block">
              SOLD
              <span className="text-orange-300 ml-0.5">OUTS</span>
            </span>
          </Link>

          {/* 2. DESKTOP SEARCH BAR (Only on Home Page) */}
          {isHomePage && (
            <div
              ref={dropdownRef}
              className="hidden md:block relative flex-1 max-w-[480px]"
            >
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    navigate(`/search?q=${search}`);
                    setShowDropdown(false);
                  }
                }}
                className="w-full bg-[#f0f5ff] text-sm rounded-lg px-4 h-10 outline-none border border-transparent focus:border-gray-300 transition"
              />

              {/* DESKTOP SEARCH SUGGESTIONS */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white border rounded-xl shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {suggestions.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        navigate(`/search?q=${product.name}`);
                        setSearch("");
                        setShowDropdown(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-none"
                    >
                      <img
                        src={product.variants?.[0]?.images?.[0] || "https://via.placeholder.com/50"}
                        alt=""
                        className="w-9 h-9 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm text-gray-800 truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                          {product.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. RIGHT ICONS & ACTION LINKS */}
          <div className="flex items-center gap-3 sm:gap-6 md:gap-7 text-sm font-medium text-gray-700 shrink-0">
            
            {/* WISHLIST */}
            {isAuthenticated && currentPath !== "/wishlist" && (
              <Link
                to="/wishlist"
                className="flex items-center gap-1 hover:text-blue-600 transition p-1"
                title="Wishlist"
              >
                <FiHeart className="text-xl" />
                <span className="hidden lg:inline text-sm">Wishlist</span>
              </Link>
            )}

            {/* ORDERS */}
            {isAuthenticated && currentPath !== "/my-orders" && (
              <Link
                to="/my-orders"
                className="flex items-center gap-1 hover:text-blue-600 transition p-1"
                title="Orders"
              >
                <BiPackage className="text-2xl" />
                <span className="hidden lg:inline text-sm">Orders</span>
              </Link>
            )}

            {/* CART */}
            {isAuthenticated && currentPath !== "/cart" && (
              <Link
                to="/cart"
                className="flex items-center gap-1 hover:text-blue-600 transition p-1 relative"
                title="Cart"
              >
                <div className="relative flex items-center">
                  <FiShoppingCart className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-0.5 flex items-center justify-center border border-white animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-sm ml-0.5">Cart</span>
              </Link>
            )}

            {/* USER PROFILE OR LOGIN */}
            {isAuthenticated ? (
              <ProfileMenu
                profileDropdownOpen={profileDropdownOpen}
                setProfileDropdownOpen={setProfileDropdownOpen}
                profileRef={profileRef}
                currentPath={currentPath}
                onLogout={logoutHandler}
              />
            ) : (
              currentPath !== "/login" && (
                <Link
                  to="/login"
                  className="bg-blue-600 px-4 py-1.5 rounded-lg text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 shadow-sm transition"
                >
                  Login
                </Link>
              )
            )}
          </div>

        </div>

        {/* 4. MOBILE/SMALL SCREEN SEARCH BAR (Only on Home Page, placed below) */}
        {isHomePage && (
          <div ref={mobileDropdownRef} className="md:hidden pb-3 pt-1 relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  navigate(`/search?q=${search}`);
                  setShowDropdown(false);
                }
              }}
              className="w-full bg-[#f0f5ff] text-sm rounded-lg px-3.5 h-10 outline-none border border-transparent focus:border-gray-300 transition shadow-inner"
            />

            {/* MOBILE SEARCH SUGGESTIONS */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-14 left-0 w-full bg-white border rounded-xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                {suggestions.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => {
                      navigate(`/search?q=${product.name}`);
                      setSearch("");
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-none"
                  >
                    <img
                      src={product.variants?.[0]?.images?.[0] || "https://via.placeholder.com/50"}
                      alt=""
                      className="w-8 h-8 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-xs sm:text-sm text-gray-800 truncate">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 truncate">
                        {product.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Navbar;