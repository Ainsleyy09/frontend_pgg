import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPrograms } from "../../../_services/programs";
import { getGuides } from "../../../_services/guides";
import { getPrices } from "../../../_services/price";
import { showSchedules, updateSchedules } from "../../../_services/schedule";

function EditSchedule() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [programs, setPrograms] = useState([]);
    const [guides, setGuides] = useState([]);
    const [prices, setPrices] = useState([]);
    const [filteredPrices, setFilteredPrices] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split("T")[0];

    const [formData, setFormData] = useState({
        program_id: "",
        guide_id: "",
        price_id: "",
        date: "",
        start_time: "",
        end_time: "",
        quota: "",
        _method: "PUT",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [programData, guideData, priceData, scheduleData] =
                    await Promise.all([
                        getPrograms(),
                        getGuides(),
                        getPrices(),
                        showSchedules(id),
                    ]);

                setGuides(guideData);
                setPrices(priceData);
                setPrograms(programData);

                setFormData({
                    program_id: scheduleData.program_id,
                    guide_id: scheduleData.guide_id,
                    price_id: scheduleData.price_id || "",
                    date: scheduleData.date?.split(" ")[0] ?? "",
                    start_time: scheduleData.start_time?.slice(0, 5),
                    end_time: scheduleData.end_time?.slice(0, 5),
                    quota: scheduleData.quota,
                });

                const prog = programData.find(
                    (p) => p.id === scheduleData.program_id
                );
                setSelectedProgram(prog || null);

                const priceFiltered = priceData.filter(
                    (p) => p.program_id === scheduleData.program_id
                );
                setFilteredPrices(priceFiltered);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching schedule:", error);
                alert("Failed to load schedule data.");
            }
        };

        fetchData();
    }, [id]);

    const [prevProgramId, setPrevProgramId] = useState("");

    useEffect(() => {
        if (!formData.program_id) return;

        const prog = programs.find((p) => p.id === Number(formData.program_id));
        setSelectedProgram(prog || null);

        const priceFiltered = prices.filter(
            (p) => p.program_id === Number(formData.program_id)
        );
        setFilteredPrices(priceFiltered);

        if (prevProgramId && prevProgramId !== formData.program_id) {
            setFormData((prev) => ({ ...prev, price_id: "" }));
        }

        setPrevProgramId(formData.program_id);
    }, [formData.program_id, programs, prices]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "start_time") {
            setFormData((prev) => ({
                ...prev,
                start_time: value,
                end_time:
                    prev.end_time && prev.end_time <= value
                        ? ""
                        : prev.end_time,
            }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            for (const key in formData) {
                payload.append(key, formData[key]);
            }
            await updateSchedules(id, payload);
            alert("Schedule updated successfully!");
            navigate("/admin/schedules");
        } catch (error) {
            console.error(error);
            alert("Error updating schedule!");
        }
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
                    <div className="px-8 py-10 border-b border-orange-100">
                        <h2 className="text-4xl font-extrabold text-orange-600">
                            Edit Schedule
                        </h2>
                        <p className="text-orange-500 text-sm mt-1">
                            Update schedule information
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* PROGRAM */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Program
                                </label>
                                <select
                                    name="program_id"
                                    value={formData.program_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl"
                                    required
                                >
                                    <option value="">
                                        -- select program --
                                    </option>
                                    {programs.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* GUIDE */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Guide
                                </label>
                                <select
                                    name="guide_id"
                                    value={formData.guide_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl"
                                    required
                                >
                                    <option value="">-- select guide --</option>
                                    {guides.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PRICE */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Price
                                </label>
                                <select
                                    name="price_id"
                                    value={formData.price_id}
                                    onChange={handleChange}
                                    disabled={
                                        selectedProgram?.payment_type ===
                                        "akhir"
                                    }
                                    required={
                                        selectedProgram?.payment_type === "awal"
                                    }
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl"
                                >
                                    {selectedProgram?.payment_type ===
                                        "akhir" ? (
                                        <option value="">
                                            -- this program has no price --
                                        </option>
                                    ) : (
                                        <>
                                            <option value="">
                                                -- select price --
                                            </option>
                                            {filteredPrices.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    Rp {p.price} -{" "}
                                                    {p.description}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* START TIME */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl"
                                />
                            </div>

                            {/* END TIME */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    name="end_time"
                                    min={formData.start_time || undefined}
                                    disabled={!formData.start_time}
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl"
                                />
                            </div>

                            {/* DATE */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    min={today}
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl"
                                />
                            </div>

                            {/* QUOTA */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Quota
                                </label>
                                <input
                                    type="number"
                                    name="quota"
                                    min="1"
                                    value={formData.quota}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t border-orange-100">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-600 text-white rounded-xl"
                            >
                                Save Schedule
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/admin/schedules")}
                                className="px-6 py-3 border-2 border-gray-300 rounded-xl"
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

export default EditSchedule;
