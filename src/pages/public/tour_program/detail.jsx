import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getPrograms } from "../../../_services/programs";
import { getRoutes } from "../../../_services/routes";
import { getSchedules } from "../../../_services/schedule";
import { getPrices } from "../../../_services/price";
import { getGuides } from "../../../_services/guides";

import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import { programImageStorage } from "../../../_api";
import RegistrationForm from "./RegistrationForm";

const DefaultIcon = L.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function DetailProgram() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [route, setRoute] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [prices, setPrices] = useState([]);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const formRef = useRef(null);
    const mapRef = useRef(null);

    // Ambil userInfo dari localStorage (jika ada)
    const userInfo = (() => {
        try {
            return JSON.parse(localStorage.getItem("userInfo"));
        } catch (e) {
            return null;
        }
    })();

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (showForm) scrollToForm();
    }, [showForm]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    programData,
                    routeData,
                    scheduleData,
                    priceData,
                    guideData,
                ] = await Promise.all([
                    getPrograms(),
                    getRoutes(),
                    getSchedules(),
                    getPrices(),
                    getGuides(),
                ]);

                setPrices(priceData || []);
                setGuides(guideData || []);

                const programDetail = (programData || []).find(
                    (p) => Number(p.id) === Number(id)
                );

                const routeDetail = (routeData || []).find(
                    (r) => Number(r.program_id) === Number(id)
                );

                // parse route coordinates whether stored as string JSON or already as array
                let parsedRoute = [];
                if (routeDetail?.route_coordinates) {
                    if (typeof routeDetail.route_coordinates === "string") {
                        try {
                            parsedRoute = JSON.parse(
                                routeDetail.route_coordinates
                            ).map((p) => ({
                                lat: Number(p.lat),
                                lng: Number(p.lng),
                                label: p.label ?? "",
                            }));
                        } catch (e) {
                            parsedRoute = [];
                        }
                    } else if (Array.isArray(routeDetail.route_coordinates)) {
                        parsedRoute = routeDetail.route_coordinates.map(
                            (p) => ({
                                lat: Number(p.lat),
                                lng: Number(p.lng),
                                label: p.label ?? "",
                            })
                        );
                    }
                }

                const programSchedules = (scheduleData || [])
                    .filter((s) => Number(s.program_id) === Number(id))
                    .map((s) => ({
                        ...s,
                        isRegistered:
                            userInfo?.id && Array.isArray(s.registrations)
                                ? s.registrations.some(
                                    (r) =>
                                        Number(r.user_id) ===
                                        Number(userInfo.id)
                                )
                                : false,
                    }));

                setProgram(programDetail || null);
                setRoute(parsedRoute);
                setSchedules(programSchedules || []);
            } catch (err) {
                console.error("Error fetching detail program:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const getPriceValue = (priceId) => {
        const obj = (prices || []).find(
            (p) => Number(p.id) === Number(priceId)
        );
        return obj ? obj.price : null;
    };

    const getGuideName = (guideId) => {
        const guide = (guides || []).find(
            (g) => Number(g.id) === Number(guideId)
        );
        return guide ? guide.name : "-";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-teal-600">
                Memuat data...
            </div>
        );
    }

    if (!program) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Program tidak ditemukan
            </div>
        );
    }

    const center =
        route && route.length > 0 ? [route[0].lat, route[0].lng] : [0, 0];
    const hasAvailableSchedule = (schedules || []).some(
        (s) => !s.isRegistered && Number(s.quota) > 0
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 py-4 px-4">
            <style>
                {`
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #0d9488;
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #0f766e;
          }
        `}
            </style>

            <div className="max-w-6xl mx-auto space-y-6">
                {/* PROGRAM CARD */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-teal-100">
                    <div className="grid grid-cols-1 lg:grid-cols-5">
                        {/* Left Image */}
                        <div className="lg:col-span-2 h-64 lg:h-auto relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 to-transparent z-10"></div>
                            <img
                                src={
                                    program.program_photo
                                        ? `${programImageStorage}/${program.program_photo}`
                                        : "/placeholder-image.jpg"
                                }
                                className="w-full h-full object-cover"
                                alt={program.name}
                            />
                        </div>

                        {/* Right Info */}
                        <div className="lg:col-span-3 p-6 flex flex-col gap-4 bg-gradient-to-br from-white to-teal-50/40">
                            <div>
                                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    Program Wisata
                                </span>
                                <h1 className="text-3xl font-bold text-teal-800 mt-2">
                                    {program.name}
                                </h1>
                                <p className="text-gray-700 mt-1 leading-relaxed">
                                    {program.description}
                                </p>
                            </div>

                            {/* Info Badges */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border text-sm">
                                    📅 {schedules.length} Jadwal
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border text-sm">
                                    📍 {route?.length || 0} Titik
                                </div>
                            </div>

                            {/* TITIK PERJALANAN */}
                            {route && route.length > 0 && (
                                <div className="bg-white rounded-xl shadow p-5">
                                    <h4 className="text-teal-700 text-sm font-semibold mb-2 flex items-center gap-1">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        Titik Perjalanan
                                    </h4>

                                    <div className="bg-gray-50 rounded-lg p-3 overflow-hidden flex flex-col max-h-64">
                                        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
                                            {route.map((pos, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-white p-2 rounded border border-gray-200"
                                                >
                                                    <div className="font-semibold text-xs text-teal-600 mb-1">
                                                        {pos.label || `Titik ${idx + 1}`}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-mono">
                                                        {pos.lat.toFixed(5)},{" "}
                                                        {pos.lng.toFixed(5)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Button / notifications */}
                                        <div className="mt-3 flex flex-col gap-2">
                                            {userInfo &&
                                                schedules.length === 0 && (
                                                    <p className="text-gray-600 bg-gray-50 border p-2 rounded-lg">
                                                        Belum ada jadwal untuk
                                                        program ini
                                                    </p>
                                                )}

                                            {userInfo &&
                                                !hasAvailableSchedule &&
                                                schedules.length > 0 && (
                                                    <p className="text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
                                                        Semua jadwal sudah penuh
                                                        atau kamu sudah
                                                        mendaftar.
                                                    </p>
                                                )}

                                            {userInfo &&
                                                hasAvailableSchedule && (
                                                    <button
                                                        onClick={() =>
                                                            setShowForm(
                                                                (s) => !s
                                                            )
                                                        }
                                                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow"
                                                    >
                                                        {showForm
                                                            ? "Tutup Form"
                                                            : "Daftar Program"}
                                                    </button>
                                                )}

                                            {!userInfo && (
                                                <button
                                                    onClick={() =>
                                                        navigate("/login")
                                                    }
                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow"
                                                >
                                                    Login untuk mendaftar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MAP */}
                <div className="w-full h-96 rounded-xl overflow-hidden shadow border">
                    {route && route.length > 0 ? (
                        <MapContainer
                            center={center}
                            zoom={14}
                            scrollWheelZoom
                            whenCreated={(map) => (mapRef.current = map)}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Polyline
                                positions={route.map((p) => [p.lat, p.lng])}
                                pathOptions={{ color: "#f97316", weight: 4 }}
                            />
                            {route.map((pos, idx) => (
                                <Marker key={idx} position={[pos.lat, pos.lng]}>
                                    <Popup>
                                        {pos.label || `Titik ${idx + 1}`}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Tidak ada rute
                        </div>
                    )}
                </div>

                {/* SCHEDULE LIST */}
                <div className="bg-white rounded-xl shadow p-5">
                    <h3 className="text-teal-700 font-semibold mb-3">
                        Jadwal Tersedia
                    </h3>

                    {schedules.length > 0 ? (
                        <ul className="space-y-3">
                            {schedules.map((s) => {
                                const formattedDate = new Date(
                                    s.date
                                ).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                });

                                const price = getPriceValue(s.price_id);

                                return (
                                    <li
                                        key={s.id}
                                        className="bg-gray-50 p-4 rounded-lg border"
                                    >
                                        <div className="font-semibold text-teal-700">
                                            {formattedDate}
                                        </div>
                                        <div className="text-gray-500">
                                            {s.start_time} - {s.end_time} WIB
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-4 text-gray-700 text-sm">
                                            <span>{s.quota} peserta</span>
                                            <span className="text-orange-600 font-semibold">
                                                {price !== null &&
                                                    (price === 0
                                                        ? "Gratis"
                                                        : `Rp ${Number(
                                                            price
                                                        ).toLocaleString()}`)}
                                            </span>
                                            <span className="text-teal-600 font-semibold">
                                                {getGuideName(s.guide_id)}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Belum ada jadwal.</p>
                    )}
                </div>

                {/* FORM */}
                {showForm && hasAvailableSchedule && (
                    <div
                        ref={formRef}
                        className="bg-white p-6 rounded-xl shadow border"
                    >
                        <RegistrationForm
                            program={program}
                            schedules={schedules.filter((s) => !s.isRegistered)}
                            userInfo={userInfo}
                            onClose={() => setShowForm(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
