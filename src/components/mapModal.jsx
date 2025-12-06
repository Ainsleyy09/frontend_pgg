import React from "react";
import { MapContainer, TileLayer, useMapEvents, Marker, Polyline } from "react-leaflet";

function MapModal({ isOpen, onClose, onSelect, coords = [], purpose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 w-full flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-4 shadow-lg">
                <h3 className="mb-2 font-semibold">
                    {purpose === "start"
                        ? "Select Start Point"
                        : purpose === "end"
                            ? "Select End Point"
                            : "Pick Route Coordinates"}
                </h3>

                <MapContainer
                    center={[-2.9909, 104.7566]}
                    zoom={13}
                    style={{ height: "300px", width: "100%" }}
                    className="rounded-lg shadow"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <ClickHandler onSelect={onSelect} />
                    {coords.map((pos, idx) => (
                        <Marker key={idx} position={pos} />
                    ))}
                    {coords.length > 1 && <Polyline positions={coords} />}
                </MapContainer>

                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

function ClickHandler({ onSelect }) {
    useMapEvents({
        click(e) {
            onSelect([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default MapModal;
