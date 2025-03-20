import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./DashboardLayout.css";
function DashboardLayout() {
  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
