import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiShield } from "react-icons/fi";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const getFriendlyErrorMessage = (error, fallback) => {
    if (!error.response) {
      return "Unable to connect. Please check your internet connection and try again.";
    }
    return error.response.data?.message || fallback;
  };

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = "Please enter your email";
    if (!otp.trim()) errors.otp = "Please enter the verification code";
    else if (!/^\d{6}$/.test(otp.trim())) errors.otp = "Code must be 6 digits";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/verify-email", {
        email: email.trim(),
        otp: otp.trim(),
      });

      toast.success(response.data.message || "Email verified! You can now log in.");
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error(getFriendlyErrorMessage(error, "Verification failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email first");
      return;
    }

    setResending(true);
    try {
      const response = await axiosInstance.post("/auth/resend-otp", { email: email.trim() });
      toast.success(response.data.message || "New OTP sent to your email.");
      setCooldown(60);
    } catch (error) {
      console.log(error);
      // 🛠️ Backend cooldown message ("Please wait 42 seconds...") already user-friendly hai — seedha dikhao
      const msg = getFriendlyErrorMessage(error, "Could not resend OTP. Please try again.");
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
            <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FF4B12] flex items-center justify-center mb-4">
              <FiShield className="text-xl" />
            </div>
            <h1 className="text-3xl font-[Bebas_Neue] tracking-wide text-[#16161A] leading-none">
              Verify your email
            </h1>
            <p className="text-sm text-[#6B6862] mt-2">
              We've sent a 6-digit code to your email. Enter it below to activate your account.
            </p>
          </div>

          <form onSubmit={handleVerify} noValidate className="space-y-4">
            <div>
              <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                  }}
                  className={`w-full h-12 pl-10 pr-4 border text-sm outline-none transition-colors ${
                    fieldErrors.email ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (fieldErrors.otp) setFieldErrors({ ...fieldErrors, otp: "" });
                }}
                className={`w-full h-14 px-4 border text-center text-2xl font-[JetBrains_Mono] tracking-[0.5em] outline-none transition-colors ${
                  fieldErrors.otp ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                }`}
              />
              {fieldErrors.otp && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.otp}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF4B12] hover:bg-[#16161A] text-white font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="text-center mt-5">
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-sm font-semibold text-[#16161A] hover:text-[#FF4B12] transition-colors disabled:text-[#B4B2A9] disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? "Sending..." : "Resend code"}
            </button>
          </div>

          <p className="text-center text-sm text-[#6B6862] mt-6">
            Already verified?{" "}
            <Link to="/login" className="text-[#16161A] font-semibold hover:text-[#FF4B12] transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;