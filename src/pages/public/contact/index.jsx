import React from "react";
import { FaEnvelope, FaInstagram, FaWhatsapp, FaLink } from "react-icons/fa";

function Contacts() {
    return (
        <section className="bg-white py-20">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Kontak Kami</h1>
                <p className="text-lg text-gray-600">Silahkan hubungi kami melalui platform-platform berikut untuk informasi lebih lanjut!.</p>

                <div className="relative flex justify-center mt-12 mb-6">
                    <div className="absolute -left-10 top-4 w-8 h-8 bg-orange-300 rounded-full"></div>
                    <div className="absolute left-1/3 -top-6 w-4 h-4 bg-orange-200 rounded-full"></div>
                    <div className="absolute right-10 -bottom-4 w-6 h-6 bg-orange-400 rounded-full"></div>
                    <div className="absolute right-1/3 top-6 w-3 h-3 bg-orange-200 rounded-full"></div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-10 mt-10">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center space-x-4 mb-4">
                        <FaEnvelope size={40} className="text-orange-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Email</h3>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm">Hubungi kami via email.</p>

                    <a href="mailto:palembanggoodguide@gmail.com" className="inline-block px-5 py-2 border border-orange-500 text-orange-500 font-medium rounded-xl hover:bg-orange-500 hover:text-white transition">
                        kirim Email
                    </a>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center space-x-4 mb-4">
                        <FaInstagram size={40} className="text-orange-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Instagram</h3>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm">Follow dan ikuti perkembangan kami via Instagram!.</p>

                    <a
                        href="https://www.instagram.com/plggoodguide/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 border border-orange-500 text-orange-500 font-medium rounded-xl hover:bg-orange-500 hover:text-white transition"
                    >
                        Cek IG
                    </a>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center space-x-4 mb-4">
                        <FaWhatsapp size={40} className="text-orange-500" />
                        <h3 className="text-xl font-semibold text-gray-900">WhatsApp</h3>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm">Hubungi kami via email untuk pertanyaan lebih lanjut.</p>

                    <a href="https://wa.me/62883833856184" target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 border border-orange-500 text-orange-500 font-medium rounded-xl hover:bg-orange-500 hover:text-white transition">
                        Chat Sekarang!
                    </a>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition md:col-span-3 md:w-1/3 mx-auto">
                    <div className="flex items-center space-x-4 mb-4">
                        <FaLink size={40} className="text-orange-500" />
                        <h3 className="text-xl font-semibold text-gray-900">Linktree</h3>
                    </div>

                    <p className="text-gray-600 mb-6 text-sm">Cek Linktree kami!.</p>

                    <a
                        href="https://linktr.ee/palembanggoodguide"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-5 py-2 border border-orange-500 text-orange-500 font-medium rounded-xl hover:bg-orange-500 hover:text-white transition"
                    >
                        Open Linktree
                    </a>
                </div>
            </div>
        </section>
    );
}

export default Contacts;
