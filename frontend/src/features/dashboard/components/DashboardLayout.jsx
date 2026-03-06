import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <main className="pl-[260px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
