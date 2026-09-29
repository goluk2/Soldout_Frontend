import {
  FiHeart,
  FiStar,
  FiTag,
  FiMessageCircle,
} from "react-icons/fi";

const services = [
  {
    icon: FiHeart,
    title: "Trendy Styles",
    text: "Stay ahead with the latest fashion.",
  },
  {
    icon: FiStar,
    title: "Premium Quality",
    text: "Handpicked fabrics for the best comfort.",
  },
  {
    icon: FiTag,
    title: "Affordable Prices",
    text: "Best style at the best prices.",
  },
  {
    icon: FiMessageCircle,
    title: "Customer Support",
    text: "We are here to help you anytime.",
  },
];

const ServiceBenefits = () => {
  return (
    <section className="border-y border-gray-100 bg-[#fafafa]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 sm:grid-cols-4">
        {services.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="border-b border-gray-100 px-5 py-7 last:border-b-0 sm:border-b-0 sm:border-r sm:px-7 sm:last:border-r-0"
          >
            <Icon className="mb-4 text-2xl text-gray-700" />

            <h3 className="text-sm font-bold">{title}</h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceBenefits;