import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";
import {
  FiMenu,
  FiUser,
  FiLogOut,
  FiShield,
  FiMail,
  FiX,
  FiChevronDown,
  FiCalendar
} from "react-icons/fi";
import axiosInstance from "../../api/axios";

const Topbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({
    username: localStorage.getItem("adminUsername") || "Admin",
    email: "admin@soldout.com",
    role: "ADMIN",
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        if (res.data?.user) {
          setAdminUser(res.data.user);
        }
      } catch (err) {
        const storedName = localStorage.getItem("adminUsername");
        if (storedName) {
          setAdminUser((prev) => ({ ...prev, username: storedName }));
        }
      }
    };
    fetchAdminProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("token");
    if (dispatch) dispatch(logoutUser());
    window.location.href = "/admin/login";
  };

  return (
    <>
      <header className="h-[68px] border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-3.5 sm:px-6 sticky top-0 z-30 w-full min-w-0">
        {/* Left: Hamburger Button & Panel Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="truncate">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              SoldOut Admin Console
            </h2>
          </div>
        </div>

        {/* Right: Admin Profile Button & Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 transition cursor-pointer active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              {adminUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight capitalize">
                {adminUser.username}
              </p>
              <p className="text-[10px] text-blue-400 font-mono leading-tight flex items-center gap-1 mt-0.5">
                <FiShield className="w-2.5 h-2.5" /> {adminUser.role}
              </p>
            </div>
            <FiChevronDown className="text-slate-400 w-4 h-4 ml-0.5" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                  <p className="text-[11px] text-slate-400">Signed in as</p>
                  <p className="text-xs font-semibold text-white truncate mt-0.5">
                    {adminUser.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    setModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <FiUser className="w-4 h-4 text-blue-400" /> View Admin Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition mt-1 cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4" /> Logout Account
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Admin Profile Details Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Profile Avatar Header */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-500/30">
                {adminUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white capitalize">
                  {adminUser.username}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FiShield className="w-3 h-3" /> {adminUser.role} Account
                </span>
              </div>
            </div>

            {/* Details Cards */}
            <div className="space-y-3 py-5">
              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
                <FiMail className="text-blue-400 w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Email Address</p>
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                    {adminUser.email}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
                <FiUser className="text-emerald-400 w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Admin Handle</p>
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                    @{adminUser.username}
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
                <FiCalendar className="text-amber-400 w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Account Access</p>
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                    Full System Privileges
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;