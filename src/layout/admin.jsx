import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout, useDecodeToken } from "../_services/auth";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    PackageSearch,
    CalendarDays,
    ClipboardList,
    CreditCard,
    MessageSquare,
    LogOut,
    Tags,
    Route,
} from "lucide-react";

function AdminLayout() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const token = localStorage.getItem("accessToken");
    const rawUserInfo = localStorage.getItem("userInfo");
    const userInfo =
        rawUserInfo && rawUserInfo !== "undefined"
            ? JSON.parse(rawUserInfo)
            : null;

    const decodedData = useDecodeToken(token);
    const [isTourSubmenuOpen, setIsTourSubmenuOpen] = useState(false);

    useEffect(() => {
        if (!token || !decodedData || !decodedData.success) {
            navigate("/login");
            return;
        }

        const role = userInfo?.role;
        if (role !== "admin") {
            navigate("/");
        }
    }, [token, decodedData, navigate, userInfo]);

    const handleLogout = async () => {
        if (token) {
            localStorage.removeItem("userInfo");
            await logout({ token });
        }
        navigate("/login");
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleSidebarCollapse = () =>
        setIsSidebarCollapsed(!isSidebarCollapsed);

    return (
        <div className="antialiased bg-gray-50">
            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 w-full">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-gray-700 rounded-lg md:hidden hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 active:scale-95"
                        >
                            <svg
                                className="w-7 h-7"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                            </svg>
                        </button>

                        <button
                            onClick={toggleSidebarCollapse}
                            className="hidden md:block p-2 text-gray-700 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-300 active:scale-95"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                            </svg>
                        </button>

                        {/* LOGO */}
                        <Link to="/admin" className="flex items-center gap-2">
                            <img
                                src="/pgg_Images/pgg_ImgID1.png"
                                className="h-8"
                                alt="Logo"
                            />
                            <span
                                className={`text-lg font-semibold text-gray-800 ${isSidebarCollapsed ? "hidden md:block" : ""
                                    }`}
                            >
                                Palembang Good Guide
                            </span>
                        </Link>
                    </div>

                    {/* USER INFO */}
                    <div className="flex items-center gap-2 group">
                        <img
                            src={`https://ui-avatars.com/api/?name=${userInfo?.name}&background=FF6B35&color=fff`}
                            alt="User"
                            className="w-8 h-8 rounded-full border-2 border-orange-500 group-hover:border-orange-600 transition-all shadow-sm"
                        />
                        <span className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-orange-600 transition">
                            {userInfo?.name}
                        </span>
                    </div>
                </div>
            </nav>

            {/* SIDEBAR */}
            <aside
                className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-white border-r shadow-lg
        transition-transform duration-300 ease-in-out
        w-60
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 ${isSidebarCollapsed ? "md:w-16" : "md:w-56"}
    `}
            >
                <div className="overflow-y-auto py-4 px-2 h-full bg-white">
                    <ul className="space-y-1">
                        {/* Menu */}
                        {[
                            { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 text-gray-500 group-hover:text-orange-500" /> },
                            { to: "/admin/users", label: "Users", icon: <Users className="w-5 h-5 text-gray-500 group-hover:text-orange-500" /> },
                            { to: "/admin/guides", label: "Tour Guides", icon: <UserCheck className="w-5 h-5 text-gray-500 group-hover:text-orange-500" /> },
                        ].map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className="flex items-center p-2 rounded-lg hover:bg-orange-50 group transition text-sm"
                                >
                                    {item.icon}
                                    {!isSidebarCollapsed && (
                                        <span className="ml-2">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        ))}

                        {/* SUBMENU TOUR PROGRAMS */}
                        <li>
                            <button
                                onClick={() =>
                                    setIsTourSubmenuOpen(!isTourSubmenuOpen)
                                }
                                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-orange-50 group transition text-sm"
                            >
                                <div className="flex items-center">
                                    <PackageSearch className="w-5 h-5 text-gray-500 group-hover:text-orange-500" />
                                    {!isSidebarCollapsed && (
                                        <span className="ml-2 text-gray-700 group-hover:text-orange-600">
                                            Tour Programs
                                        </span>
                                    )}
                                </div>

                                {!isSidebarCollapsed && (
                                    <svg
                                        className={`w-4 h-4 text-gray-500 transform transition ${isTourSubmenuOpen ? "rotate-180" : ""
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>

                            {!isSidebarCollapsed && isTourSubmenuOpen && (
                                <ul className="mt-1 ml-5 space-y-1 border-l border-gray-300 pl-2">
                                    <li>
                                        <Link
                                            to="/admin/programs"
                                            className="flex items-center gap-1 p-1 rounded-lg hover:bg-orange-50 text-sm"
                                        >
                                            <Tags className="w-4 h-4" /> Programs
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/admin/prices"
                                            className="flex items-center gap-1 p-1 rounded-lg hover:bg-orange-50 text-sm"
                                        >
                                            <CreditCard className="w-4 h-4" /> Prices
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/admin/routes"
                                            className="flex items-center gap-1 p-1 rounded-lg hover:bg-orange-50 text-sm"
                                        >
                                            <Route className="w-4 h-4" /> Routes
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>

                    {/* Lainnya */}
                    <ul className="pt-4 mt-4 space-y-1 border-t border-gray-200">
                        {[
                            { to: "/admin/schedules", label: "Tour Schedule", icon: <CalendarDays className="w-5 h-5" /> },
                            { to: "/admin/registrations", label: "Registrations", icon: <ClipboardList className="w-5 h-5" /> },
                            { to: "/admin/payments", label: "Payments", icon: <CreditCard className="w-5 h-5" /> },
                            { to: "/admin/feedbacks", label: "Feedback", icon: <MessageSquare className="w-5 h-5" /> },
                        ].map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    className="flex items-center p-2 rounded-lg hover:bg-orange-50 group transition text-sm"
                                >
                                    {item.icon}
                                    {!isSidebarCollapsed && (
                                        <span className="ml-2">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        ))}

                        <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow text-sm"
                            >
                                <LogOut className="w-5 h-5" />
                                {!isSidebarCollapsed && <span className="ml-2">Logout</span>}
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <main
                className={`p-3 h-auto pt-20 transition-all duration-300 ${isSidebarCollapsed ? "md:ml-16" : "md:ml-56"
                    }`}
            >
                <div className="rounded-lg bg-white shadow-sm h-auto px-4 pt-4 pb-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
