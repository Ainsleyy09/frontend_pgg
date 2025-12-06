import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getRoutes, deleteRoutes } from '../../../_services/routes';
import { getPrograms } from '../../../_services/programs';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function ResetMap({ coords }) {
    const map = useMap();

    useEffect(() => {
        if (!coords || coords.length === 0) return;
        const first = coords[0];
        const center = Array.isArray(first) ? first : [first.lat, first.lng];
        const t = setTimeout(() => {
            map.setView(center, 13);
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(t);
    }, [coords, map]);

    return null;
}

export default function AdminRoutes() {
    const [routes, setRoutes] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoute, setSelectedRoute] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const routesData = await getRoutes();
                const programsData = await getPrograms();

                const parsedRoutes = routesData.map(r => ({
                    ...r,
                    route_coordinates: (() => {
                        try {
                            const arr = typeof r.route_coordinates === "string"
                                ? JSON.parse(r.route_coordinates)
                                : r.route_coordinates;
                            return arr.map(p => ({ lat: Number(p.lat), lng: Number(p.lng), label: p.label ?? "" }));
                        } catch (e) {
                            console.error("Invalid coordinates JSON:", r.route_coordinates);
                            return [];
                        }
                    })()
                }));
                const sortedRoutes = parsedRoutes.sort((a, b) => b.id - a.id);
                setRoutes(parsedRoutes);
                setPrograms(programsData);

            } catch (error) {
                console.error("Error fetching routes or programs:", error);
            }
        };
        fetchData();
    }, []);

    const getProgramName = (id) => programs.find(p => p.id === id)?.name || "Unknown Program";

    const toggleDropdown = (id) => setOpenDropdownId(openDropdownId === id ? null : id);

    const handleAddRoutes = () => navigate("/admin/routes/create");
    const handleEdit = (id) => navigate("/admin/routes/edit/" + id);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this route?")) {
            await deleteRoutes(id);
            setRoutes(routes.filter(r => r.id !== id));
        }
    };

    const filteredRoutes = routes.filter(r => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;

        const programName = programs.find(p => p.id === r.program_id)?.name?.toLowerCase() || "";

        if (q.includes(":")) {
            const [fieldRaw, valueRaw] = q.split(":");
            const field = fieldRaw.trim();
            const v = valueRaw ? valueRaw.trim() : "";
            switch (field) {
                case "program": return programName.includes(v);
                case "start": return r.start_point.toLowerCase().includes(v);
                case "end": return r.end_point.toLowerCase().includes(v);
                case "id": return String(r.id).includes(v);
                case "coord":
                case "coordinate":
                    return r.route_coordinates.some(pos => pos.lat.toString().includes(v) || pos.lng.toString().includes(v));
                default: return true;
            }
        }

        return (
            programName.includes(q) ||
            r.start_point.toLowerCase().includes(q) ||
            r.end_point.toLowerCase().includes(q) ||
            String(r.id).includes(q) ||
            r.route_coordinates.some(pos =>
                pos.lat.toString().includes(q) ||
                pos.lng.toString().includes(q) ||
                (pos.label && pos.label.toLowerCase().includes(q))
            )
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
    const currentData = filteredRoutes.slice(
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

                {/* Search & Add */}
                <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
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
                                    placeholder="Search Tour Route..."
                                />
                            </div>
                        </form>
                    </div>

                    <div className="w-full md:w-auto flex items-center justify-end">
                        <button
                            type="button"
                            onClick={handleAddRoutes}
                            className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm px-4 py-2"
                        >
                            Add New Route
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-white bg-orange-500 uppercase">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Program</th>
                                <th className="px-4 py-3">Start Point</th>
                                <th className="px-4 py-3">End Point</th>
                                <th className="px-4 py-3">Route Coordinates</th>
                                <th className="px-4 py-3">View Map</th>
                                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? currentData.map((r, i) => (
                                <tr key={r.id} className="border-b hover:bg-orange-50 transition-colors align-top">
                                    <td className="px-4 py-3 align-top">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                    <td className="px-4 py-3 align-top">{getProgramName(r.program_id)}</td>
                                    <td className="px-4 py-3 align-top">{r.start_point}</td>
                                    <td className="px-4 py-3 align-top">{r.end_point}</td>
                                    <td className="px-4 py-3 align-top">
                                        {r.route_coordinates.map((pos, idx) => (
                                            <div key={idx} className="mb-1">
                                                <span className="font-semibold">{pos.label?.trim() || `Point ${idx + 1}`}</span>
                                                <div className="text-xs text-gray-500">[{pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}]</div>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <button onClick={() => setSelectedRoute(r)} className="text-orange-500 hover:text-orange-600" title="View Map">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 relative align-top">
                                        <button onClick={() => toggleDropdown(r.id)} className="inline-flex items-center p-1 text-sm text-gray-500 hover:text-orange-500 rounded-lg">...</button>
                                        {openDropdownId === r.id && (
                                            <div className="absolute right-0 mt-2 z-10 w-44 bg-white rounded shadow divide-y divide-gray-200">
                                                <ul className="py-1 text-sm text-gray-700">
                                                    <li>
                                                        <button onClick={() => handleEdit(r.id)} className="block py-2 px-4 hover:bg-orange-100 w-full text-left">Edit</button>
                                                    </li>
                                                </ul>
                                                <div className="py-1">
                                                    <button onClick={() => handleDelete(r.id)} className="block py-2 px-4 hover:bg-orange-100 w-full text-left text-red-600">Delete</button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center p-4">Data not found!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center gap-4 py-4 px-6 border-t border-gray-200">
                    <span className="text-gray-600 text-sm">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRoutes.length)} of {filteredRoutes.length} routes
                    </span>

                    <div className="flex items-center gap-2">
                        <button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="border rounded px-3 py-1 text-sm w-20 disabled:opacity-40 hover:bg-orange-50 transition">Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => changePage(i + 1)} className={`border rounded px-3 py-1 text-sm w-10 ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'hover:bg-orange-50'}`}>{i + 1}</button>
                        ))}
                        <button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="border rounded px-3 py-1 text-sm w-20 disabled:opacity-40 hover:bg-orange-50 transition">Next</button>
                    </div>
                </div>

                {/* Map Modal */}
                {selectedRoute && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded-lg w-11/12 md:w-3/4 lg:w-2/3 h-4/5 relative">
                            <button className="absolute top-3 right-3 z-[9999] bg-white shadow-md hover:bg-gray-100 text-gray-700 rounded-full p-2 transition" onClick={() => setSelectedRoute(null)} title="Close">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <MapContainer
                                key={selectedRoute.id}
                                center={selectedRoute.route_coordinates[0] ? [selectedRoute.route_coordinates[0].lat, selectedRoute.route_coordinates[0].lng] : [0, 0]}
                                zoom={13}
                                style={{ width: "100%", height: "calc(100% - 40px)" }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Polyline positions={selectedRoute.route_coordinates.map(p => [p.lat, p.lng])} pathOptions={{ color: "orange", weight: 4 }} />
                                <ResetMap coords={selectedRoute.route_coordinates} />
                                {selectedRoute.route_coordinates.map((pos, idx) => (
                                    <Marker key={idx} position={[pos.lat, pos.lng]}>
                                        <Popup>
                                            <div className="text-sm font-semibold">{pos.label?.trim() || `Point ${idx + 1}`}</div>
                                            <div className="text-xs text-gray-500">[{pos.lat.toFixed(6)}, {pos.lng.toFixed(6)}]</div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
