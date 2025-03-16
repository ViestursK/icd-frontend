import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
