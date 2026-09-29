import { FiPackage, FiShoppingBag, FiDollarSign, FiUsers } from "react-icons/fi";

const DashboardCards = ({ stats, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue),
      icon: <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />,
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: <FiShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />,
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />,
      bgColor: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Total Customers",
      value: stats?.totalUsers ?? 0,
      icon: <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />,
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg min-w-0"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-gray-400 text-xs sm:text-sm font-medium truncate">{card.title}</h2>
            <div className={`p-2.5 sm:p-3 rounded-xl border shrink-0 ${card.bgColor}`}>
              {card.icon}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 sm:mt-4 tracking-tight truncate">
            {card.value}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;