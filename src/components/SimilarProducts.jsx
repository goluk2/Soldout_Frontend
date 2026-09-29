import { useNavigate } from "react-router-dom";

const SimilarProducts = ({ similarProducts }) => {
  const navigate = useNavigate();

  if (!similarProducts?.length) return null;

  return (
    <section className="bg-[#F5F3EE] pt-10 border-t border-[#E4E1D9]">
      <span className="block text-[11px] font-[JetBrains_Mono] tracking-[0.2em] uppercase text-[#FF4B12] font-semibold mb-2">
        You may also like
      </span>

      <h2 className="text-3xl sm:text-4xl font-[Bebas_Neue] tracking-wide text-[#16161A] mb-8">
        Similar Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {similarProducts.map((item) => (
          <div
            key={item._id}
            onClick={() => navigate(`/product/${item._id}`)}
            className="cursor-pointer group"
          >
            <div className="relative bg-white border border-[#E4E1D9] overflow-hidden aspect-[3/4]">
              <img
                src={item.variants[0].images[0]}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[#16161A] text-white text-[11px] font-[JetBrains_Mono] tracking-widest uppercase text-center py-2">
                View Product
              </div>
            </div>

            <h3 className="mt-3 text-sm font-medium text-[#16161A] line-clamp-2">
              {item.name}
            </h3>

            <p className="mt-1.5 font-[JetBrains_Mono] font-bold text-[#16161A]">
              ₹{item.variants[0].sizes[0].price}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;