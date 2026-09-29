import { useState } from "react";
import axiosInstance from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail } from "react-icons/fi";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getFriendlyErrorMessage = (error) => {
    if (!error.response) {
      return "Unable to connect. Please check your internet connection and try again.";
    }
    return error.response.data?.message || "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email: trimmedEmail });
      toast.success(response.data.message || "Reset code sent to your email.");
      navigate("/reset-password", { state: { email: trimmedEmail } });
    } catch (err) {
      console.log(err);
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
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
              Forgot password?
            </h1>
            <p className="text-sm text-[#6B6862] mt-2">
              Enter your email and we'll send you a reset code.
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
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`w-full h-12 pl-10 pr-4 border text-sm outline-none transition-colors ${
                    error ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                  }`}
                />
              </div>
              {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF4B12] hover:bg-[#16161A] text-white font-bold text-sm tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B6862] mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-[#16161A] font-semibold hover:text-[#FF4B12] transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;