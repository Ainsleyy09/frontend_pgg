import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

function Faqs() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "Apa itu Palembang Good Guide?",
            answer:
                "Palembang Good Guide adalah layanan penyedia walking tour yang memperkenalkan budaya, sejarah, dan kuliner khas Palembang bersama pemandu lokal yang ramah dan berpengalaman.",
        },
        {
            question: 'Bagaimana sistem "Pay As You Wish" bekerja?',
            answer:
                "Kamu bisa mengikuti walking tour reguler tanpa biaya tetap. Setelah tour selesai, kamu bebas menentukan sendiri berapa nilai yang ingin kamu berikan sesuai pengalamanmu.",
        },
        {
            question: "Apakah saya harus mendaftar terlebih dahulu?",
            answer:
                'Ya, kami menyarankan untuk mendaftar agar kami bisa menyesuaikan jadwal dan rute sesuai preferensimu. Pendaftaran bisa dilakukan melalui halaman "Rute" atau "Profil".',
        },
        {
            question: "Apakah tour ini cocok untuk wisatawan luar kota?",
            answer:
                "Sangat cocok! Kami menyusun rute yang memperkenalkan sisi autentik Palembang, mulai dari landmark terkenal hingga spot tersembunyi yang hanya diketahui warga lokal.",
        },
        {
            question: "Siapa saja pemandu tur di Palembang Good Guide?",
            answer:
                "Pemandu kami adalah warga lokal yang memiliki pengetahuan mendalam tentang sejarah dan budaya Palembang. Mereka siap berbagi cerita menarik sepanjang perjalanan.",
        },
        {
            question: "Berapa lama durasi setiap tur?",
            answer:
                'Durasi tur bervariasi, biasanya antara 1 hingga 2 jam tergantung rute dan minat peserta. Informasi detail tersedia di halaman "Rute".',
        },
        {
            question: "Apakah tour tersedia setiap hari?",
            answer:
                "Kami menyediakan walking tour setiap hari dengan jadwal fleksibel. Kamu bisa memilih waktu yang tersedia saat mendaftar.",
        },
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="bg-white py-16 px-6 md:px-16">
            <div className="max-w-4xl mx-auto">
                {/* Page Title */}
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 text-center mb-16">
                    FAQS
                </h1>

                {/* FAQ Category */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-teal-600 uppercase tracking-wide mb-8">
                        About Palembang Good Guide
                    </h2>

                    {/* Accordion Items */}
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-300">
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full flex items-center justify-between py-5 text-left hover:text-teal-600 transition-colors duration-300"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
                                        {faq.question}
                                    </h3>
                                    <ChevronDown
                                        size={24}
                                        className={`flex-shrink-0 ml-4 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* Answer */}
                                {openIndex === index && (
                                    <div className="pb-5 text-gray-700 leading-relaxed">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Faqs;
