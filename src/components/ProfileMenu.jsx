import { Link } from "react-router-dom";
import { RiDashboardLine } from "react-icons/ri";
import { BiPackage } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";

const ProfileMenu = ({ profileDropdownOpen, setProfileDropdownOpen, profileRef, currentPath, onLogout }) => {
  return (
    <div className="relative" ref={profileRef}>
      <button
        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
        className="text-2xl text-gray-600 hover:text-[#FF4B12] flex items-center transition focus:outline-none"
      >
        <FaUserCircle />
      </button>

      {profileDropdownOpen && (
        <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-100 rounded-sm shadow-lg py-2 z-50">
          {currentPath !== "/profile" && (
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <RiDashboardLine className="text-base text-gray-400" />
              My Dashboard
            </Link>
          )}
          {currentPath !== "/my-orders" && (
            <Link
              to="/my-orders"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <BiPackage className="text-base text-gray-400" />
              My Orders
            </Link>
          )}
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium border-t border-gray-100 mt-1"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;