import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import AdminDashboard from "../pages/AdminDashboard";
import ManageProducts from "../pages/ManageProducts";
import AddProduct from "../pages/AddProduct";
import ManageOrders from "../pages/ManageOrders";

const AdminLayout = () => {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const renderPage = () => {
    switch (activePage) {

      case "products":
        return <ManageProducts />;

      case "add-product":
        return <AddProduct />;

      case "orders":
        return <ManageOrders />;

      case "hero":
        return <HeroManagement />;

      case "dashboard":
      default:
        return (
          <AdminDashboard
            setActivePage={setActivePage}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex overflow-hidden">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ================================================= */}
      {/* RIGHT PANEL */}
      {/* ================================================= */}

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* TOPBAR */}

        <Topbar
          toggleSidebar={toggleSidebar}
        />

        {/* PAGE CONTENT */}

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 min-w-0 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {renderPage()}
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;