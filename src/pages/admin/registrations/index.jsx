import React, { useEffect, useState, useRef } from "react";
import {
    getRegistrations,
    deleteRegistration,
    updateRegistration,
} from "../../../_services/registration";
import { getSchedules } from "../../../_services/schedule";
import { getPrograms } from "../../../_services/programs";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HiTrash } from "react-icons/hi";

function AdminRegistration() {
    const [registrations, setRegistrations] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const exportDropdownRef = useRef();
    const [openExportDropdown, setOpenExportDropdown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const regRes = await getRegistrations();
                regRes.sort((a, b) => b.id - a.id);
                setRegistrations(regRes);

                const schRes = await getSchedules();
                setSchedules(schRes);

                const programRes = await getPrograms();
                setPrograms(programRes);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, []);

    // Close export dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
                setOpenExportDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getScheduleName = (scheduleId) => {
        const s = schedules.find((x) => x.id == scheduleId);
        return s ? s.name : "Unknown";
    };

    const getProgramName = (scheduleId) => {
        const s = schedules.find((x) => x.id == scheduleId);
        if (!s) return "Unknown";
        const p = programs.find((x) => x.id == s.program_id);
        return p ? p.name : "Unknown";
    };

    const isLocked = (status) => status === "selesai" || status === "batal";

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure want to delete this registration?")) return;
        try {
            await deleteRegistration(id);
            setRegistrations(registrations.filter((r) => r.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChangeExplicit = async (id, newStatus) => {
        try {
            const formData = new FormData();
            formData.append("status", newStatus);
            await updateRegistration(id, formData);

            setRegistrations((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, status: newStatus } : item
                )
            );
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const activeQuery = searchQuery.toLowerCase();
    const safeLower = (value) => (value ? value.toString().toLowerCase() : "");

    const filtered = registrations.filter((r) =>
        safeLower(r.name).includes(activeQuery) ||
        safeLower(r.email).includes(activeQuery) ||
        safeLower(r.phone).includes(activeQuery) ||
        safeLower(r.order_number).includes(activeQuery) ||
        safeLower(r.region).includes(activeQuery) ||
        safeLower(getScheduleName(r.schedule_id)).includes(activeQuery) ||
        safeLower(getProgramName(r.schedule_id)).includes(activeQuery) ||
        safeLower(r.status).includes(activeQuery) ||
        safeLower(r.instagram).includes(activeQuery)
    );

    const handleExport = (format) => {
        if (format === "excel") {
            const ws = XLSX.utils.json_to_sheet([]);
            XLSX.utils.sheet_add_aoa(
                ws,
                [["Laporan Registrasi Pada Aplikasi Palembang Good Guide"]],
                { origin: "B1" }
            );
            XLSX.utils.sheet_add_aoa(
                ws,
                [
                    [
                        "No",
                        "Order Number",
                        "Name",
                        "Region",
                        "Phone",
                        "Email",
                        "Instagram",
                        "Program",
                        "Guide",
                        "Price",
                        "Status",
                    ],
                ],
                { origin: "B3" }
            );

            const data = filtered.map((r, i) => [
                i + 1,
                r.order_number,
                r.name,
                r.region,
                r.phone,
                r.email,
                r.instagram,
                getProgramName(r.schedule_id),
                r.schedule?.guide?.name || "-",
                r.schedule?.price?.price
                    ? `Rp ${r.schedule.price.price.toLocaleString()}`
                    : "-",
                r.status,
            ]);

            XLSX.utils.sheet_add_aoa(ws, data, { origin: "B4" });

            ws["!cols"] = [
                { wch: 5 },
                { wch: 15 },
                { wch: 20 },
                { wch: 15 },
                { wch: 15 },
                { wch: 25 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
                { wch: 12 },
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Registrations");
            XLSX.writeFile(wb, "registrations.xlsx");
        } else if (format === "pdf") {
            const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

            doc.setFontSize(16);
            doc.text(
                "Laporan Registrasi Program Tour Palembang Good Guide",
                doc.internal.pageSize.getWidth() / 2,
                40,
                { align: "center" }
            );

            const tableColumn = [
                "No",
                "Order Number",
                "Name",
                "Region",
                "Phone",
                "Email",
                "Instagram",
                "Program",
                "Guide",
                "Price",
                "Status",
            ];

            const tableRows = filtered.map((r, i) => [
                i + 1,
                r.order_number,
                r.name,
                r.region,
                r.phone,
                r.email,
                r.instagram,
                getProgramName(r.schedule_id),
                r.schedule?.guide?.name || "-",
                r.schedule?.price?.price
                    ? `Rp ${r.schedule.price.price.toLocaleString()}`
                    : "-",
                r.status,
            ]);

            autoTable(doc, {
                startY: 60,
                head: [tableColumn],
                body: tableRows,

                theme: "grid",
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    overflow: "linebreak",
                },

                headStyles: { fillColor: [255, 165, 0] },

                // ⬇️ BIAR TABEL FULL DAN TIDAK MELEBAR KE KANAN
                tableWidth: "auto",
                halign: "center",

                // ⬇️ Margin perketat
                margin: { top: 20, left: 15, right: 15 },

                columnStyles: {
                    0: { cellWidth: 30 },  // No
                    1: { cellWidth: 70 },  // Order Number
                    2: { cellWidth: 90 },  // Name
                    3: { cellWidth: 70 },  // Region
                    4: { cellWidth: 80 },  // Phone
                    5: { cellWidth: 120 }, // Email
                    6: { cellWidth: 70 },  // Instagram
                    7: { cellWidth: 100 }, // Program
                    8: { cellWidth: 70 },  // Guide
                    9: { cellWidth: 60 },  // Price
                    10: { cellWidth: 65 }, // Status
                },

                didDrawPage: () => {
                    doc.setFontSize(16);
                    doc.text(
                        "Laporan Registrasi Program Tour Palembang Good Guide",
                        doc.internal.pageSize.getWidth() / 2,
                        40,
                        { align: "center" }
                    );
                },
            });

            doc.save("registrations.pdf");
        }
        setOpenE(false);
    };

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const changePage = (page) => { if (page < 1 || page > totalPages) return; setCurrentPage(page); };

    const statusColor = {
        menunggu: "bg-yellow-100 text-yellow-700",
        dikonfirmasi: "bg-blue-100 text-blue-700",
        selesai: "bg-green-100 text-green-700",
        batal: "bg-red-100 text-red-700",
    };

    return (
        <section className="p-4 sm:p-6">
            <div className="shadow-lg rounded-xl bg-white">
                {/* HEADER + SEARCH + EXPORT */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-200 gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">All Registrations</h2>

                    <div className="flex w-full md:w-1/2 gap-2">
                        {/* SEARCH */}
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search Registration..."
                                className="border border-orange-500 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 w-full pl-10 p-2 shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                                </svg>
                            </div>
                        </div>

                        {/* EXPORT */}
                        <div className="relative" ref={exportDropdownRef}>
                            <button
                                onClick={() => setOpenExportDropdown(!openExportDropdown)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm flex items-center gap-1 transition"
                            >
                                Export
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${openExportDropdown
                                        ? "rotate-180"
                                        : "rotate-0"
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {openExportDropdown && (
                                <div className="absolute right-0 mt-1 bg-white border rounded shadow-md z-10 w-32">
                                    <button onClick={() => handleExport("pdf")} className="w-full text-left px-4 py-2 hover:bg-gray-100">PDF</button>
                                    <button onClick={() => handleExport("excel")} className="w-full text-left px-4 py-2 hover:bg-gray-100">Excel</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-white bg-orange-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Order Number</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Region</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Instagram</th>
                                <th className="px-4 py-3">Program Tour</th>
                                <th className="px-4 py-3">Guide</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? currentData.map((r, index) => (
                                <tr key={r.id} className="border-b hover:bg-orange-50 transition-colors">
                                    <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-4 py-3">{r.order_number}</td>
                                    <td className="px-4 py-3">{r.name}</td>
                                    <td className="px-4 py-3">{r.region}</td>
                                    <td className="px-4 py-3">{r.phone}</td>
                                    <td className="px-4 py-3">{r.email}</td>
                                    <td className="px-4 py-3">{r.instagram}</td>
                                    <td className="px-4 py-3">{r.schedule?.program?.name || "Unknown"}</td>
                                    <td className="px-4 py-3">{r.schedule?.guide?.name || "-"}</td>
                                    <td className="px-4 py-3">{r.schedule?.price?.price ? `Rp ${r.schedule.price.price.toLocaleString()}` : "-"}</td>
                                    <td className="px-4 py-3">
                                        {!isLocked(r.status) ? (
                                            r.status === "menunggu" ? (
                                                <select
                                                    value={r.status}
                                                    onChange={(e) => handleStatusChangeExplicit(r.id, e.target.value)}
                                                    className="appearance-none px-3 py-1.5 pr-8 bg-white text-sm rounded-lg border border-gray-300 focus:ring-orange-500"
                                                >
                                                    <option value="menunggu">Menunggu</option>
                                                    <option value="dikonfirmasi">Dikonfirmasi</option>
                                                    <option value="batal">Batal</option>
                                                </select>
                                            ) : r.status === "dikonfirmasi" ? (
                                                <button
                                                    onClick={() => handleStatusChangeExplicit(r.id, "selesai")}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded"
                                                >
                                                    Selesai
                                                </button>
                                            ) : null
                                        ) : (
                                            <span className={`px-3 py-1 text-xs font-semibold rounded ${statusColor[r.status]} opacity-70 cursor-not-allowed`}>
                                                {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleDelete(r.id)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded flex items-center justify-center mx-auto">
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={12} className="text-center p-6 text-gray-500">Data not found!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center gap-4 py-4 px-6 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} registrations
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="border rounded px-3 py-1 text-sm w-20 disabled:opacity-40 hover:bg-orange-50 transition">Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => changePage(i + 1)} className={`border rounded px-3 py-1 text-sm w-10 ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'hover:bg-orange-50'}`}>{i + 1}</button>
                        ))}
                        <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="border rounded px-3 py-1 text-sm w-20 disabled:opacity-40 hover:bg-orange-50 transition">Next</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AdminRegistration;
