import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "otp" ? value.replace(/\D/g, "") : value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: "" });
  };

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = "Please enter your email";
    if (!formData.otp.trim()) errors.otp = "Please enter the reset code";
    else if (!/^\d{6}$/.test(formData.otp.trim())) errors.otp = "Code must be 6 digits";
    if (!formData.newPassword) errors.newPassword = "Please enter a new password";
    else if (formData.newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
    if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getFriendlyErrorMessage = (error) => {
    if (!error.response) {
      return "Unable to connect. Please check your internet connection and try again.";
    }
    return error.response.data?.message || "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      });

      toast.success(response.data.message || "Password reset successfully. Please log in.");
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ FIX: resend ab isi page pe rehta hai — koi dusre page pe navigate nahi hota.
  // "/auth/forgot-password" ko dobara call karta hai (backend me yahi resend-reset-OTP logic hai)
  const handleResend = async () => {
    if (!formData.email.trim()) {
      toast.error("Please enter your email first");
      return;
    }

    setResending(true);
    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email: formData.email.trim(),
      });
      toast.success(response.data.message || "New reset code sent to your email.");
      setCooldown(60);
    } catch (error) {
      console.log(error);
      const msg = getFriendlyErrorMessage(error);
      toast.error(msg);

      const match = msg.match(/(\d+)\s*second/);
      if (match) setCooldown(Number(match[1]));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex flex-col items-center justify-center px-4 py-12 font-[Inter]">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-8">
          <span className="text-2xl font-black tracking-wider text-[#16161A]">
            SOLD <span className="text-[#FF4B12]">OUT</span>
          </span>
        </Link>

        <div className="bg-white border border-[#E4E1D9] p-7 sm:p-8">
          <div className="mb-7">
            <h1 className="text-3xl font-[Bebas_Neue] tracking-wide text-[#16161A] leading-none">
              Reset password
            </h1>
            <p className="text-sm text-[#6B6862] mt-2">
              Enter the code sent to your email and choose a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full h-12 pl-10 pr-4 border text-sm outline-none transition-colors ${
                    fieldErrors.email ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                Reset Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="otp"
                maxLength={6}
                placeholder="000000"
                value={formData.otp}
                onChange={handleChange}
                className={`w-full h-14 px-4 border text-center text-2xl font-[JetBrains_Mono] tracking-[0.5em] outline-none transition-colors ${
                  fieldErrors.otp ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                }`}
              />
              {fieldErrors.otp && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.otp}</p>}
            </div>

            <div>
              <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder="Create a new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full h-12 pl-10 pr-11 border text-sm outline-none transition-colors ${
                    fieldErrors.newPassword ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
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
              {fieldErrors.newPassword && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.newPassword}</p>}
            </div>

            <div>
              <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full h-12 pl-10 pr-4 border text-sm outline-none transition-colors ${
                    fieldErrors.confirmPassword ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF4B12] hover:bg-[#16161A] text-white font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* 🛠️ FIX: ab button hai, Link nahi — isi page pe rehta hai */}
          <div className="text-center mt-5">
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-sm font-semibold text-[#16161A] hover:text-[#FF4B12] transition-colors disabled:text-[#B4B2A9] disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Sending..." : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;