import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../api/axios";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import ShopByCategory from "../components/ShopByCategory";
import ProductCard from "../components/ProductCard";
import PromoBanner from "../components/PromoBanner";
import Footer from "../components/Footer";

import BenefitsStrip from "../components/BenefitsStrip";
import FeaturedCollections from "../components/FeaturedCollections";
import ServiceBenefits from "../components/ServiceBenefits";

import {
  setProducts,
  setLoading,
} from "../features/product/productSlice";

const Home = () => {
  const dispatch = useDispatch();

  const { products = [], loading } = useSelector(
    (state) => state.product
  );

  const fetchProducts = async () => {
    try {
      dispatch(setLoading(true));

      const response = await axiosInstance.get(
        "/products?featured=true&limit=10"
      );

      dispatch(setProducts(response.data.products || []));
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <Navbar />

      <main>
        <HeroSection />

        <BenefitsStrip />

        <ShopByCategory />

        <FeaturedCollections />
        

        <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Customer favourites
              </p>

              <h2 className="text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                Best Sellers
              </h2>
            </div>

            <button className="text-sm font-medium text-gray-700 transition hover:text-black">
              View All →
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden border border-gray-100"
                >
                  <div className="aspect-[4/5] bg-gray-200" />
                  <div className="space-y-3 p-3">
                    <div className="h-3 w-1/3 bg-gray-200" />
                    <div className="h-4 w-4/5 bg-gray-200" />
                    <div className="h-4 w-1/2 bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {products.slice(0, 10).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-500">
              No products available.
            </p>
          )}
        </section>

        <PromoBanner />

        <ServiceBenefits />
      </main>

      <Footer />
    </div>
  );
};

export default Home;