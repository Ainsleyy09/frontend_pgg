import React, { useEffect, useState } from "react";
import { getGuides } from "../../../_services/guides";
import { guideImageStorage } from "../../../_api";

function Guides() {
    const [guides, setGuides] = useState([]);
    const [flipped, setFlipped] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getGuides();
                setGuides(data);
                setFlipped(Array(data.length).fill(false));
            } catch (error) {
                console.error("Error fetching guides:", error);
            }
        };
        fetchData();
    }, []);

    const toggleFlip = (index) => {
        setFlipped((prev) => prev.map((v, i) => (i === index ? !v : v)));
    };

    const flipCardStyles = `
        .flip-card {
            perspective: 1000px;
            width: 100%;
            height: 500px;
        }
        .flip-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s ease-in-out;
            transform-style: preserve-3d;
        }
        .flip-card-front, .flip-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 0.75rem;
            background: white;
        }
        .flip-card-back {
            transform: rotateY(180deg);
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .font-bebas {
            font-family: "Bebas Neue", sans-serif;
        }
    `;

    return (
        <section className="bg-gray-50 py-12 dark:bg-gray-900">
            <style>{flipCardStyles}</style>

            <div className="mx-auto max-w-screen-xl px-6">
                <h2 className="text-4xl font-bold text-orange-700 text-center mb-8">
                    Profile Para Tour Guides
                </h2>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {guides.map((g, i) => (
                        <div key={i} className="flip-card">
                            <div
                                className="flip-card-inner"
                                style={{
                                    transform: flipped[i]
                                        ? "rotateY(180deg)"
                                        : "rotateY(0deg)",
                                }}
                            >
                                {/* FRONT */}
                                <div className="flip-card-front flex flex-col justify-between">
                                    {/* FOTO CENTER TANPA ZOOM */}
                                    <div className="h-85 flex justify-center items-center rounded-t-xl bg-white overflow-hidden">
                                        <img
                                            className="max-h-80 w-auto object-contain mt-6"
                                            src={
                                                g.photo?.startsWith("http")
                                                    ? g.photo
                                                    : `${guideImageStorage}/${g.photo}`
                                            }
                                            alt={g.name}
                                        />
                                    </div>

                                    {/* Teks rata tengah */}
                                    <div className="p-5 text-center">
                                        <h3 className="text-xl font-semibold text-orange-700 mb-1">
                                            {g.name}
                                        </h3>
                                        <h3 className="text-sm font-medium text-gray-700 mb-4">
                                            {g.role}
                                        </h3>

                                        <button
                                            onClick={() => toggleFlip(i)}
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm"
                                        >
                                            Yuk Kepoin!
                                        </button>
                                    </div>
                                </div>

                                {/* BACK */}
                                <div className="flip-card-back font-bebas">
                                    <h3 className="text-xl font-semibold text-orange-700 mb-3">
                                        {g.name}
                                    </h3>

                                    <p className="text-gray-700 text-sm mb-6 max-w-xs">
                                        {g.bio}
                                    </p>

                                    <hr className="w-full my-4 border-t border-gray-300" />

                                    <p className="text-sm text-gray-700 w-full text-left">
                                        <span className="font-semibold">
                                            Email:
                                        </span>{" "}
                                        {g.email}
                                    </p>

                                    <p className="text-sm text-gray-700 w-full text-left mt-1">
                                        <span className="font-semibold">
                                            Instagram:
                                        </span>{" "}
                                        {g.instagram}
                                        <br />
                                        <br />
                                        <br />
                                    </p>

                                    <button
                                        onClick={() => toggleFlip(i)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full text-sm"
                                    >
                                        Kembali
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Guides;
