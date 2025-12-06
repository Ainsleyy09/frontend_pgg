import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { deleteGuides, getGuides } from "../../../_services/guides";
import { guideImageStorage } from "../../../_api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AdminGuides() {
    const [guides, setGuides] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;
    const exportDropdownRef = useRef();
    const [openExportDropdown, setOpenExportDropdown] = useState(false);

    const navigate = useNavigate();

    // Fetch guides
    useEffect(() => {
        const fetchData = async () => {
            try {
                const guideData = await getGuides();
                guideData.sort((a, b) => b.id - a.id);
                setGuides(guideData || []);
            } catch (error) {
                console.error("Error fetching guides:", error);
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

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const handleAddGuides = () => navigate("/admin/guides/create");

    const handleEdit = (id) => navigate("/admin/guides/edit/" + id);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this guide?")) {
            await deleteGuides(id);
            setGuides(guides.filter((g) => g.id !== id));
        }
    };

    // Search filter
    const filteredGuides = guides.filter((g) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;

        if (q.includes(":")) {
            const [field, value] = q.split(":");
            const val = value.trim();

            const fields = {
                name: g.name,
                phone: g.phone,
                role: g.role,
                email: g.email,
                instagram: g.instagram,
                bio: g.bio,
                photo: g.photo,
                id: String(g.id)
            };

            return fields[field]?.toLowerCase().includes(val);
        }

        return (
            g.name?.toLowerCase().includes(q) ||
            g.phone?.toLowerCase().includes(q) ||
            g.email?.toLowerCase().includes(q) ||
            g.instagram?.toLowerCase().includes(q) ||
            g.bio?.toLowerCase().includes(q) ||
            g.photo?.toLowerCase().includes(q) ||
            String(g.id).includes(q)
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredGuides.length / itemsPerPage);
    const currentData = filteredGuides.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const changePage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    useEffect(() => setCurrentPage(1), [searchQuery]);

    // Handle Export
    const handleExport = (format) => {
        if (format === "excel") {
            const ws = XLSX.utils.json_to_sheet([]);

            XLSX.utils.sheet_add_aoa(ws, [["Laporan Anggota Pemandu di Palembang Good Guide"]], {
                origin: "A1"
            });

            XLSX.utils.sheet_add_aoa(
                ws,
                [["No", "Nama", "Phone", "Role", "Email", "Instagram", "Bio"]],
                { origin: "A3" }
            );

            const data = filteredGuides.map((g, i) => [
                i + 1,
                g.name,
                g.phone,
                g.role,
                g.email,
                g.instagram,
                g.bio
            ]);

            XLSX.utils.sheet_add_aoa(ws, data, { origin: "A4" });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Guides");
            XLSX.writeFile(wb, "guides.xlsx");
        }

        if (format === "pdf") {
            const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

            doc.setFontSize(16);
            doc.text(
                "Laporan Anggota Pemandu di Palembang Good Guide",
                doc.internal.pageSize.getWidth() / 2,
                40,
                { align: "center" }
            );

            const tableColumn = ["No", "Nama", "Phone", "Role", "Email", "Instagram", "Bio"];
            const tableRows = filteredGuides.map((g, i) => [
                i + 1,
                g.name,
                g.phone,
                g.role,
                g.email,
                g.instagram,
                g.bio
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

            doc.save("guides.pdf");
        }

        setOpenExportDropdown(false);
    };

    return (
        <section className="p-4 sm:p-6">
            <div className="shadow-md rounded-lg bg-white">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 space-y-3 md:space-y-0">
                    {/* Search */}
                    <div className="w-full md:w-1/2">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-orange-500">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    />
                                </svg>
                            </span>

                            <input
                                type="text"
                                placeholder="Search Tour Guide..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-orange-500 rounded-lg w-full text-sm p-2 pl-10 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Export & Add */}
                    <div className="relative flex flex-wrap items-center gap-2 md:gap-4" ref={exportDropdownRef}>
                        <div className="relative">
                            <button
                                onClick={() => setOpenExportDropdown(!openExportDropdown)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm flex items-center gap-1"
                            >
                                Export
                                <svg
                                    className={`w-4 h-4 transition-transform ${openExportDropdown ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openExportDropdown && (
                                <div className="absolute right-0 mt-1 bg-white border rounded shadow-md w-32 z-10">
                                    <button
                                        onClick={() => handleExport("pdf")}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                    >
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => handleExport("excel")}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                                    >
                                        Excel
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddGuides}
                            className="text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm px-4 py-2"
                        >
                            Add New Guide
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="bg-orange-500 text-white uppercase">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Instagram</th>
                                <th className="px-4 py-3">Bio</th>
                                <th className="px-4 py-3">Photo</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((g, index) => (
                                    <tr key={g.id} className="border-b hover:bg-orange-50">
                                        <td className="px-4 py-3">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>

                                        <td className="px-4 py-3">{g.name}</td>
                                        <td className="px-4 py-3">{g.phone}</td>
                                        <td className="px-4 py-3">{g.role}</td>
                                        <td className="px-4 py-3">{g.email}</td>
                                        <td className="px-4 py-3">{g.instagram}</td>
                                        <td className="px-4 py-3">{g.bio}</td>

                                        <td className="px-4 py-3">
                                            {g.photo ? (
                                                <img
                                                    src={
                                                        g.photo.startsWith("http")
                                                            ? g.photo
                                                            : `${guideImageStorage}/${g.photo}`
                                                    }
                                                    alt={g.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <span className="text-gray-400">No photo</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 relative flex justify-end">
                                            <button
                                                onClick={() => toggleDropdown(g.id)}
                                                className="p-1 text-gray-500 hover:text-orange-500"
                                            >
                                                ...
                                            </button>

                                            {openDropdownId === g.id && (
                                                <div className="absolute right-0 mt-2 bg-white border rounded shadow w-44 z-10">
                                                    <button
                                                        onClick={() => handleEdit(g.id)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-orange-100"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(g.id)}
                                                        className="block w-full text-left px-4 py-2 hover:bg-orange-100 text-red-600"
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
                                    <td colSpan={9} className="text-center py-4">
                                        Data not found!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col md:flex-row justify-between items-center p-4">
                    <span className="text-sm mb-2 md:mb-0">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredGuides.length)} of{" "}
                        {filteredGuides.length} guides
                    </span>

                    <div className="flex gap-1">
                        <button
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 border rounded-lg ${currentPage === 1
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white hover:bg-orange-100"
                                }`}
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => changePage(i + 1)}
                                className={`px-4 py-2 border rounded-lg ${currentPage === i + 1
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white hover:bg-orange-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-4 py-2 border rounded-lg ${currentPage === totalPages || totalPages === 0
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white hover:bg-orange-100"
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

export default AdminGuides;
