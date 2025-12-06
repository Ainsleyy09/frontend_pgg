import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPrograms } from "../../../_services/programs";
import { createRoutes } from "../../../_services/routes";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapModal from "../../../components/mapModal";

export default function CreateRoutes() {
    const [formData, setFormData] = useState({
        program_id: "",
        start_point: "",
        end_point: "",
        route_coordinates: [],
    });

    const [coords, setCoords] = useState([])
    const [programs, setPrograms] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalPurpose, setModalPurpose] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await getPrograms();
                setPrograms(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPrograms();
    }, []);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            route_coordinates: coords.map((c) => ({
                lat: c.lat,
                lng: c.lng,
                label: c.label || ""
            })),
            start_point: prev.start_point,
            end_point: prev.end_point,
        }));
    }, [coords]);

    const openModal = (purpose) => {
        setModalPurpose(purpose);
        setModalOpen(true);
    };

    const handleSelectOnMap = (pickedCoords) => {
        const [lat, lng] = pickedCoords.map((v) => Number(v.toFixed(6)));

        setCoords((prev) => {
            const next = [...prev];
            if (modalPurpose === "start") {
                if (next.length === 0) return [{ lat, lng, label: formData.start_point || "" }];
                next[0] = { ...next[0], lat, lng, label: formData.start_point || "" };
            } else if (modalPurpose === "end") {
                if (next.length === 0) return [{ lat, lng, label: formData.end_point || "" }];
                else if (next.length === 1) return [...next, { lat, lng, label: formData.end_point || "" }];
                next[next.length - 1] = { ...next[next.length - 1], lat, lng, label: formData.end_point || "" };
            } else if (modalPurpose === "route") {
                next.splice(next.length - 1, 0, { lat, lng, label: `Point ${next.length + 1}` });
            }
            return next;
        });

        setModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRoutes(formData);
            alert("Route successfully created!");
            navigate("/admin/routes");
        } catch (err) {
            console.error(err.response?.data || err);
            alert("Route failed created!");
        }
    };

    const handleDeletePoint = (index) => {
        setCoords((prev) => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">

                    {/* HEADER */}
                    <div className="px-8 py-10 bg-white border-b border-orange-100">
                        <h2 className="text-4xl font-extrabold text-orange-600 drop-shadow-sm">Create New Route</h2>
                        <p className="text-orange-500 text-sm mt-1">
                            Isi semua informasi untuk menambah rute perjalanan
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* PROGRAM */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-1 block">
                                Program
                            </label>
                            <select
                                name="program_id"
                                value={formData.program_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                    bg-white text-black placeholder-gray-500
                    focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                            >
                                <option value="" disabled>
                                    Pilih program
                                </option>
                                {programs.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* START POINT */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-1 block">
                                Start Point
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    name="start_point"
                                    value={formData.start_point}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-xl
                      bg-white placeholder-gray-500 focus:ring-orange-200 transition"
                                />

                                <button
                                    type="button"
                                    onClick={() => openModal("start")}
                                    className="px-5 py-3 bg-orange-600 text-white rounded-xl shadow hover:bg-orange-700 transition"
                                >
                                    Select
                                </button>
                            </div>
                        </div>

                        {/* END POINT */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-1 block">
                                End Point
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    name="end_point"
                                    value={formData.end_point}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-3 border-2 border-orange-200 rounded-xl
                      bg-white placeholder-gray-500 focus:ring-orange-200 transition"
                                />

                                <button
                                    type="button"
                                    onClick={() => openModal("end")}
                                    className="px-5 py-3 bg-orange-600 text-white rounded-xl shadow hover:bg-orange-700 transition"
                                >
                                    Select
                                </button>
                            </div>
                        </div>

                        {/* MAP PREVIEW */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-2 block">
                                Route Preview
                            </label>

                            <div className="rounded-xl overflow-hidden border-2 border-orange-200 shadow">
                                <MapContainer
                                    center={coords[0] ? [coords[0].lat, coords[0].lng] : [-2.9909, 104.7566]}
                                    zoom={13}
                                    style={{ height: "260px", width: "100%" }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {coords.map((pos, i) => (
                                        <Marker key={i} position={[pos.lat, pos.lng]} >
                                            {/* Bisa tambahkan popup label */}
                                        </Marker>
                                    ))}
                                    {coords.length > 1 && <Polyline positions={coords.map(c => [c.lat, c.lng])} />}
                                </MapContainer>
                            </div>

                            <button
                                type="button"
                                onClick={() => openModal("route")}
                                className="mt-3 px-5 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
                            >
                                Add Route Point
                            </button>
                        </div>

                        {/* COORD LIST */}
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                            {coords.map((pos, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center p-3 bg-white rounded-lg shadow border border-orange-100"
                                >
                                    <div className="flex-1">
                                        {/* Input label */}
                                        <input
                                            type="text"
                                            value={pos.label || `Point ${idx + 1}`}
                                            onChange={(e) => {
                                                const label = e.target.value;
                                                setCoords((prev) => {
                                                    const next = [...prev];
                                                    next[idx] = { ...next[idx], label };
                                                    return next;
                                                });
                                            }}
                                            className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg"
                                        />
                                        <span className="text-gray-500 text-sm">
                                            {pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDeletePoint(idx)}
                                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 ml-3"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-4 pt-6 border-t border-orange-100">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl shadow hover:bg-orange-700 transition"
                            >
                                Save Route
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/routes")}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <MapModal
                isOpen={modalOpen}
                purpose={modalPurpose}
                coords={coords}
                onClose={() => setModalOpen(false)}
                onSelect={handleSelectOnMap}
            />
        </section>
    );
}
