import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { toast } from "react-toastify";
import {
  FiTrash2,
  FiZap,
  FiChevronDown,
  FiLoader,
  FiX,
  FiClock,
  FiTag,
  FiAlertCircle,
} from "react-icons/fi";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Live Sale Modal State
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleForm, setSaleForm] = useState({
    saleText: "",
    promoEndTime: "",
  });
  const [saleSubmitting, setSaleSubmitting] = useState(false);

  // FETCH PRODUCTS
  const fetchProducts = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await axiosInstance.get(
        `/products?page=${pageNum}&limit=10`
      );
      const data = response.data;

      if (data?.success || Array.isArray(data?.products)) {
        const fetchedList = data.products || [];
        const total = data.totalProducts ?? fetchedList.length;

        if (append) {
          setProducts((prev) => [...prev, ...fetchedList]);
        } else {
          setProducts(fetchedList);
        }

        setTotalProducts(total);
        setHasMore(data.hasMore ?? pageNum * 10 < total);
        setPage(pageNum);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1, true);
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axiosInstance.delete(`/products/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts(1, false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  // TOGGLE FEATURED
  const toggleFeatured = async (id, currentValue) => {
    try {
      await axiosInstance.put(`/products/${id}`, {
        featured: !currentValue,
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, featured: !currentValue } : p))
      );
      toast.success("Featured status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  // HELPER: Check if product has active live sale
  const isSaleActive = (product) => {
    if (!product?.isLiveSale) return false;
    if (!product?.promoEndTime) return true;
    return new Date(product.promoEndTime) > new Date();
  };

  // OPEN SALE MODAL
  const openSaleModal = (product) => {
    setSelectedProduct(product);
    setSaleForm({
      saleText: product.saleText || "FLASH SALE",
      promoEndTime: product.promoEndTime
        ? new Date(product.promoEndTime).toISOString().slice(0, 16)
        : "",
    });
    setSaleModalOpen(true);
  };

  // SUBMIT OR STOP LIVE SALE
  const handleSaveLiveSale = async (shouldEnd = false) => {
    if (!selectedProduct) return;

    if (!shouldEnd && !saleForm.saleText.trim()) {
      toast.error("Please enter sale badge text");
      return;
    }

    try {
      setSaleSubmitting(true);
      const payload = shouldEnd
        ? {
            isLiveSale: false,
            saleText: "",
            promoEndTime: null,
          }
        : {
            isLiveSale: true,
            saleText: saleForm.saleText,
            promoEndTime: saleForm.promoEndTime || null,
          };

      await axiosInstance.put(
        `/products/live-sale/${selectedProduct._id}`,
        payload
      );

      toast.success(
        shouldEnd ? "Live sale ended" : "Live sale published successfully!"
      );
      setSaleModalOpen(false);
      setSelectedProduct(null);

      // Local state update
      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProduct._id ? { ...p, ...payload } : p
        )
      );
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update live sale");
    } finally {
      setSaleSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, false);
  }, []);

  return (
    <>
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              All Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage catalog, live flash sales, featured items, and stock
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs sm:text-sm text-slate-300 self-start sm:self-auto">
            Showing{" "}
            <span className="font-bold text-blue-400">{products.length}</span>{" "}
            of <span className="font-bold text-white">{totalProducts}</span>{" "}
            Products
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            Loading products catalog...
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[860px] text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[11px] sm:text-xs">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Sale Status</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.length > 0 ? (
                  products.map((product) => {
                    const activeSale = isSaleActive(product);

                    return (
                      <tr
                        key={product._id}
                        className={`transition ${
                          activeSale
                            ? "bg-amber-500/5 hover:bg-amber-500/10"
                            : "hover:bg-slate-800/30"
                        }`}
                      >
                        {/* Product Info */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={
                                  product.variants?.[0]?.images?.[0] ||
                                  "/placeholder.png"
                                }
                                alt={product.name}
                                className="w-14 h-14 object-cover rounded-xl border border-slate-800 shrink-0"
                              />
                              {activeSale && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white line-clamp-1">
                                {product.name}
                              </div>
                              <div className="text-[11px] text-slate-500 capitalize">
                                {product.brand || "SoldOut"} •{" "}
                                {product.variants?.length || 0} variant(s)
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4 capitalize">{product.category}</td>

                        {/* Price */}
                        <td className="p-4 font-bold text-white">
                          ₹
                          {product.variants?.[0]?.sizes?.[0]?.price?.toLocaleString(
                            "en-IN"
                          ) || 0}
                        </td>

                        {/* Live Sale Status Pill */}
                        <td className="p-4">
                          {activeSale ? (
                            <div className="inline-flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                LIVE: {product.saleText || "ON SALE"}
                              </span>
                              {product.promoEndTime && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                  <FiClock className="w-3 h-3 text-amber-400" />
                                  Ends:{" "}
                                  {new Date(
                                    product.promoEndTime
                                  ).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
                              Standard
                            </span>
                          )}
                        </td>

                        {/* Featured Button */}
                        <td className="p-4">
                          <button
                            onClick={() =>
                              toggleFeatured(product._id, product.featured)
                            }
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                              product.featured
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {product.featured ? "FEATURED" : "NO"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openSaleModal(product)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer active:scale-95 ${
                                activeSale
                                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-500/20"
                                  : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              <FiZap className="w-3.5 h-3.5" />
                              {activeSale ? "Edit Sale" : "Go Live"}
                            </button>

                            <button
                              onClick={() => deleteProduct(product._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer active:scale-95"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-500">
                      No products found in catalog
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && (
          <div className="p-5 border-t border-slate-800/80 flex items-center justify-center bg-slate-900/50">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin text-blue-400" />
                  Loading More Products...
                </>
              ) : (
                <>
                  <FiChevronDown className="w-4 h-4 text-blue-400" />
                  Show More ({totalProducts - products.length} remaining)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Interactive Live Sale Modal */}
      {saleModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSaleModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative"
          >
            <button
              onClick={() => setSaleModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FiZap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isSaleActive(selectedProduct)
                    ? "Manage Live Sale"
                    : "Publish Live Sale"}
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-[240px]">
                  {selectedProduct.name}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sale Promotional Text / Tag
                </label>
                <div className="relative">
                  <FiTag className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="e.g. FLASH DEAL 50% OFF, LIMITED TIME"
                    value={saleForm.saleText}
                    onChange={(e) =>
                      setSaleForm({ ...saleForm, saleText: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sale End Date & Time (Optional)
                </label>
                <div className="relative">
                  <FiClock className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                  <input
                    type="datetime-local"
                    value={saleForm.promoEndTime}
                    onChange={(e) =>
                      setSaleForm({
                        ...saleForm,
                        promoEndTime: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Leave empty if the sale has no automatic countdown expiry.
                </p>
              </div>

              {isSaleActive(selectedProduct) && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  This product is currently active in the live sale.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              {isSaleActive(selectedProduct) ? (
                <button
                  type="button"
                  disabled={saleSubmitting}
                  onClick={() => handleSaveLiveSale(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold cursor-pointer transition active:scale-95"
                >
                  End Sale
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSaleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                disabled={saleSubmitting}
                onClick={() => handleSaveLiveSale(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {saleSubmitting
                  ? "Saving..."
                  : isSaleActive(selectedProduct)
                  ? "Update Sale"
                  : "Activate Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductTable;