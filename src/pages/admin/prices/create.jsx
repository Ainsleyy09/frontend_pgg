import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPrices } from "../../../_services/price";
import { getPrograms } from "../../../_services/programs";

export default function CreatePrice() {
    const [formData, setFormData] = useState({
        program_id: "",
        price: "",
        description: "",
    });

    const [programs, setPrograms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await getPrograms();

                const filtered = (data?.data ?? data ?? []).filter(
                    (p) => p.payment_type === "awal"
                );

                setPrograms(filtered);
            } catch (err) {
                console.error("Error loading programs:", err);
            }
        };

        fetchPrograms();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = new FormData();
            for (const key in formData) {
                payload.append(key, formData[key]);
            }

            await createPrices(payload);
            alert("Price successfully created!");
            navigate("/admin/prices");
        } catch (error) {
            console.error("Error creating price:", error);
            alert("Failed to create price!");
        }
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">

                    {/* HEADER */}
                    <div className="px-8 py-10 bg-white border-b border-orange-100">
                        <h2 className="text-4xl font-extrabold text-orange-600 drop-shadow-sm">
                            Create New Price
                        </h2>
                        <p className="text-orange-500 text-sm mt-1">Isi semua informasi harga</p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* PROGRAM */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-1 block">Program</label>
                            <select
                                name="program_id"
                                required
                                value={formData.program_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                           bg-white text-black placeholder-gray-500
                                           focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                            >
                                <option value="">-- Select Program --</option>
                                {programs.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PRICE */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-1 block">Price</label>
                            <input
                                type="number"
                                name="price"
                                required
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="ex: 75000"
                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                           bg-white text-black placeholder-gray-500
                                           focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-1 block">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Masukkan deskripsi paket harga"
                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                           bg-white text-black placeholder-gray-500
                                           focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                            ></textarea>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex items-center gap-4 pt-6 border-t border-orange-100">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-600 text-white font-semibold
                                           rounded-xl shadow-md hover:bg-orange-700 transition"
                            >
                                Save Price
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/prices")}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold
                                           rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </section>
    );
}
