import { useState } from "react";
import axiosInstance from "../api/axios";
import { useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiUser, FiLock, FiTruck, FiShield, FiRotateCcw, FiTag } from "react-icons/fi";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedUsername = formData.username.trim();
    if (!trimmedUsername) errors.username = "Please enter your username";
    else if (trimmedUsername.length < 3) errors.username = "Username must be at least 3 characters";
    if (!formData.password) errors.password = "Please enter your password";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error("Please fill in all required fields");
    return;
  }

  setLoading(true);

  try {
    const response = await axiosInstance.post("/auth/login", {
      username: formData.username.trim(),
      password: formData.password,
    });

    // CUSTOMER LOGIN SUCCESSFUL

    // Purana admin session clear karo
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");

    // Purana customer session clear karo
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Naya customer session save karo
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("username", response.data.username);

    // Redux user set karo
    dispatch(setUser(response.data));

    toast.success(`Welcome back, ${response.data.username}!`);

    navigate("/");

  } catch (error) {
    console.log(error);

    // SERVER / INTERNET CONNECTION ERROR
    if (!error.response) {
      toast.error(
        "Unable to connect. Please check your internet connection and try again."
      );
      return;
    }

    const status = error.response.status;
    const data = error.response.data;
    const message = data?.message || "";

    // ==========================================
    // ADMIN CUSTOMER LOGIN PAGE SE LOGIN KAR RAHA HAI
    // ==========================================

    if (
      status === 403 &&
      message === "Please use the admin login portal."
    ) {
      toast.error(message);

      navigate("/admin/login");

      return;
    }


    // ==========================================
    // CUSTOMER KA EMAIL VERIFY NAHI HAI
    // ==========================================

    if (
      status === 403 &&
      data?.email
    ) {
      toast.error(
        message || "Please verify your email before logging in."
      );

      navigate("/verify-email", {
        state: {
          email: data.email,
        },
      });

      return;
    }


    // ==========================================
    // OTHER ERRORS
    // ==========================================

    switch (status) {

      case 401:
        toast.error(
          "Incorrect username or password. Please check and try again."
        );
        break;

      case 429:
        toast.error(
          message ||
          "Too many login attempts. Please wait a few minutes before trying again."
        );
        break;

      case 404:
        toast.error(
          "We couldn't find an account with that username."
        );
        break;

      case 500:
      case 502:
      case 503:
        toast.error(
          "Something went wrong on our end. Please try again in a moment."
        );
        break;

      default:
        toast.error(
          typeof message === "string" && message
            ? message
            : "Login failed. Please try again."
        );
    }

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex font-[Inter]">

      {/* ---------------- LEFT: BRAND / TRUST PANEL ---------------- */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#16161A] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FF4B12]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl" />

        <div className="relative">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-black tracking-wider text-white">
              SOLD <span className="text-[#FF4B12]">OUT</span>
            </span>
          </Link>

          <div className="mt-16 xl:mt-24">
            <span className="inline-flex items-center gap-2 text-[11px] font-[JetBrains_Mono] font-semibold tracking-[0.2em] uppercase text-[#FF4B12] mb-4">
              <span className="w-4 h-px bg-[#FF4B12]" /> Member Access
            </span>
            <h1 className="text-5xl xl:text-6xl font-[Bebas_Neue] tracking-wide text-white leading-[0.95]">
              Your closet,
              <br />
              one login away.
            </h1>
            <p className="text-white/50 text-[15px] mt-5 max-w-sm leading-relaxed">
              Track orders, save addresses, and unlock live-sale pricing the moment it drops.
            </p>
          </div>
        </div>

        {/* TRUST STRIP — spec-sheet style, matches product/cart pages */}
        <div className="relative border-t border-white/10 pt-6 space-y-5">
          <div className="flex items-center gap-3.5 text-white/70">
            <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center shrink-0">
              <FiTruck className="text-sm" />
            </div>
            <span className="text-sm">Fast, trackable delivery on every order</span>
          </div>
          <div className="flex items-center gap-3.5 text-white/70">
            <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center shrink-0">
              <FiRotateCcw className="text-sm" />
            </div>
            <span className="text-sm">7-day easy returns, no questions asked</span>
          </div>
          <div className="flex items-center gap-3.5 text-white/70">
            <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center shrink-0">
              <FiTag className="text-sm" />
            </div>
            <span className="text-sm">Early access to live sales for members</span>
          </div>
          <div className="flex items-center gap-3.5 text-white/70">
            <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center shrink-0">
              <FiShield className="text-sm" />
            </div>
            <span className="text-sm">Encrypted checkout, every single time</span>
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT: FORM ---------------- */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* mobile-only logo */}
          <Link to="/" className="lg:hidden block text-center mb-8">
            <span className="text-2xl font-black tracking-wider text-[#16161A]">
              SOLD <span className="text-[#FF4B12]">OUT</span>
            </span>
          </Link>

          <div className="bg-white border border-[#E4E1D9] p-7 sm:p-8">
            <div className="mb-7">
              <span className="inline-flex items-center gap-2 text-[11px] font-[JetBrains_Mono] font-semibold tracking-[0.2em] uppercase text-[#FF4B12] mb-3">
                <span className="w-4 h-px bg-[#FF4B12]" /> Sign In
              </span>
              <h1 className="text-3xl font-[Bebas_Neue] tracking-wide text-[#16161A] leading-none">
                Welcome back
              </h1>
              <p className="text-sm text-[#6B6862] mt-2">
                Log in to continue to your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full h-12 pl-10 pr-4 border text-sm outline-none transition-colors ${
                      fieldErrors.username ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                    }`}
                  />
                </div>
                {fieldErrors.username && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.username}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[11px] font-semibold text-[#FF4B12] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full h-12 pl-10 pr-11 border text-sm outline-none transition-colors ${
                      fieldErrors.password ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] hover:text-[#16161A] transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FF4B12] hover:bg-[#16161A] text-white font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#6B6862] mt-6">
              New here?{" "}
              <Link to="/register" className="text-[#16161A] font-semibold hover:text-[#FF4B12] transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          <p className="text-center text-[11px] text-[#B4B2A9] mt-6">
            Protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;