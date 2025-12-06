import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPrices, deletePrices } from "../../../_services/price";
import { getPrograms } from "../../../_services/programs";

export default function AdminPrice() {
    const [prices, setPrices] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const itemsPerPage = 10; // bisa diubah ke 5 kalau mau lebih compact

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [priceData, programData] = await Promise.all([
                    getPrices(),
                    getPrograms(),
                ]);
                const sortedPrices = Array.isArray(priceData) ? priceData.sort((a, b) => b.id - a.id) : [];
                setPrices(Array.isArray(priceData) ? priceData : []);
                setPrograms(Array.isArray(programData?.data) ? programData.data : []);
            } catch (error) {
                console.error("Error loading data:", error);
                setPrices([]);
                setPrograms([]);
            }
        };
        fetchData();
    }, []);

    const getProgramName = (id) => {
        const p = programs.find((p) => p.id === id);
        return p ? p.name : "Unknown Program";
    };

    const toggleDropdown = (id) => setOpenDropdownId(openDropdownId === id ? null : id);
    const handleAddPrice = () => navigate("/admin/prices/create");
    const handleEdit = (id) => navigate("/admin/prices/edit/" + id);
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this price?")) {
            await deletePrices(id);
            setPrices(prices.filter((p) => p.id !== id));
        }
    };

    // FILTER
    const filteredPrices = prices.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;

        const data = {
            program: p.program?.name?.toLowerCase(),
            price: String(p.price),
            description: p.description?.toLowerCase(),
            id: String(p.id),
        };

        if (q.includes(":")) {
            const [field, value] = q.split(":");
            const val = value.trim();
            return data[field]?.includes(val) ?? false;
        }

        return Object.values(data).some((val) => val?.includes(q));
    });

    // PAGINATION
    const totalPages = Math.ceil(filteredPrices.length / itemsPerPage);
    const currentData = filteredPrices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const changePage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <section className="p-4 sm:p-6">
            <div className="shadow-md rounded-lg bg-white">

                {/* SEARCH + ADD BUTTON */}
                <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div className="w-full md:w-1/2">
                        <form className="flex items-center w-full">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
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
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="border border-orange-500 text-gray-900 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 p-2"
                                    placeholder="Search Price..."
                                />
                            </div>
                        </form>
                    </div>

                    <button
                        onClick={handleAddPrice}
                        className="text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm px-4 py-2"
                    >
                        Add New Price
                    </button>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-white bg-orange-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Program</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? currentData.map((p, i) => (
                                <tr key={p.id} className="border-b hover:bg-orange-50 transition-colors">
                                    <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                    <td className="px-4 py-3">{p.program?.name || "Unknown Program"}</td>
                                    <td className="px-4 py-3">Rp {p.price.toLocaleString()}</td>
                                    <td className="px-4 py-3 max-w-xs">{p.description}</td>
                                    <td className="px-4 py-3 flex items-center justify-end relative">
                                        <button onClick={() => toggleDropdown(p.id)} className="p-1 text-gray-500 hover:text-orange-500">...</button>
                                        {openDropdownId === p.id && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow divide-y">
                                                <ul className="py-1 text-sm text-gray-700">
                                                    <li>
                                                        <button onClick={() => handleEdit(p.id)} className="w-full text-left py-2 px-4 hover:bg-orange-100">
                                                            Edit
                                                        </button>
                                                    </li>
                                                </ul>
                                                <div className="py-1">
                                                    <button onClick={() => handleDelete(p.id)} className="w-full text-left py-2 px-4 hover:bg-orange-100 text-red-600">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-4">Data not found!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center gap-4 py-4 px-6 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPrices.length)} of {filteredPrices.length} prices
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changePage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="border rounded px-3 py-1 text-sm w-20 disabled:opacity-40 hover:bg-orange-50 transition"
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => changePage(i + 1)}
                                className={`border rounded px-3 py-1 text-sm w-10 ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'hover:bg-orange-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => changePage(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="border rounded px-3 py-1 text-sm w-20 disabled:opacity-40 hover:bg-orange-50 transition"
                        >
                            Next
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}
