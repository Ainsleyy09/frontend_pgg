import React, { useEffect, useState, useRef } from 'react';
import { getFeedbacks } from '../../../_services/feedback';
import { getUsers } from '../../../_services/user';
import { API } from '../../../_api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HiTrash } from "react-icons/hi";

function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Export dropdown
    const exportDropdownRef = useRef();
    const [openExportDropdown, setOpenExportDropdown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const feedbackData = await getFeedbacks();
                feedbackData.sort((a, b) => b.id - a.id);
                const usersData = await getUsers();
                setFeedbacks(feedbackData);
                setUsers(usersData);
            } catch (err) {
                console.error('Error fetching feedbacks or users:', err);
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

    const getUserName = (id) => {
        const user = users.find(u => u.id === id);
        return user ? user.name : 'Unknown User';
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this feedback?')) {
            try {
                await API.delete(`/feedbacks/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                setFeedbacks(feedbacks.filter(f => f.id !== id));
            } catch (err) {
                console.error(err.response?.data || err);
                alert('Failed to delete feedback!');
            }
        }
    };

    // FILTER
    const filteredFeedbacks = feedbacks.filter(f => {
        const q = searchQuery.toLowerCase().trim();
        return (
            getUserName(f.user_id).toLowerCase().includes(q) ||
            String(f.rating).includes(q) ||
            f.comments?.toLowerCase().includes(q)
        );
    });

    // EXPORT
    const handleExport = (format) => {
        const exportData = filteredFeedbacks.map((f, i) => ({
            No: i + 1,
            User: getUserName(f.user_id),
            Rating: f.rating,
            Comments: f.comments || "-"
        }));

        if (format === "excel") {
            const ws = XLSX.utils.json_to_sheet([]);
            XLSX.utils.sheet_add_aoa(ws, [["Laporan Ulasan Pengguna Palembang Good Guide"]], { origin: "B1" });
            XLSX.utils.sheet_add_aoa(ws, [["No", "User", "Rating", "Comments"]], { origin: "B3" });
            XLSX.utils.sheet_add_aoa(ws, exportData.map(e => [e.No, e.User, e.Rating, e.Comments]), { origin: "B4" });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Feedback");
            XLSX.writeFile(wb, "feedback.xlsx");
        }

        if (format === "pdf") {
            const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
            doc.setFontSize(16);
            doc.text("Laporan Ulasan Pengguna Palembang Good Guide", doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });

            const tableHeader = ["No", "User", "Rating", "Comments"];
            const tableBody = filteredFeedbacks.map((f, i) => [i + 1, getUserName(f.user_id), f.rating, f.comments || "-"]);

            autoTable(doc, {
                startY: 60,
                head: [tableHeader],
                body: tableBody,
                styles: { fontSize: 10, cellWidth: "wrap", overflow: "linebreak", whiteSpace: "normal" },
                headStyles: { fillColor: [255, 165, 0] },
                margin: { top: 20, left: 15, right: 15, bottom: 20 },
                theme: "grid",
            });

            doc.save("feedback.pdf");
        }

        setOpenExportDropdown(false);
    };

    // Pagination
    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
    const currentData = filteredFeedbacks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const changePage = (page) => { if (page < 1 || page > totalPages) return; setCurrentPage(page); };

    return (
        <section className="p-4 sm:p-6">
            <div className="shadow-lg rounded-xl bg-white">

                {/* HEADER + SEARCH + EXPORT */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-200 gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">All Feedbacks</h2>

                    <div className="flex w-full md:w-1/2 gap-2">
                        {/* SEARCH */}
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search Feedback..."
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
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Comments</th>
                                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? currentData.map((f, i) => (
                                <tr key={f.id} className="border-b hover:bg-orange-50 transition-colors">
                                    <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                    <td className="px-4 py-3">{getUserName(f.user_id)}</td>
                                    <td className="px-4 py-3">{f.rating}</td>
                                    <td className="px-4 py-3 break-words max-w-xs">{f.comments}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDelete(f.id)} className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded flex items-center justify-center gap-1 shadow-md hover:shadow-lg">
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-6 text-gray-500">Data not found!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center gap-4 py-4 px-6 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)} of {filteredFeedbacks.length} feedbacks
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

export default AdminFeedback;
