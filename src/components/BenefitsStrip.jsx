import {
  FiTruck,
  FiRefreshCcw,
  FiShield,
  FiAward,
} from "react-icons/fi";

const benefits = [
  {
    icon: FiTruck,
    title: "Free Shipping",
    text: "On orders above ₹499",
  },
//   {
//     icon: FiRefreshCcw,
//     title: "Easy Returns",
//     text: "14 days return policy",
//   },

  {
    icon: FiRefreshCcw,
    title: "Exclusive Offers",
    text: "Offers",
  },
  {
    icon: FiShield,
    title: "Secure Payment",
    text: "100% secure checkout",
  },
  {
    icon: FiAward,
    title: "Best Quality",
    text: "Premium products",
  },
];

const BenefitsStrip = () => {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 sm:grid-cols-4">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex items-center gap-3 border-b border-gray-100 px-4 py-5 last:border-b-0 sm:border-b-0 sm:px-6"
          >
            <Icon className="shrink-0 text-2xl text-gray-700" />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide">
                {title}
              </h3>

              <p className="mt-1 text-[11px] text-gray-500">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsStrip;