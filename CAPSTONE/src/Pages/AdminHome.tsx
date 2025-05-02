import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import AdminOverview from "../components/AdminComponents/AdminOverview";
import AdminUsers from "../components/AdminComponents/AdminUsers";
import AdminContent from "../components/AdminComponents/AdminContent";
import AdminAchievements from "../components/AdminComponents/AdminAchievements";
import AdminSidebar from "../components/AdminComponents/AdminSidebar";

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Check URL params for active tab whenever location changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      // If no tab is specified in URL, default to overview
      setActiveTab("overview");
    }
  }, [searchParams, location]);

  // Render active component based on selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "users":
        return <AdminUsers />;
      case "content":
        return <AdminContent />;
      case "achievements":
        return <AdminAchievements />;
      case "overview":
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative">
      <AdminSidebar activeTab={activeTab} />

      <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        <div className="lg:hidden mb-4">
          <h1 className="text-2xl font-bold capitalize">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
        </div>

        {renderActiveComponent()}
      </div>
    </div>
  );
}
