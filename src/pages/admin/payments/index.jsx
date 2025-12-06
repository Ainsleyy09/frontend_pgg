import React, { useEffect, useState, useRef } from "react";
import { getPayments } from "../../../_services/payment";
import { getRegistrations } from "../../../_services/registration";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminPayment() {
    const [paymentList, setPaymentList] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const exportDropdownRef = useRef();
    const [openExportDropdown, setOpenExportDropdown] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const payments = await getPayments();
                const regs = await getRegistrations();

                const merged = payments.map(payment => ({
                    id: payment.id,
                    registration_id: payment.registration_id,
                    order_number: payment.registration?.order_number ?? "-",
                    amount: payment.amount ?? 0,
                    payment_method: payment.payment_method ?? "-",
                    transaction_id: payment.transaction_id ?? "-",
                    payment_date: payment.payment_date ?? null,
                    status: payment.status ?? "pending"
                }));
                merged.sort((a, b) => b.id - a.id);
                setPaymentList(merged);
                setRegistrations(regs);
            } catch (error) {
                console.error("Error fetching payments or registrations:", error);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
                setOpenExportDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const statusColor = {
        pending: "bg-yellow-100 text-yellow-700",
        success: "bg-green-100 text-green-700",
        failed: "bg-red-100 text-red-700",
    };

    const getGuideName = (registration_id) => {
        const reg = registrations.find(r => r.id === registration_id);
        return reg?.schedule?.guide?.name || "-";
    };

    const filteredPayments = paymentList.filter(p => {
        const q = searchQuery.toLowerCase().trim();
        const dateString = p.payment_date ? new Date(p.payment_date).toLocaleString("id-ID").toLowerCase() : "";
        return (
            String(p.order_number).toLowerCase().includes(q) ||
            String(p.payment_method).toLowerCase().includes(q) ||
            String(p.transaction_id).toLowerCase().includes(q) ||
            String(p.status).toLowerCase().includes(q) ||
            dateString.includes(q)
        );
    });

    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const currentData = filteredPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const changePage = (page) => { if (page < 1 || page > totalPages) return; setCurrentPage(page); };

    const handleExport = (format) => {
        if (format === "excel") {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet([]);
            XLSX.utils.sheet_add_aoa(ws, [["Laporan Pembayaran Palembang Good Guide"]], { origin: "A1" });
            XLSX.utils.sheet_add_aoa(ws, [["No", "Order Number", "Amount", "Method", "Transaction ID", "Date", "Status", "Guide"]], { origin: "A3" });
            const data = filteredPayments.map((p, i) => [
                i + 1, p.order_number, `Rp ${p.amount.toLocaleString("id-ID")}`, p.payment_method, p.transaction_id || "-", p.payment_date ? new Date(p.payment_date).toLocaleString("id-ID") : "-", p.status, getGuideName(p.registration_id)
            ]);
            XLSX.utils.sheet_add_aoa(ws, data, { origin: "A4" });
            XLSX.utils.book_append_sheet(wb, ws, "Payments");
            XLSX.writeFile(wb, "payments.xlsx");
        } else if (format === "pdf") {
            const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
            doc.setFontSize(16);
            doc.text("Laporan Pembayaran Palembang Good Guide", doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });
            const tableColumn = ["No", "Order Number", "Amount", "Method", "Transaction ID", "Date", "Status", "Guide"];
            const tableRows = filteredPayments.map((p, i) => [i + 1, p.order_number, `Rp ${p.amount.toLocaleString("id-ID")}`, p.payment_method, p.transaction_id || "-", p.payment_date ? new Date(p.payment_date).toLocaleString("id-ID") : "-", p.status, getGuideName(p.registration_id)]);
            autoTable(doc, { startY: 60, head: [tableColumn], body: tableRows, styles: { fontSize: 10 }, headStyles: { fillColor: [255, 165, 0] }, margin: { top: 20, left: 15, right: 15, bottom: 20 }, theme: "grid" });
            doc.save("payments.pdf");
        }
        setOpenExportDropdown(false);
    };

    return (
        <section className="p-4 sm:p-6">
            <div className="shadow-lg rounded-xl bg-white">

                {/* HEADER + SEARCH + EXPORT */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-gray-200 gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">All Payments</h2>

                    <div className="flex w-full md:w-1/2 gap-2">
                        {/* SEARCH */}
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search Payment..."
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
                            <button onClick={() => setOpenExportDropdown(!openExportDropdown)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm flex items-center gap-1 transition">
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
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Method</th>
                                <th className="px-4 py-3">Transaction ID</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? currentData.map((p, i) => (
                                <tr key={p.id} className="border-b hover:bg-orange-50 transition-colors">
                                    <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                    <td className="px-4 py-3">{p.order_number}<br /><span className="text-xs text-gray-500">ID: {p.registration_id}</span></td>
                                    <td className="px-4 py-3">Rp {p.amount.toLocaleString("id-ID")}</td>
                                    <td className="px-4 py-3">{p.payment_method}</td>
                                    <td className="px-4 py-3 text-xs">{p.transaction_id || "-"}</td>
                                    <td className="px-4 py-3">{p.payment_date ? new Date(p.payment_date).toLocaleString("id-ID") : "-"}</td>
                                    <td className="px-4 py-3"><span className={`px-3 py-1 text-xs font-semibold rounded ${statusColor[p.status]}`}>{p.status}</span></td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="text-center p-6 text-gray-500">Data not found!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center gap-4 py-4 px-6 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments</span>
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
