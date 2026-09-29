import { useState } from "react";
import axiosInstance from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiUser, FiLock, FiMail, FiCheck } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { label: "", color: "" };
    if (password.length < 6) return { label: "Too short", color: "bg-red-400" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-400" };
    if (score <= 2) return { label: "Fair", color: "bg-amber-400" };
    if (score === 3) return { label: "Good", color: "bg-blue-400" };
    return { label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const errors = {};
    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedUsername) {
      errors.username = "Please enter a username";
    } else if (trimmedUsername.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      errors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!trimmedEmail) {
      errors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Please create a password";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getFriendlyErrorMessage = (error) => {
    if (!error.response) {
      return "Unable to connect. Please check your internet connection and try again.";
    }
    const status = error.response.status;
    const data = error.response.data;

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0].msg || "Please check the details you entered.";
    }

    switch (status) {
      case 400:
        return data?.message || "Some details are missing or invalid. Please check and try again.";
      case 409:
        return data?.message || "An account with these details already exists.";
      case 429:
        return "Too many attempts. Please wait a few minutes and try again.";
      case 500:
      case 502:
      case 503:
        return data?.message || "Something went wrong on our end. Please try again in a moment.";
      default:
        return data?.message && typeof data.message === "string"
          ? data.message
          : "Registration failed. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    const trimmedEmail = formData.email.trim();

    try {
      const response = await axiosInstance.post("/auth/register", {
        username: formData.username.trim(),
        email: trimmedEmail,
        password: formData.password,
      });

      toast.success(response.data.message || "Account created! Check your email for the verification code.");

      // 🛠️ Email register-response me already mil chuka hai, seedha verify page pe
      navigate("/verify-email", { state: { email: trimmedEmail } });
    } catch (error) {
      console.log(error);
      toast.error(getFriendlyErrorMessage(error));
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
              Create your account
            </h1>
            <p className="text-sm text-[#6B6862] mt-2">
              Join us for exclusive deals and faster checkout.
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
                  placeholder="Choose a username"
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
              <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
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
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
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
              {formData.password && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex-1 h-1 bg-[#E4E1D9] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width:
                          passwordStrength.label === "Too short" || passwordStrength.label === "Weak"
                            ? "25%"
                            : passwordStrength.label === "Fair"
                            ? "50%"
                            : passwordStrength.label === "Good"
                            ? "75%"
                            : "100%",
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-[#8A8780] w-14 shrink-0">{passwordStrength.label}</span>
                </div>
              )}
              {fieldErrors.password && <p className="text-xs text-red-600 mt-1.5">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="text-[11px] font-[JetBrains_Mono] tracking-[0.16em] text-[#8A8780] uppercase block mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] text-base" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full h-12 pl-10 pr-11 border text-sm outline-none transition-colors ${
                    fieldErrors.confirmPassword ? "border-red-400 focus:border-red-500" : "border-[#E4E1D9] focus:border-[#16161A]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B4B2A9] hover:text-[#16161A] transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && !fieldErrors.confirmPassword && (
                  <FiCheck className="absolute right-11 top-1/2 -translate-y-1/2 text-emerald-500" />
                )}
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-[11px] text-[#8A8780] text-center leading-relaxed pt-1">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="text-center text-sm text-[#6B6862] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#16161A] font-semibold hover:text-[#FF4B12] transition-colors">
              Log in
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-[#B4B2A9] mt-6">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
};

export default Register;