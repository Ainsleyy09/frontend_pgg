import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const images = [
    "/images/IMG_20250112_111540.jpg",
    "/images/IMG_20250125_093314.jpg",
    "/images/IMG_20250125_094318_2.jpg",
    "/images/IMG_20250125_121448_1.jpg",
    "/images/IMG_20250127_093053.jpg",
];

export default function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative w-screen min-h-screen overflow-hidden">
                {/* Background Layer */}
                <div className="absolute inset-0 bg-neutral-400">
                    {images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`Slide ${idx + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentIndex ? "opacity-100" : "opacity-0"
                                }`}
                        />
                    ))}
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Konten utama */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center text-white min-h-screen px-6 md:px-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
                        Palembang Good Guide
                    </h1>
                    <p className="mt-4 text-lg md:text-xl max-w-2xl">
                        Walking tour untuk mengenal keindahan, kuliner, dan budaya khas kota
                        Palembang secara menyenangkan dan informatif.
                    </p>
                    <Link
                        to="abouts"
                        className="mt-8 inline-block bg-white text-orange-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition"
                    >
                        Tentang Kami
                    </Link>
                </div>

                <button
                    onClick={prevSlide}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition"
                    aria-label="Previous Slide"
                >
                    ❮
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition"
                    aria-label="Next Slide"
                >
                    ❯
                </button>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-white scale-110" : "bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            </section>

            <section className="relative py-20 px-6 md:px-16 bg-white overflow-hidden">
                <div className="max-w-4xl mx-auto text-center sm:text-left relative z-10 px-4 sm:px-6 md:px-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                        DISCOVER PALEMBANG YOUR WAY — PAY AS YOU WISH.
                    </h2>
                    <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto sm:mx-0">
                        Rasakan pengalaman menyusuri Kota Palembang dengan berbagai rute
                        menarik yang pastinya menyenangkan bersama kami!
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start items-center">
                        <Link to="/programs" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300">
                            Lihat Program Tour
                        </Link>
                    </div>
                </div>

                <img
                    src="/images/guide-cowok.png"
                    alt="Guides"
                    className="hidden sm:block absolute right-0 bottom-0 max-w-[120px] md:max-w-[180px] lg:max-w-[250px] h-auto pointer-events-none"
                    style={{ transform: "translateY(10%)" }}
                />
            </section>

            <section className="relative py-20 px-6 md:px-16 bg-gray-50 overflow-hidden">
                <img
                    src="/images/guide-cewek.png"
                    alt="Guide Female"
                    className="absolute left-0 bottom-0 max-w-[120px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[340px] h-auto pointer-events-none z-0"
                    style={{ transform: "translateY(10%)" }}
                />

                <div className="max-w-4xl mx-auto relative z-10 px-4 sm:px-6 md:px-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        {/* Spacer untuk gambar di kiri */}
                        <div className="hidden md:block w-[250px]" />

                        {/* Konten Teks */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                                Temui Pemandu Lokal Kami
                            </h2>
                            <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto sm:mx-0">
                                Kenali para pemandu wisata kami yang ramah dan berpengalaman.
                                Mereka siap menemani perjalananmu menjelajahi sudut-sudut
                                menarik Palembang dengan cerita dan wawasan lokal yang autentik.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
                                <Link
                                    to="/guides"
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 text-center"
                                >
                                    Lihat Profil Guide
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
