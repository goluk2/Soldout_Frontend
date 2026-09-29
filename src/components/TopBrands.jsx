import { useNavigate } from "react-router-dom";

const TopBrands = () => {
  const navigate = useNavigate();

  const brands = [
    {
      name: "Nike",
      query: "nike",
    },
    {
      name: "Adidas",
      query: "adidas",
    },
    {
      name: "Puma",
      query: "puma",
    },
    {
      name: "Levi's",
      query: "levis",
    },
    {
      name: "Zara",
      query: "zara",
    },
  ];

  return (
    <section className="w-full mb-8 sm:mb-10">
      {/* TOP */}
      <div className="flex items-center justify-between mb-5 sm:mb-7">
        <h2
          className="
          text-2xl
          sm:text-3xl
          lg:text-4xl
          font-bold
          text-slate-900"
        >
          Top Brands
        </h2>

        <button
          className="
          text-sm
          sm:text-base
          font-medium
          text-blue-600
          hover:text-blue-700
          transition"
        >
          Explore All
        </button>
      </div>

      {/* GRID */}
      <div
        className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        gap-3
        sm:gap-5"
      >
        {brands.map((brand, index) => (
          <div
            key={index}
            onClick={() =>
              navigate(
                `/search?q=${brand.query}`
              )
            }
            className="
            bg-white
            border
            border-slate-200
            rounded-xl
            sm:rounded-2xl
            py-4
            sm:py-6
            px-4
            flex
            items-center
            justify-center
            cursor-pointer
            hover:shadow-lg
            hover:-translate-y-1
            transition-all
            duration-300
            group"
          >
            <h3
              className="
              text-lg
              sm:text-2xl
              font-bold
              text-slate-800
              group-hover:text-blue-600
              transition"
            >
              {brand.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopBrands;