import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

function Footer() {
    return (
        <footer className="bg-[#C2410C] text-white py-12 mt-20 shadow-inner relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08),_transparent_70%)] pointer-events-none"></div>

            {/* Konten footer */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">

                {/* Logo & Deskripsi */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src="/public/pgg_Images/pgg_ImgID1.png"
                            alt="Logo Palembang Good Guide"
                            className="w-12 h-12 drop-shadow-md rounded-full"
                        />
                        <h2 className="text-2xl font-extrabold tracking-wide text-yellow-200">
                            Palembang Good Guide
                        </h2>
                    </div>
                    <p className="text-sm text-gray-100 leading-relaxed">
                        Temukan keindahan Palembang bersama kami. Nikmati tur budaya, kuliner, dan wisata alam dengan panduan terbaik.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 border-b-2 border-yellow-300 inline-block pb-1">
                        Quick Links
                    </h3>
                    <ul className="space-y-2 mt-2 text-gray-100">
                        {[
                            { name: "Home", to: "/" },
                            { name: "Tour Programs", to: "/programs" },
                            { name: "Guides", to: "/guides" },
                            { name: "Contact Us", to: "/contacts" },
                            { name: "About Us", to: "/abouts" },
                            { name: "Feedback", to: "/feedback" },
                            { name: "Faqs", to: "/faqs" },
                        ].map((link) => (
                            <li key={link.to}>
                                <Link
                                    to={link.to}
                                    className="hover:text-yellow-300 transition-all duration-200 hover:translate-x-1 inline-block"
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 border-b-2 border-yellow-300 inline-block pb-1">
                        Contact
                    </h3>
                    <ul className="text-gray-100 text-sm space-y-2 leading-relaxed">
                        <li>📞 +62 8838 3385 6184</li>
                        <li>✉ palembanggoodguide@gmail.com</li>
                    </ul>

                    <div className="flex gap-5 mt-5">
                        <a
                            href="https://www.instagram.com/plggoodguide"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-110"
                        >
                            <FaInstagram className="w-7 h-7" />
                        </a>
                        <a
                            href="https://wa.me/62883833856184"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-110"
                        >
                            <FaWhatsapp className="w-7 h-7" />
                        </a>
                    </div>
                </div>

            </div>

            {/* Copyright */}
            <div className="mt-12 border-t border-yellow-400 pt-5 text-center text-sm text-gray-200 relative z-10">
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold text-white">Palembang Good Guide</span>.
                All Rights Reserved.
            </div>
        </footer>
    );
}

export default Footer;
