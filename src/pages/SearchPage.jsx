import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axios";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { FiChevronDown, FiSliders, FiX } from "react-icons/fi";
import Footer from "../components/Footer";
const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Shirt", value: "shirt" },
  { label: "Shoes", value: "Shoes" },
  { label: "Watch", value: "Watch" },
];

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price -- Low to High", value: "lowToHigh" },
  { label: "Price -- High to Low", value: "highToLow" },
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/products?search=${query}&category=${category}&sort=${sort}`
      );
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [query, category, sort]);

  const FilterPanel = () => (
    <>
      <div className="pb-5 mb-5 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">
          Category
        </h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`w-full text-left px-2.5 py-2 rounded-sm text-sm transition-colors flex items-center justify-between ${
                category === cat.value
                  ? "bg-orange-50 text-[#FF4B12] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.label}
              {category === cat.value && <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B12]" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">
          Sort By
        </h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`w-full text-left px-2.5 py-2 rounded-sm text-sm transition-colors flex items-center justify-between ${
                sort === opt.value
                  ? "bg-orange-50 text-[#FF4B12] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
              {sort === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B12]" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F1F3F6] font-sans text-gray-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* RESULTS HEADER BAR */}
        <div className="bg-white rounded-sm shadow-sm px-5 py-4 mb-4">
          <p className="text-xs text-gray-400 mb-1">
            {loading ? "Searching..." : `${products.length} result${products.length === 1 ? "" : "s"} found for`}
          </p>
          <h1 className="text-xl font-bold text-gray-900">
            "{query}"
          </h1>
        </div>

        {/* SORT BAR — Flipkart-style horizontal tabs (desktop only, mirrors sidebar sort) */}
        <div className="hidden lg:flex bg-white rounded-sm shadow-sm mb-4 px-5 items-center gap-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-3">Sort By</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                sort === opt.value
                  ? "border-[#FF4B12] text-[#FF4B12] font-semibold"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* MOBILE FILTER TOGGLE */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden w-full bg-white rounded-sm shadow-sm mb-4 px-5 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-700"
        >
          <FiSliders /> Filters & Sort
        </button>

        <div className="grid lg:grid-cols-[240px_1fr] gap-4 items-start">

          {/* DESKTOP SIDEBAR */}
          <div className="hidden lg:block bg-white rounded-sm shadow-sm p-5 sticky top-20">
            <FilterPanel />
          </div>

          {/* MOBILE FILTER DRAWER */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="relative ml-auto w-[85%] max-w-xs bg-white h-full overflow-y-auto p-5 shadow-xl">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">Filters & Sort</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500">
                    <FiX className="text-xl" />
                  </button>
                </div>
                <FilterPanel />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full mt-6 bg-[#FF4B12] text-white text-sm font-semibold py-3 rounded-sm"
                >
                  Show Results
                </button>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          <div>
            {loading ? (
              <div className="bg-white rounded-sm shadow-sm py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#FF4B12] rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-sm shadow-sm py-24 flex flex-col items-center justify-center text-center px-6">
                <p className="text-lg font-semibold text-gray-800 mb-1.5">No products found</p>
                <p className="text-sm text-gray-500">
                  Try checking your spelling or use more general terms.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default SearchPage;