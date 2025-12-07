import React, { useEffect, useRef, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getPrograms } from "../../../_services/programs";
import { getRoutes } from "../../../_services/routes";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import { programImageStorage } from "../../../_api";
import { Link, useSearchParams } from "react-router-dom";

// Default Icon
const DefaultIcon = L.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function TourPrograms() {
    const [programs, setPrograms] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [flipped, setFlipped] = useState([]);
    const mapRefs = useRef({});
    const [searchParams] = useSearchParams();
    const selectedType = searchParams.get("type");

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const basePrograms = await getPrograms();
                const baseRoutes = await getRoutes();

                const parsedRoutes = baseRoutes.map((r) => ({
                    ...r,
                    route_coordinates:
                        typeof r.route_coordinates === "string"
                            ? JSON.parse(r.route_coordinates).map((pt) => ({
                                lat: Number(pt.lat),
                                lng: Number(pt.lng),
                                label: pt.label ?? "",
                            }))
                            : r.route_coordinates.map((pt) => ({
                                lat: Number(pt.lat),
                                lng: Number(pt.lng),
                                label: pt.label ?? "",
                            })),
                }));

                // === Dummy Private ===
                const privateDummy = [
                    {
                        id: "dummy-private-1",
                        program_type: "private",
                        name: "Private Tour Palembang",
                        description:
                            "Tur pribadi untuk Anda dan keluarga. Menjelajahi tempat ikonik Palembang dengan pemandu khusus dan fleksibilitas waktu sepenuhnya.",
                        program_photo: "/pgg_Images/private.jpg",
                        extra_photos: [
                            "/pgg_Images/private1.png",
                            "/pgg_Images/private2.png",
                            "/pgg_Images/private3.png",
                            "/pgg_Images/private4.png",
                        ],
                    },
                ];

                const fullPrograms = [...basePrograms, ...privateDummy];

                setPrograms(fullPrograms);
                setRoutes(parsedRoutes);
                setFlipped(Array(fullPrograms.length).fill(false));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getRouteByProgram = (id) =>
        routes.find((r) => r.program_id === id);

    const toggleFlip = (i, programId) => {
        setFlipped((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

        setTimeout(() => {
            const map = mapRefs.current[programId];
            if (map) map.invalidateSize();
        }, 450);
    };

    // Group Programs by Type
    const grouped = programs.reduce((acc, p) => {
        if (!acc[p.program_type]) acc[p.program_type] = [];
        acc[p.program_type].push(p);
        return acc;
    }, {});

    // --- Flip Card Styles ---
    const flipCardStyles = `
        .flip-card {
            perspective: 1000px;
            width: 100%;
            height: 280px;
        }
        .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.7s ease-in-out;
            transform-style: preserve-3d;
        }
        .flip-card-front, .flip-card-back {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            background: white;
            border-radius: 12px;
        }
        .flip-card-back {
            transform: rotateY(180deg);
        }
    `;

    if (loading) return <p className="p-4">Memuat data...</p>;

    // === PHOTO CAROUSEL COMPONENT ===
    function PhotoCarousel({ photos }) {
        const [index, setIndex] = useState(0);

        const next = () => setIndex((prev) => (prev + 1) % photos.length);
        const prev = () =>
            setIndex((prev) => (prev - 1 + photos.length) % photos.length);

        useEffect(() => {
            const interval = setInterval(next, 4000);
            return () => clearInterval(interval);
        }, [photos.length]);

        return (
            <div className="w-full h-full relative overflow-hidden rounded-xl border border-gray-200 shadow-md">
                <div
                    className="flex w-full h-full"
                    style={{
                        width: `${photos.length * 100}%`,
                        transform: `translateX(-${index * (100 / photos.length)}%)`,
                        transition: "transform 0.7s ease-in-out",
                    }}
                >
                    {photos.map((src, i) => (
                        <img
                            key={i}
                            src={src}
                            alt="Private tour"
                            className="w-full h-full object-cover"
                            style={{ width: `${100 / photos.length}%` }}
                        />
                    ))}
                </div>

                <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
                >
                    ‹
                </button>

                <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
                >
                    ›
                </button>
            </div>
        );
    }

    // === MAIN RETURN ===
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <style>{flipCardStyles}</style>

            {Object.entries(grouped)
                .filter(([type]) => !selectedType || type === selectedType)
                .map(([type, list]) => (
                    <div key={type} className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 capitalize">
                            {type}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {list.map((p, index) => {
                                const route = getRouteByProgram(p.id);

                                const imageSrc =
                                p.program_type === "private"
                                    ? p.program_photo 
                                    : `${programImageStorage}/${p.program_photo}`;

                                // === PRIVATE PROGRAM ===
                                if (p.program_type === "private") {
                                    return (
                                        <div
                                            key={p.id}
                                            className="col-span-1 lg:col-span-2"
                                        >
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                                                {/* LEFT */}
                                                <div className="flex flex-col">
                                                    <div className="border border-gray-200 shadow-xl rounded-xl overflow-hidden flex flex-col">
                                                        <div className="relative w-full h-64 overflow-hidden">
                                                            <img
                                                                src={imageSrc}
                                                                alt={p.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="p-5 flex flex-col gap-3">
                                                            <h3 className="text-2xl font-bold text-teal-700">
                                                                {p.name}
                                                            </h3>

                                                            <p className="text-gray-700 text-sm text-justify leading-relaxed">
                                                                {p.description}
                                                            </p>

                                                            <a
                                                                href={`https://wa.me/62883833856184?text=Halo,%20saya%20ingin%20info%20${encodeURIComponent(
                                                                    p.name
                                                                )}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium text-center text-sm"
                                                            >
                                                                Hubungi WA
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* RIGHT */}
                                                <div className="flex items-center justify-center">
                                                    <div
                                                        className="w-full max-w-md mx-auto rounded-xl shadow-xl overflow-hidden border border-gray-200"
                                                        style={{ aspectRatio: "3 / 4" }}
                                                    >
                                                        {p.extra_photos ? (
                                                            <PhotoCarousel photos={p.extra_photos} />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                                Tidak ada foto tambahan
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // === PUBLIC PROGRAM (FLIP CARD) ===
                                return (
                                    <div key={p.id} className="flip-card border border-gray-200">
                                        <div
                                            className="flip-card-inner shadow-lg"
                                            style={{
                                                transform: flipped[index]
                                                    ? "rotateY(180deg)"
                                                    : "rotateY(0deg)",
                                            }}
                                        >
                                            {/* FRONT */}
                                            <div className="flip-card-front overflow-hidden">
                                                <div className="flex h-full">
                                                    <div className="w-[45%] h-full overflow-hidden">
                                                        <img
                                                            src={imageSrc}
                                                            alt={p.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-teal-700 mb-2">
                                                                {p.name}
                                                            </h3>

                                                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                                                                {p.description}
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() => toggleFlip(index, p.id)}
                                                            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-md text-sm"
                                                        >
                                                            Lihat Rute
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BACK */}
                                            <div className="flip-card-back overflow-y-auto">
                                                <div className="flex h-full">
                                                    {/* MAP */}
                                                    <div className="w-[45%] h-full overflow-hidden">
                                                        {route ? (
                                                            <MapContainer
                                                                center={[
                                                                    route.route_coordinates[0].lat,
                                                                    route.route_coordinates[0].lng,
                                                                ]}
                                                                zoom={14}
                                                                scrollWheelZoom
                                                                whenCreated={(map) => {
                                                                    mapRefs.current[p.id] = map;
                                                                    setTimeout(() => {
                                                                        map.invalidateSize();
                                                                    }, 100);
                                                                }}
                                                                style={{ width: "100%", height: "100%" }}
                                                            >
                                                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                                                <Polyline
                                                                    positions={route.route_coordinates.map(
                                                                        (pt) => [pt.lat, pt.lng]
                                                                    )}
                                                                    pathOptions={{
                                                                        color: "#f97316",
                                                                        weight: 4,
                                                                    }}
                                                                />

                                                                {route.route_coordinates.map((pt, idx) => (
                                                                    <Marker key={idx} position={[pt.lat, pt.lng]}>
                                                                        <Popup>
                                                                            {pt.label || `Titik ${idx + 1}`}
                                                                        </Popup>
                                                                    </Marker>
                                                                ))}
                                                            </MapContainer>
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                                                                Tidak ada rute
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* TEXT */}
                                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-teal-700 mb-2">
                                                                {p.name}
                                                            </h3>

                                                            <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                                                {p.description}
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-2 mt-7">
                                                            <Link
                                                                to={`/programs/detail/${p.id}`}
                                                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm text-center"
                                                            >
                                                                Show Detail
                                                            </Link>

                                                            <button
                                                                onClick={() => toggleFlip(index, p.id)}
                                                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm"
                                                            >
                                                                Kembali
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
        </div>
    );
}

export default TourPrograms;
