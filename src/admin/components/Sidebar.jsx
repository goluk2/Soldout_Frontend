import {
  FiGrid,
  FiBox,
  FiPlusSquare,
  FiShoppingCart,
  FiImage,
  FiX,
} from "react-icons/fi";

const Sidebar = ({
  activePage,
  setActivePage,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const menu = [
    {
      name: "dashboard",
      label: "Dashboard",
      icon: <FiGrid className="w-5 h-5" />,
    },
    {
      name: "products",
      label: "Products",
      icon: <FiBox className="w-5 h-5" />,
    },
    {
      name: "add-product",
      label: "Add Product",
      icon: <FiPlusSquare className="w-5 h-5" />,
    },
    {
      name: "orders",
      label: "Orders",
      icon: <FiShoppingCart className="w-5 h-5" />,
    },
    {
      name: "hero",
      label: "Hero Section",
      icon: <FiImage className="w-5 h-5" />,
    },
  ];

  const handleMenuClick = (name) => {
    setActivePage(name);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Section */}
        <div className="p-5 flex-1 overflow-y-auto scrollbar-none">

          {/* Logo */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">

              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/30">
                S
              </div>

              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                SoldOut Admin
              </h1>

            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white md:hidden cursor-pointer"
              aria-label="Close Navigation"
            >
              <FiX className="w-5 h-5" />
            </button>

          </div>

          {/* Nav Menu */}
          <nav className="space-y-1.5">

            {menu.map((item) => {
              const isActive =
                activePage === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() =>
                    handleMenuClick(item.name)
                  }
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                  }`}
                >
                  {item.icon}

                  <span>{item.label}</span>
                </button>
              );
            })}

          </nav>
        </div>

        {/* Bottom Version Tag */}
        <div className="p-4 border-t border-slate-800/80 text-center bg-slate-900/50">
          <p className="text-[11px] font-mono text-slate-500">
            SoldOut v2.4.0 • Production
          </p>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;