import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { deletePrograms, getPrograms } from "../../../_services/programs";
import { programImageStorage } from "../../../_api";
import { getPrices } from "../../../_services/price";
import { getRoutes } from "../../../_services/routes";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function AdminPrograms() {
    const [programs, setProgram] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(false);  // ⬅ dropdown export
    const dropdownRef = useRef(); // ⬅ outside click

    const navigate = useNavigate();
    const [exportFormat, setExportFormat] = useState("pdf");
    const [searchQuery, setSearchQuery] = useState("");
    const [prices, setPrices] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // close dropdown when click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const programsData = await getPrograms();
                const pricesData = await getPrices();
                const routesData = await getRoutes();

                const parsedRoutes = routesData.map(r => ({
                    ...r,
                    route_coordinates: (() => {
                        try {
                            const arr =
                                typeof r.route_coordinates === "string"
                                    ? JSON.parse(r.route_coordinates)
                                    : r.route_coordinates;
                            return arr.map(p => ({
                                lat: Number(p.lat),
                                lng: Number(p.lng),
                                label: p.label ?? "",
                            }));
                        } catch (e) {
                            return [];
                        }
                    })(),
                }));
                programsData.sort((a, b) => b.id - a.id);
                setProgram(programsData || []);
                setPrices(pricesData || []);
                setRoutes(parsedRoutes || []);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);

    const getMergedProgramData = () => {
        return filteredPrograms.map((p) => {
            const price = prices.find((pr) => pr.program_id === p.id);
            const route = routes.find((rt) => rt.program_id === p.id);

            return {
                ...p,
                price: price?.price ?? "-",
                route_coordinates: route?.route_coordinates ?? [],
            };
        });
    };

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const handleAddPrograms = () => {
        navigate("/admin/programs/create");
    };

    const handleEdit = (id) => {
        navigate("/admin/programs/edit/" + id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this program tour?")) {
            await deletePrograms(id);
            setProgram(programs.filter((p) => p.id !== id));
        }
    };

    // Filter
    const filteredPrograms = programs.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;

        if (q.includes(":")) {
            const [field, value] = q.split(":").map((v) => v.trim());
            const mapping = {
                name: p.name,
                description: p.description,
                payment: p.payment_type,
                payment_type: p.payment_type,
                program_type: p.program_type,
                duration: p.duration,
                status: p.status,
                id: String(p.id),
            };
            return mapping[field]?.toLowerCase().includes(value) ?? true;
        }

        return [
            p.name,
            p.description,
            p.payment_type,
            p.program_type,
            p.duration,
            p.status,
            String(p.id),
        ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(q));
    });

    const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
    const currentData = filteredPrograms.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const changePage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const handleExport = (format) => {
        setExportFormat(format);

        const merged = getMergedProgramData();
        const exportData = merged.map((m, i) => ({
            No: i + 1,
            Name: m.name,
            Payment: m.payment_type,
            Type: m.program_type,
            Duration: m.duration,
            Price: m.price,
            Coordinates: m.route_coordinates
                .map((c) => `${c.label} (${c.lat}, ${c.lng})`)
                .join("\n"),
        }));

        if (format === "excel") {
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Programs");
            XLSX.writeFile(wb, "programs.xlsx");
        } else {
            const doc = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "a4"
            });

            doc.setFontSize(16);
            doc.text(
                "Laporan Program Tour Palembang Good Guide",
                doc.internal.pageSize.getWidth() / 2,
                40,
                { align: "center" }
            );

            const tableColumn = [
                "No",
                "Name",
                "Payment",
                "Type",
                "Duration",
                "Price",
                "Coordinates"
            ];

            const tableRows = exportData.map((d) => Object.values(d));

            autoTable(doc, {
                startY: 60,
                head: [tableColumn],
                body: tableRows,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [255, 165, 0] },
                margin: { left: 10, right: 10 },
                theme: "grid",
            });

            doc.save("programs.pdf");
        }
        setOpenDropdown(false);
    };

    return (
        <section className="p-4 sm:p-6">
            <div className="shadow-md rounded-lg bg-white">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 space-y-3 md:space-y-0">

                    {/* Search */}
                    <div className="w-full md:w-1/2">
                        <form className="flex items-center">
                            <label htmlFor="simple-search" className="sr-only">Search</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="simple-search"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="border border-orange-500 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 p-2"
                                    placeholder="Search Program Tour..."
                                />
                            </div>
                        </form>
                    </div>

                    <div className="relative flex flex-wrap items-center gap-2 md:gap-4">
                        <div className="relative" ref={dropdownRef}>
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
                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border z-20">
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
                            onClick={handleAddPrograms}
                            className="text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm px-4 py-2">
                            Add New Program Tour
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-white bg-orange-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3">Photo</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((p, i) => (
                                    <tr key={p.id} className="border-b hover:bg-orange-50">
                                        <td className="px-4 py-3">
                                            {(currentPage - 1) * itemsPerPage + i + 1}
                                        </td>
                                        <td className="px-4 py-3">{p.name}</td>
                                        <td className="px-4 py-3">{p.description}</td>
                                        <td className="px-4 py-3">{p.payment_type}</td>
                                        <td className="px-4 py-3">{p.program_type}</td>
                                        <td className="px-4 py-3">{p.duration}</td>
                                        <td className="px-4 py-3">
                                            {p.program_photo ? (
                                                <img
                                                    src={`${programImageStorage}/${p.program_photo}`}
                                                    alt={p.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <span>No photo</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{p.status}</td>

                                        {/* Action dropdown */}
                                        <td className="px-4 py-3 flex items-center justify-end relative">
                                            <button
                                                onClick={() => toggleDropdown(p.id)}
                                                className="p-1 text-gray-500 hover:text-orange-500"
                                            >
                                                ...
                                            </button>

                                            {openDropdownId === p.id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white bg-white rounded shadow divide-y">
                                                    <button
                                                        onClick={() => handleEdit(p.id)}
                                                        className="block px-4 py-2 w-full text-left hover:bg-orange-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="block px-4 py-2 w-full text-left hover:bg-orange-100 text-red-600"
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
                                    <td colSpan={9} className="text-center p-4">
                                        Data not found!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4">
                    <span className="text-sm mb-2 md:mb-0">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, filteredPrograms.length)} of{" "}
                        {filteredPrograms.length} entries
                    </span>

                    <div className="flex gap-1">
                        <button
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg border ${currentPage === 1
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white hover:bg-orange-100"
                                }`}
                        >
                            Prev
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => changePage(i + 1)}
                                className={`px-4 py-2 rounded-lg border ${currentPage === i + 1
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white hover:bg-orange-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg border ${currentPage === totalPages
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

export default AdminPrograms;
