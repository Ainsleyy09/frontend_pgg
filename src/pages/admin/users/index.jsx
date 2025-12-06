import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../../_api";
import { getUsers } from "../../../_services/user";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HiTrash } from "react-icons/hi";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [openDropdown, setOpenDropdown] = useState(false);

    const navigate = useNavigate();
    const itemsPerPage = 10;
    const dropdownRef = useRef();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data || []);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?"))
            return;

        try {
            await API.delete(`/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            setUsers(users.filter((u) => u.id !== id));
        } catch (error) {
            console.error(error.response?.data || error);
            alert("Failed to delete user!");
        }
    };

    const filteredUsers = users.filter((u) => {
        const q = searchQuery.toLowerCase().trim();
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirst, indexOfLast);

    useEffect(() => setCurrentPage(1), [searchQuery]);

    const handleExport = (format) => {
        // setExportFormat(format); // hapus ini
        if (format === "excel") {
            const ws = XLSX.utils.json_to_sheet([]);
            XLSX.utils.sheet_add_aoa(ws, [["Laporan Pengguna Pada Aplikasi Palembang Good Guide"]], { origin: "A1" });
            XLSX.utils.sheet_add_aoa(ws, [["No", "Nama", "Email", "Role"]], { origin: "A3" });
            const data = filteredUsers.map((u) => [u.id, u.name, u.email, u.role]);
            XLSX.utils.sheet_add_aoa(ws, data, { origin: "A4" });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Users");
            XLSX.writeFile(wb, "users.xlsx");
        } else if (format === "pdf") {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "pt",
                format: "a4"
            });

            doc.setFontSize(16);
            doc.text(
                "Laporan Pengguna Pada Aplikasi Palembang Good Guide",
                doc.internal.pageSize.getWidth() / 2,
                40,
                { align: "center" }
            );

            const tableColumn = ["No", "Nama", "Email", "Role"];
            const tableRows = filteredUsers.map((u, index) => [
                index + 1,
                u.name,
                u.email,
                u.role
            ]);

            autoTable(doc, {
                startY: 60,
                head: [tableColumn],
                body: tableRows,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [255, 165, 0] },
                margin: { left: 10, right: 10 },
                theme: "grid"
            });

            doc.save("users.pdf");
        }
    };

    return (
        <section className="p-4 sm:p-6">
            <div className="shadow-lg rounded-xl bg-white">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-3">
                    <div className="w-full md:w-1/2">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-orange-500 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 p-2"
                                placeholder="Search User..."
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpenDropdown(!openDropdown)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm flex items-center gap-1 transition"
                        >
                            Export
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${openDropdown ? "rotate-180" : "rotate-0"}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {openDropdown && (
                            <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-10 w-32">
                                <button
                                    onClick={() => handleExport("pdf")}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    PDF
                                </button>
                                <button
                                    onClick={() => handleExport("excel")}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Excel
                                </button>
                            </div>
                        )}

                    {/* Add User Button */}
                    <button
                        onClick={() => navigate("/admin/users/create")}
                        className="text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm px-4 py-2"
                    >
                        Add New User
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-orange-500 text-white uppercase">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3 text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((u) => (
                                <tr
                                    key={u.id}
                                    className="border-b hover:bg-orange-50"
                                >
                                    <td className="px-4 py-3">{u.id}</td>
                                    <td className="px-4 py-3">{u.name}</td>
                                    <td className="px-4 py-3">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === "admin"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                handleDeleteUser(u.id)
                                            }
                                            className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
                                        >
                                            <HiTrash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center p-4 text-gray-500"
                                >
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center p-4">
                <span className="text-sm">
                    Showing {indexOfFirst + 1}–
                    {Math.min(indexOfLast, filteredUsers.length)} of{" "}
                    {filteredUsers.length}
                </span>

                <div className="flex gap-1">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-4 py-2 rounded-lg border bg-white hover:bg-orange-100 disabled:opacity-40"
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded-lg border ${currentPage === i + 1
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-white hover:bg-orange-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-4 py-2 rounded-lg border bg-white hover:bg-orange-100 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div >
        </section >
    );
}

export default AdminUsers;
