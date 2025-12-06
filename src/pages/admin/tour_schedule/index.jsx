import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSchedules, deleteSchedules } from "../../../_services/schedule";
import { getPrograms } from "../../../_services/programs";
import { getGuides } from "../../../_services/guides";
import { getPrices } from "../../../_services/price";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [guides, setGuides] = useState([]);
    const [prices, setPrices] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [openExport, setOpenExport] = useState(false);
    const dropdownRef = useRef();

    const itemsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const [scheduleData, programData, guideData, priceData] =
                await Promise.all([
                    getSchedules(),
                    getPrograms(),
                    getGuides(),
                    getPrices(),
                ]);
            scheduleData.sort((a, b) => b.id - a.id);
            setSchedules(scheduleData);
            setPrograms(programData);
            setGuides(guideData);
            setPrices(priceData);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const clickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpenExport(false);
            }
        };
        document.addEventListener("mousedown", clickOutside);
        return () => document.removeEventListener("mousedown", clickOutside);
    }, []);

    const getProgramName = (id) =>
        programs.find((p) => p.id === id)?.name || "Unknown Program";
    const getGuideName = (id) =>
        guides.find((g) => g.id === id)?.name || "Unknown Guide";
    const getPriceValue = (id) => prices.find((p) => p.id === id)?.price || "-";

    const toggleDropdown = (id) =>
        setOpenDropdownId(openDropdownId === id ? null : id);

    const handleAddSchedule = () => navigate("/admin/schedules/create");
    const handleEdit = (id) => navigate("/admin/schedules/edit/" + id);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this schedule?"))
            return;
        await deleteSchedules(id);
        setSchedules((prev) => prev.filter((s) => s.id !== id));
    };

    /** =========================
     *  SEARCH
     ==========================*/
    const activeQuery = submittedQuery || searchQuery;

    const filteredSchedules = schedules.filter((s) => {
        const q = activeQuery.toLowerCase().trim();
        if (!q) return true;

        const data = {
            program: getProgramName(s.program_id)?.toLowerCase(),
            guide: getGuideName(s.guide_id)?.toLowerCase(),
            date: s.date?.toLowerCase(),
            start: s.start_time?.toLowerCase(),
            end: s.end_time?.toLowerCase(),
            quota: String(s.quota),
            price: String(getPriceValue(s.price_id)),
            id: String(s.id),
        };

        if (q.includes(":")) {
            const [field, value] = q.split(":");
            return data[field]?.includes(value.trim()) ?? false;
        }

        return Object.values(data).some((val) => val?.includes(q));
    });

    /** =========================
     *  PAGINATION
     ==========================*/
    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const currentData = filteredSchedules.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    /** =========================
     *  EXPORT
     ==========================*/
    const handleExport = (format) => {
        if (format === "excel") {
            const ws = XLSX.utils.json_to_sheet([]);
            XLSX.utils.sheet_add_aoa(
                ws,
                [["Laporan Jadwal Pada Aplikasi Palembang Good Guide"]],
                { origin: "A1" }
            );
            XLSX.utils.sheet_add_aoa(
                ws,
                [
                    [
                        "No",
                        "Program",
                        "Guide",
                        "Date",
                        "Start Time",
                        "End Time",
                        "Price",
                        "Quota",
                    ],
                ],
                { origin: "A3" }
            );

            const data = filteredSchedules.map((s, i) => [
                i + 1,
                getProgramName(s.program_id),
                getGuideName(s.guide_id),
                s.date,
                s.start_time,
                s.end_time,
                getPriceValue(s.price_id),
                s.quota,
            ]);

            XLSX.utils.sheet_add_aoa(ws, data, { origin: "A4" });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Schedules");
            XLSX.writeFile(wb, "schedules.xlsx");
        } else if (format === "pdf") {
            const doc = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "a4",
            });
            doc.setFontSize(16);

            doc.text(
                "Laporan Jadwal Program Tour Palembang Good Guide",
                doc.internal.pageSize.getWidth() / 2,
                40,
                { align: "center" }
            );

            const tableColumn = [
                "No",
                "Program",
                "Guide",
                "Date",
                "Start Time",
                "End Time",
                "Price",
                "Quota",
            ];

            const tableRows = filteredSchedules.map((s, i) => [
                i + 1,
                getProgramName(s.program_id),
                getGuideName(s.guide_id),
                s.date,
                s.start_time,
                s.end_time,
                getPriceValue(s.price_id),
                s.quota,
            ]);

            autoTable(doc, {
                startY: 60,
                head: [tableColumn],
                body: tableRows,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [255, 165, 0] },
                margin: { left: 10, right: 10 },
                theme: "grid",
            });

            doc.save("schedules.pdf");
        }

        setOpenExport(false);
    };

    /** =========================
     *  RENDER
     ==========================*/
    return (
        <section className="p-4 sm:p-6">
            <div className="shadow-md rounded-lg bg-white">
                {/* TOP BAR */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-3">
                    {/* SEARCH */}
                    <div className="w-full md:w-1/2">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-orange-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    />
                                </svg>
                            </div>

                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSubmittedQuery("");
                                    setCurrentPage(1);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        setSubmittedQuery(
                                            e.target.value.trim()
                                        );
                                        setCurrentPage(1);
                                    }
                                }}
                                className="border border-orange-500 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 p-2"
                                placeholder="Search Schedule..."
                            />
                        </div>
                    </div>

                    {/* EXPORT & BUTTON */}
                    <div
                        className="flex items-center gap-2 relative"
                        ref={dropdownRef}
                    >
                        <button
                            onClick={() => setOpenExport(!openExport)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm flex items-center gap-1 transition"
                        >
                            Export
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${openExport ? "rotate-180" : "rotate-0"
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

                        {openExport && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow z-10">
                                <button
                                    onClick={() => handleExport("pdf")}
                                    className="w-full text-left px-4 py-2 hover:bg-orange-100"
                                >
                                    PDF
                                </button>

                                <button
                                    onClick={() => handleExport("excel")}
                                    className="w-full text-left px-4 py-2 hover:bg-orange-100"
                                >
                                    Excel
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleAddSchedule}
                            className="text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm px-4 py-2"
                        >
                            Add New Schedule
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-white bg-orange-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Program</th>
                                <th className="px-4 py-3">Guide</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Start Time</th>
                                <th className="px-4 py-3">End Time</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Quota</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((s, i) => (
                                    <tr
                                        key={s.id}
                                        className="border-b hover:bg-orange-50"
                                    >
                                        <td className="px-4 py-3">
                                            {(currentPage - 1) * itemsPerPage +
                                                i +
                                                1}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getProgramName(s.program_id)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getGuideName(s.guide_id)}
                                        </td>
                                        <td className="px-4 py-3">{s.date}</td>
                                        <td className="px-4 py-3">
                                            {s.start_time}
                                        </td>
                                        <td className="px-4 py-3">
                                            {s.end_time}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getPriceValue(s.price_id)}
                                        </td>
                                        <td className="px-4 py-3">{s.quota}</td>

                                        <td className="px-4 py-3 text-right relative">
                                            <button
                                                onClick={() =>
                                                    toggleDropdown(s.id)
                                                }
                                                className="p-1 text-gray-500 hover:text-orange-500"
                                            >
                                                ...
                                            </button>

                                            {openDropdownId === s.id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(s.id)
                                                        }
                                                        className="w-full text-left px-4 py-2 hover:bg-orange-100"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(s.id)
                                                        }
                                                        className="w-full text-left px-4 py-2 hover:bg-orange-100"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="text-center py-4"
                                    >
                                        Data not found!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4">
                    <span className="text-sm">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                            currentPage * itemsPerPage,
                            filteredSchedules.length
                        )}{" "}
                        of {filteredSchedules.length} entries
                    </span>

                    <div className="flex gap-1">
                        <button
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded border ${currentPage === 1
                                    ? "bg-gray-200 text-gray-400"
                                    : "hover:bg-orange-100"
                                }`}
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => changePage(i + 1)}
                                className={`px-4 py-2 rounded border ${currentPage === i + 1
                                        ? "bg-orange-500 text-white"
                                        : "hover:bg-orange-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded border ${currentPage === totalPages
                                    ? "bg-gray-200 text-gray-400"
                                    : "hover:bg-orange-100"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
