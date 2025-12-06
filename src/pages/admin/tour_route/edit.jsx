import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPrograms } from "../../../_services/programs";
import { showRoutes, updateRoutes } from "../../../_services/routes";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MapModal from "../../../components/mapModal";

export default function EditRoutes() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        program_id: "",
        start_point: "",
        end_point: "",
        route_coordinates: [],
    });

    const [coords, setCoords] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalPurpose, setModalPurpose] = useState("");

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await getPrograms();
                setPrograms(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchPrograms();
    }, []);

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const data = await showRoutes(id);

                const routeData = typeof data.route_coordinates === "string"
                    ? JSON.parse(data.route_coordinates)
                    : data.route_coordinates;

                setFormData({
                    program_id: data.program_id,
                    start_point: data.start_point,
                    end_point: data.end_point,
                    route_coordinates: routeData,
                });

                setCoords(routeData.map((c) => ({ lat: Number(c.lat), lng: Number(c.lng), label: c.label || "" })));
            } catch (error) {
                console.error(error);
            }
        };
        fetchRoute();
    }, [id]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            route_coordinates: coords.map(c => ({ lat: c.lat, lng: c.lng, label: c.label })),
        }));
    }, [coords]);

    const openModal = (purpose) => {
        setModalPurpose(purpose);
        setModalOpen(true);
    };

    const handleSelectOnMap = (pickedCoords) => {
        const [lat, lng] = pickedCoords.map((v) => Number(v.toFixed(4)));
        setCoords((prev) => {
            const next = [...prev];
            if (modalPurpose === "start") next[0] = { lat, lng, label: formData.start_point || "" };
            else if (modalPurpose === "end") next[next.length - 1] = { lat, lng, label: formData.end_point || "" };
            else if (modalPurpose === "route") next.splice(next.length - 1, 0, { lat, lng, label: `Point ${next.length + 1}` });
            return next;
        });
        setModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDeletePoint = (index) => {
        setCoords((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateRoutes(id, { ...formData });
            alert("Route updated successfully!");
            navigate("/admin/routes");
        } catch (error) {
            console.error(error.response?.data || error);
            alert("Failed to update route!");
        }
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-orange-100">
                        <h2 className="text-3xl font-bold text-orange-600">Edit Route</h2>
                        <p className="text-orange-500 mt-1">Perbarui informasi rute</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Program Selector */}
                        <div>
                            <label className="block mb-2 font-medium">Program</label>
                            <select
                                name="program_id"
                                value={formData.program_id}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                            >
                                <option value="" disabled>Select a program</option>
                                {programs.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Start Point */}
                        <div>
                            <label className="block mb-1 font-medium">Start Point</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="start_point"
                                    value={formData.start_point}
                                    onChange={handleChange}
                                    placeholder="Ketik nama lokasi"
                                    className="flex-1 p-3 border-2 border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-200"
                                />
                                <button type="button" onClick={() => openModal("start")} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                                    Select on Map
                                </button>
                            </div>
                        </div>

                        {/* End Point */}
                        <div>
                            <label className="block mb-1 font-medium">End Point</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="end_point"
                                    value={formData.end_point}
                                    onChange={handleChange}
                                    placeholder="Ketik nama lokasi"
                                    className="flex-1 p-3 border-2 border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-200"
                                />
                                <button type="button" onClick={() => openModal("end")} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                                    Select on Map
                                </button>
                            </div>
                        </div>

                        {/* Route Preview */}
                        <div>
                            <label className="block mb-2 font-medium">Route Preview</label>
                            {coords.length > 0 && (
                                <MapContainer center={coords[0]} zoom={13} style={{ height: "240px", width: "100%" }} className="rounded-xl shadow">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {coords.map((pos, idx) => <Marker key={idx} position={pos} />)}
                                    {coords.length > 1 && <Polyline positions={coords} />}
                                </MapContainer>
                            )}
                            <button type="button" onClick={() => openModal("route")} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                                Add Route Point
                            </button>
                        </div>

                        {/* Coordinates Preview */}
                        <div className="border p-3 rounded-xl bg-orange-50">
                            <h3 className="font-medium mb-2">Route Coordinates Preview</h3>
                            <ul className="space-y-1 max-h-48 overflow-y-auto">
                                {coords.map((pos, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
                                        <input
                                            type="text"
                                            value={pos.label || `Point ${idx + 1}`}
                                            onChange={(e) => {
                                                const label = e.target.value;
                                                setCoords(prev => {
                                                    const next = [...prev];
                                                    next[idx] = { ...next[idx], label };
                                                    return next;
                                                });
                                            }}
                                            className="flex-1 p-2 border rounded-xl"
                                        />
                                        <span className="ml-2 text-gray-500">{pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}</span>
                                        <button type="button" onClick={() => handleDeletePoint(idx)} className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-xl hover:bg-red-600">
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition">
                            Update Route
                        </button>
                    </form>
                </div>

                <MapModal
                    isOpen={modalOpen}
                    purpose={modalPurpose}
                    coords={coords}
                    onClose={() => setModalOpen(false)}
                    onSelect={(coords) => handleSelectOnMap(coords)}
                />
            </div>
        </section>
    );
}
