import React, { useEffect, useState } from "react";
import { Users, UserCheck, Layers, ClipboardList, CreditCard, MessageCircle, Calendar } from "lucide-react";

import { getUsers } from "../../_services/user";
import { getGuides } from "../../_services/guides";
import { getRegistrations } from "../../_services/registration";
import { getPrograms } from "../../_services/programs";
import { getPayments } from "../../_services/payment";
import { getFeedbacks } from "../../_services/feedback";
import { getSchedules } from "../../_services/schedule";

// =============================
// ⭐ UTIL FUNCTION
// =============================
const formatTimeDigital = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

const formatDate = (date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// =============================
// ⭐ STAT CARD COMPONENT
// =============================
function StatCard({ icon, title, value, color }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white shadow-md`}>
                    {React.cloneElement(icon, { className: "w-6 h-6 md:w-8 md:h-8" })}
                </div>
                <p className="text-sm md:text-base font-semibold text-gray-800">{title}</p>
            </div>
            <p className="text-2xl md:text-4xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

// =============================
// ⭐ MAIN DASHBOARD COMPONENT
// =============================
function Dashboard() {
    const [time, setTime] = useState(new Date());
    const [stats, setStats] = useState({
        users: 0,
        guides: 0,
        programs: 0,
        registrations: 0,
        payments: 0,
        feedbacks: 0,
        schedules: 0,
    });

    const rawUserInfo = localStorage.getItem("userInfo");
    const userInfo = rawUserInfo && rawUserInfo !== "" ? JSON.parse(rawUserInfo) : null;

    // CLOCK
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // FETCH DATA
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [users, guides, programs, registrations, payments, feedbacks, schedules] = await Promise.all([
                    getUsers(), getGuides(), getPrograms(), getRegistrations(), getPayments(), getFeedbacks(), getSchedules()
                ]);
                setStats({
                    users: users.length,
                    guides: guides.length,
                    programs: programs.length,
                    registrations: registrations.length,
                    payments: payments.length,
                    feedbacks: feedbacks.length,
                    schedules: schedules.length,
                });
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* HEADER */}
                <header className="space-y-2 text-center lg:text-left">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        Selamat datang, {userInfo ? userInfo.name : "Admin"}!
                    </h1>
                    <p className="text-md md:text-lg text-gray-700 font-medium">
                        Kelola semua data Anda dengan mudah dan efisien
                    </p>
                </header>

                {/* WAKTU & STATUS */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* WAKTU SISTEM */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-transform duration-300 hover:scale-[1.02]">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wide">Waktu Sistem</h2>
                        <div className="p-6 rounded-xl bg-gradient-to-r from-orange-200 to-orange-300 text-center shadow-inner mb-4">
                            <p className="text-4xl md:text-5xl font-mono font-bold text-gray-900">{formatTimeDigital(time)}</p>
                        </div>
                        <div className="p-4 bg-orange-100 rounded-xl text-center border border-orange-200 shadow-sm">
                            <p className="text-lg md:text-xl font-semibold text-gray-800">{formatDate(time)}</p>
                        </div>
                    </div>

                    {/* STATUS SISTEM */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-transform duration-300 hover:scale-[1.02]">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wide">Status Sistem</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full animate-pulse shadow-md"></div>
                                <p className="text-xl md:text-2xl font-bold text-gray-900">Operasional</p>
                            </div>
                            <p className="text-gray-700 font-medium text-sm md:text-base">
                                Semua layanan berjalan dengan sempurna dan siap digunakan
                            </p>
                        </div>
                    </div>
                </section>

                {/* STATISTIK */}
                <section>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center lg:text-left">Overview Statistik</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <StatCard icon={<Users />} title="Users" value={stats.users} color="bg-blue-400" />
                        <StatCard icon={<UserCheck />} title="Guides" value={stats.guides} color="bg-green-400" />
                        <StatCard icon={<Layers />} title="Program" value={stats.programs} color="bg-purple-400" />
                        <StatCard icon={<ClipboardList />} title="Registration" value={stats.registrations} color="bg-yellow-400" />
                        <StatCard icon={<CreditCard />} title="Payment" value={stats.payments} color="bg-orange-400" />
                        <StatCard icon={<MessageCircle />} title="Feedback" value={stats.feedbacks} color="bg-pink-400" />
                        <StatCard icon={<Calendar />} title="Schedules" value={stats.schedules} color="bg-cyan-400" />
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Dashboard;
