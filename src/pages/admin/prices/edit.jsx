import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showPrices, updatePrices } from "../../../_services/price";
import { getPrograms } from "../../../_services/programs";

export default function EditPrice() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        program_id: "",
        price: "",
        description: "",
    });

    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const priceData = await showPrices(id);
                const programData = await getPrograms();

                const filtered = (programData?.data ?? programData ?? []).filter(
                    (p) => p.payment_type === "awal"
                );

                setPrograms(filtered);

                setFormData({
                    program_id: priceData.program_id || "",
                    price: priceData.price || "",
                    description: priceData.description || "",
                });

            } catch (error) {
                console.error("Error loading price:", error);
            }
        };

        fetchData();
    }, [id]);

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

            await updatePrices(id, payload);

            alert("Price updated successfully!");
            navigate("/admin/prices");

        } catch (error) {
            console.error("Error updating price:", error);
            alert("Failed to update price!");
        }
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">

                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">

                    <div className="px-8 py-10 border-b border-orange-100">
                        <h2 className="text-4xl font-extrabold text-orange-600">Edit Price</h2>
                        <p className="text-orange-500 text-sm mt-1">Update price information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* PROGRAM */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-2 block">Program</label>

                            <select
                                name="program_id"
                                required
                                value={formData.program_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white
                                text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200
                                focus:border-orange-500 transition"
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
                            <label className="font-semibold text-gray-900 mb-2 block">Price</label>
                            <input
                                type="number"
                                name="price"
                                required
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white
                                text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200
                                focus:border-orange-500 transition"
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-2 block">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white
                                text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200
                                focus:border-orange-500 transition"
                            ></textarea>
                        </div>

                        {/* BUTTON */}
                        <div className="flex items-center gap-4 pt-6 border-t border-orange-100">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl
                                shadow-md hover:bg-orange-700 transition"
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
