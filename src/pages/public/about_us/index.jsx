import React from "react";
import { Link } from "react-router-dom";

export default function AboutUs() {
    return (
        <section className="bg-white py-16 px-6 md:px-16">
            <div className="max-w-4xl mx-auto">
                {/* Header Image */}
                <div className="mb-12">
                    {/* Teks di atas gambar */}
                    <div className="text-center mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Bung Zaim
                        </h2>
                    </div>

                    {/* Gambar portrait */}
                    <div className="flex justify-center bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg overflow-hidden py-6 px-4">
                        <img
                            src="/images/bung-zaim.png"
                            alt="Bung Zaim"
                            className="h-[400px] sm:h-[450px] md:h-[500px] w-auto object-cover rounded-lg shadow-lg"
                        />
                    </div>
                </div>

                {/* Origin Story Title */}
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                    Our Story
                </h2>

                {/* Story Content */}
                <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                    <p>
                        Palembang Good Guide didirikan oleh Kholid Zaim, yang akrab disapa
                        Bung Zaim — seorang pemandu wisata berpengalaman dari Jakarta Good
                        Guide dan alumni Pendidikan Sejarah Universitas Negeri Jakarta
                        (UNJ). Kecintaannya pada sejarah, budaya, dan interaksi dengan
                        banyak orang menjadi fondasi dari perjalanan yang ia mulai.
                    </p>

                    <p>
                        Saat pandemi COVID-19 melanda, Bung Zaim memutuskan untuk kembali ke
                        kampung halamannya, Palembang — kota tertua di Indonesia yang kaya
                        akan nilai sejarah dan peninggalan budaya. Di sanalah ia menyadari
                        bahwa setiap sudut Palembang menyimpan kisah dan bangunan bersejarah
                        yang menunggu untuk diceritakan kembali.
                    </p>

                    <p>
                        Berangkat dari semangat itu, pada Februari 2021, Bung Zaim
                        mendirikan Palembang Good Guide, yang menjadi bagian dari Jakarta
                        Good Guide. Melalui konsep "walking tour", Palembang Good Guide
                        hadir untuk mengajak siapa pun mengenal kota Palembang dengan cara
                        yang berbeda — berjalan, bercerita, dan merasakan setiap jejak
                        sejarahnya secara langsung.
                    </p>
                </div>

                {/* CTA Section */}
                <div className="mt-16 py-12 text-center bg-gray-50 rounded-lg">
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Want to explore with us?
                    </h3>
                    <Link
                        to="/programs"
                        className="inline-block bg-orange-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
                    >
                        Lihat Program
                    </Link>
                </div>
            </div>
        </section>
    );
}
