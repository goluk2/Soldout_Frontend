import { useState } from "react";
import axiosInstance from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiLock,
  FiShield,
} from "react-icons/fi";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Please enter admin username");
      return;
    }

    if (!formData.password) {
      toast.error("Please enter password");
      return;
    }

    try {
      setLoading(true);

      const response =
        await axiosInstance.post(
          "/auth/admin/login",
          {
            username:
              formData.username.trim(),
            password:
              formData.password,
          }
        );

      // Admin ka separate token
      localStorage.setItem(
        "adminToken",
        response.data.token
      );

      localStorage.setItem(
        "adminUsername",
        response.data.username
      );

      toast.success(
        `Welcome, ${response.data.username}`
      );

      navigate("/admin", {
        replace: true,
      });

    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Admin login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FF4B12] mb-5">

            <FiShield className="text-white text-2xl" />

          </div>

          <h1 className="text-white text-3xl font-bold">
            SOLD OUT
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Administration Portal
          </p>

        </div>


        {/* LOGIN BOX */}

        <div className="bg-[#111827] border border-slate-800 p-7 sm:p-8">

          <div className="mb-7">

            <span className="text-[#FF4B12] text-xs font-semibold tracking-[0.2em] uppercase">
              Restricted Access
            </span>

            <h2 className="text-2xl font-bold text-white mt-2">
              Admin Login
            </h2>

            <p className="text-slate-400 text-sm mt-2">
              Enter your administrator credentials.
            </p>

          </div>


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* USERNAME */}

            <div>

              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Admin Username
              </label>

              <div className="relative">

                <FiUser
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                  "
                />

                <input
                  type="text"
                  name="username"
                  placeholder="Enter admin username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  className="
                    w-full
                    h-12
                    bg-[#0B1120]
                    border
                    border-slate-700
                    text-white
                    pl-10
                    pr-4
                    outline-none
                    focus:border-[#FF4B12]
                  "
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>

              <div className="relative">

                <FiLock
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                  "
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="
                    w-full
                    h-12
                    bg-[#0B1120]
                    border
                    border-slate-700
                    text-white
                    pl-10
                    pr-12
                    outline-none
                    focus:border-[#FF4B12]
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                >
                  {showPassword
                    ? <FiEyeOff />
                    : <FiEye />
                  }
                </button>

              </div>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                h-12
                bg-[#FF4B12]
                hover:bg-[#E53E0A]
                text-white
                font-bold
                transition
                disabled:opacity-60
              "
            >

              {loading
                ? "Logging in..."
                : "Access Admin Panel"
              }

            </button>

          </form>

        </div>


        <p className="text-center text-xs text-slate-600 mt-6">
          Authorized personnel only.
          All access attempts are monitored.
        </p>

      </div>

    </div>
  );
};

export default AdminLogin;