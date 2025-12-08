import React, { useState } from "react";
import { createRegistration, getRegistrations } from "../../../_services/registration";
import { createPaymentToken } from "../../../_services/payment";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function RegistrationForm({ program, schedules, userInfo, userRegistrations = [], onClose }) {
    const [step, setStep] = useState(1);

    const availableSchedules = schedules;

    if (availableSchedules.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow border text-center">
                <h2 className="text-xl font-bold text-red-600 mb-3">Kamu sudah terdaftar!</h2>
                <p className="text-gray-600 mb-4">
                    Kamu sudah terdaftar di semua jadwal untuk program ini.
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 underline"
                >
                    Tutup
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const bulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        const date = new Date(dateString);
        const day = date.getDate();
        const month = bulan[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    };

    const [formData, setFormData] = useState({
        user_id: userInfo?.id || "",
        schedule_id: availableSchedules[0]?.id || "",
        name: userInfo?.name || "",
        region: "",
        phone: "",
        email: userInfo?.email || "",
        instagram: "",
    });

    const selectedSchedule = availableSchedules.find(
        (s) => s.id === Number(formData.schedule_id)
    );

    const getPriceValue = () => {
        const raw =
            selectedSchedule?.price?.price ??
            selectedSchedule?.price ??
            null;

        return raw !== null ? Number(raw) : null;
    };

    const price = getPriceValue();

    const [loading, setLoading] = useState(false);
    const [paymentRef, setPaymentRef] = useState("");
    const programName = program?.name || "Program Tidak Diketahui";

    const handleChange = (e) =>
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleNext = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePayment = async () => {
        try {
            setLoading(true);

            if (!selectedSchedule) return;

            const res = await createRegistration({
                ...formData,
                schedule_id: selectedSchedule.id,
            });

            const registrationId = res.data.id;

            if (price === null) {
                setStep(3);
                setPaymentRef("NOPRICE-" + registrationId);
                setLoading(false);
                return;
            }

            if (price === 0) {
                setStep(3);
                setPaymentRef("FREE-" + registrationId);
                setLoading(false);
                return;
            }

            const paymentRes = await createPaymentToken({
                registration_id: registrationId,
                amount: selectedSchedule.price.price ?? selectedSchedule.price,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            });

            const snapToken = paymentRes.token;

            window.snap.pay(snapToken, {
                onSuccess: (result) => {
                    setPaymentRef(result.order_id);
                    setStep(3);
                    setLoading(false);
                },
                onPending: (result) => {
                    setPaymentRef(result.order_id);
                    setStep(3);
                    setLoading(false);
                },
                onError: () => {
                    alert("Pembayaran gagal!");
                    setLoading(false);
                },
                onClose: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error("Registrasi gagal", error);
            alert("Registrasi gagal");
            setLoading(false);
        }
    };

    const handleDownloadNota = () => {
        const doc = new jsPDF("p", "mm", "a4");
        const orange = "#ff8c00";

        const logo = new Image();
        logo.src = "/images/pgg.jpg";

        logo.onload = () => {
            doc.setFillColor(orange);
            doc.rect(0, 0, 210, 40, "F");

            doc.addImage(logo, "PNG", 15, 7, 25, 25);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(19);
            doc.setTextColor("#ffffff");
            doc.text("PALEMBANG GOOD GUIDE", 105, 17, { align: "center" });

            doc.setFontSize(13);
            doc.text("Bukti Pendaftaran", 105, 30, { align: "center" });

            const cardX = 10;
            const cardY = 50;
            const cardWidth = 190;
            const cardHeight = 210;

            doc.setFillColor("#d9d9d9");
            doc.roundedRect(cardX + 2, cardY + 2, cardWidth, cardHeight, 5, 5, "F");

            doc.setFillColor("#ffffff");
            doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 5, 5, "F");

            let y = cardY + 15;

            doc.setFontSize(12);
            doc.setTextColor("#000");
            doc.setFont("helvetica", "bold");
            doc.text(`Nama Pendaftar : `, 18, y);
            doc.setFont("helvetica", "normal");
            doc.text(`${formData.name}`, 60, y);

            y += 7;
            doc.setDrawColor(orange);
            doc.line(15, y, 195, y);

            y += 10;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(orange);
            doc.text("Detail Program", 15, y);

            doc.setTextColor("#000");
            doc.setFont("helvetica", "normal");

            y += 8;
            doc.text(`Nama Program : ${programName}`, 18, y);

            y += 8;
            doc.text(`Tanggal      : ${selectedSchedule?.date || "-"}`, 18, y);

            y += 8;
            doc.text(
                `Jadwal       : ${selectedSchedule?.start_time || "-"} - ${selectedSchedule?.end_time || "-"}`,
                18,
                y
            );

            const hargaProgram = Number(price || 0);
            const hargaFinal = hargaProgram;

            y += 15;
            doc.setFont("helvetica", "bold");
            doc.setTextColor(orange);
            doc.text("Informasi Pembayaran", 15, y);

            doc.setTextColor("#000");
            doc.setFont("helvetica", "normal");

            y += 10;
            doc.text(
                `Harga Program : ${hargaProgram === 0 ? "Gratis" : "Rp " + hargaProgram.toLocaleString("id-ID")}`,
                20,
                y
            );

            y += 8;
            doc.text(
                `Harga Dibayar : ${hargaFinal === 0 ? "Gratis" : "Rp " + hargaFinal.toLocaleString("id-ID")}`,
                20,
                y
            );

            y += 18;
            doc.text(`Ref Pembayaran : ${paymentRef || "-"}`, 15, y);

            y += 8;
            const waktuBayar = new Date().toLocaleString("id-ID");
            doc.text(`Tanggal Bayar : ${waktuBayar}`, 15, y);

            doc.setFontSize(10);
            doc.setTextColor("#888");
            doc.text("Terima kasih telah mempercayai layanan kami!", 105, 285, {
                align: "center",
            });

            doc.save(`Nota-Pendaftaran-${formData.name}.pdf`);
        };
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow border">
            {step === 1 && (
                <>
                    <h2 className="text-2xl font-bold text-teal-800 mb-4 text-center">
                        Daftar Program: {programName}
                    </h2>

                    <form onSubmit={handleNext} className="space-y-4">

                        {/* PILIH JADWAL */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Pilih Jadwal
                            </label>

                            <select
                                name="schedule_id"
                                value={formData.schedule_id}
                                onChange={handleChange}
                                className="
                        w-full border border-gray-300 rounded-lg p-2
                        focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                        transition
                    "
                            >
                                {availableSchedules.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {formatDate(s.date)} • {s.start_time} - {s.end_time}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* CARD INFO SCHEDULE */}
                        {selectedSchedule && (
                            <div className="p-4 bg-gray-50 border rounded-lg shadow-sm space-y-1">
                                <p><strong>Guide:</strong> {selectedSchedule.guide?.name || "-"}</p>
                                <p><strong>Kuota:</strong> {selectedSchedule.quota}</p>
                                {selectedSchedule.price && (
                                    <p>
                                        <strong>Harga:</strong>{" "}
                                        {price === 0 ? "Gratis" : `Rp ${price.toLocaleString()}`}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* INPUT FORM */}
                        {["name", "region", "phone", "email", "instagram"].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    {field.toUpperCase()}
                                </label>
                                <input
                                    type="text"
                                    name={field}
                                    value={formData[field]}
                                    onChange={handleChange}
                                    className="
                            w-full border border-gray-300 rounded-lg p-2
                            focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                        "
                                    required={field !== "instagram"}
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="
                    w-full bg-teal-600 text-white py-2 rounded-lg font-medium
                    hover:bg-teal-700 transition
                "
                        >
                            Lanjutkan
                        </button>
                    </form>
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="text-xl font-bold text-teal-800 mb-4">
                        {price > 0 ? "Konfirmasi Pembayaran" : "Konfirmasi Pendaftaran"}
                    </h2>

                    <div className="p-4 bg-gray-50 border rounded space-y-2">
                        <p><strong>Program:</strong> {programName}</p>
                        <p><strong>Tanggal:</strong> {formatDate(selectedSchedule?.date)}</p>
                        <p><strong>Guide:</strong> {selectedSchedule?.guide?.name}</p>
                        {selectedSchedule.price && (
                            <p>
                                <strong>Harga:</strong>{" "}
                                {selectedSchedule.price.price === 0
                                    ? "Gratis"
                                    : `Rp ${Number(selectedSchedule.price.price).toLocaleString()}`}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={handlePayment}
                        className="w-full bg-green-600 text-white py-2 rounded-lg mt-5"
                        disabled={loading}
                    >
                        {loading
                            ? "Memproses..."
                            : price === null
                                ? "Daftar"
                                : price === 0
                                    ? "Daftar Gratis"
                                    : "Bayar Sekarang"
                        }
                    </button>
                </>
            )}

            {step === 3 && (
                <div className="text-center py-6">
                    <div className="mx-auto w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-4">
                        {/* simple check icon */}
                        <svg className="w-12 h-12 text-green-600 animate-pulse" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
                            <path d="M7 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <h2 className="text-xl font-bold text-teal-800 mb-2">
                        Pendaftaran Berhasil
                    </h2>

                    {/* pesan berbeda berdasarkan price */}
                    {price === null && (
                        <>
                            <p className="text-gray-700 mb-2">Terima kasih, pendaftaran kamu sudah berhasil dicatat.</p>
                            <p className="text-gray-600 mb-4">
                                Tim kami akan menghubungi kamu melalui email untuk konfirmasi pembayaran dan informasi lanjutan.
                                Silakan cek email kamu secara berkala, ya.
                            </p>
                        </>
                    )}

                    {price === 0 && (
                        <>
                            <p className="text-gray-700 mb-2">
                                Terima kasih — pendaftaran berhasil dan gratis.
                            </p>

                            <p className="text-gray-600 mb-4">
                                Kamu tidak perlu melakukan pembayaran. Sampai jumpa di acara!
                            </p>

                            <p className="text-gray-600 italic">
                                Tim kami juga akan menghubungi kamu melalui email untuk mengonfirmasi pendaftaran serta memberikan informasi selanjutnya.
                                Jangan lupa cek email kamu secara berkala, ya.
                            </p>
                        </>
                    )}


                    {price > 0 && (
                        <>
                            <p className="text-gray-700 mb-2">Terima kasih, pembayaran diterima / menunggu status pembayaran.</p>
                            <p className="text-gray-600 mb-4">Ref: <span className="font-mono">{paymentRef || "-"}</span></p>

                            <button
                                onClick={handleDownloadNota}
                                className="w-full border border-green-600 text-green-600 py-2 rounded-lg font-medium"
                            >
                                Download Nota
                            </button>
                        </>
                    )}
                </div>
            )}

            <button
                onClick={onClose}
                className="mt-6 w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
                Tutup Form
            </button>
        </div>
    );
}
