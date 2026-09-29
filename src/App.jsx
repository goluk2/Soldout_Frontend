import {BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { setUser } from "./features/auth/authSlice";

import {
  useDispatch,
  useSelector,
} from "react-redux";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Toaster } from "react-hot-toast";

import axiosInstance from "./api/axios";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetails from "./pages/ProductDetails";
import MyOrders from "./pages/MyOrders";
import SearchPage from "./pages/SearchPage";
import Wishlist from "./pages/Wishlist";
// import Admin from "./pages/Admin";

import {setWishlist,} from "./features/wishlist/wishlistSlice";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";

import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


import AdminLogin from "./admin/pages/AdminLogin";
import AdminLayout from "./admin/layout/AdminLayout";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";


import ScrollToTop from "./components/ScrollToTop";

function App() {
const dispatch = useDispatch();

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No token found");
    return;
  }

  console.log("Token found, checking /auth/me...");

  axiosInstance
    .get("/auth/me")
    .then((response) => {
      console.log("AUTH ME RESPONSE:", response.data);

      dispatch(
        setUser(
          response.data.user || response.data
        )
      );
    })
    .catch((error) => {
      console.log("AUTH ME ERROR:", error);
      console.log("STATUS:", error.response?.status);
      console.log("DATA:", error.response?.data);
    });
}, [dispatch]);
  useEffect(() => {

  const fetchWishlist = async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) return;

      const response =
        await axiosInstance.get(

          "/wishlist",

          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      dispatch(
        setWishlist(response.data)
      );

    } catch (error) {

      console.log(error);
    }
  };

  fetchWishlist();

}, []);

  return (


     <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
        }}
      />

<ScrollToTop/>
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

      <Route path="/checkout" element={ <ProtectedRoute> <Checkout /></ProtectedRoute>} />
    
     {/* <Route path="/admin" element={<Admin />} /> */}

    <Route path="/my-orders" element={<ProtectedRoute> <MyOrders /></ProtectedRoute>}/>

    <Route path="/product/:id" element={<ProductDetails />}/>

     <Route path="/search" element={<SearchPage />}/>

     <Route path="/wishlist" element={ <ProtectedRoute><Wishlist /></ProtectedRoute>}/>

     <Route path="/my-orders/:id" element={ <ProtectedRoute> <OrderDetails /></ProtectedRoute>} />
     <Route path="/profile" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
     

     <Route path="/verify-email" element={<VerifyEmail />} />
     <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    <Route path="/admin/login" element={<AdminLogin/>}/>
    <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}/>
</Routes>
</>
  );
}

export default App;