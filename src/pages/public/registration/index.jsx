import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showSchedules } from "../../../_services/schedule";
import { createRegistration } from "../../../_services/registration";

function TourRegistration() {
    const { id } = useParams();          // ID schedule dari URL
    const scheduleId = id;

    const [schedule, setSchedule] = useState(null);
    const [form, setForm] = useState({
        name: "",
        region: "",
        phone: "",
        email: "",
        instagram: "",
        jumlah_orang: "",
    });

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                console.log("ID Schedule diterima:", scheduleId);

                const data = await showSchedules(scheduleId);
                console.log("DATA SCHEDULE:", data);

                setSchedule(data);
            } catch (err) {
                console.error("Error mengambil schedule:", err);
            }
        };

        if (scheduleId) fetchSchedule();
    }, [scheduleId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append("user_id", localStorage.getItem("userId"));
            formData.append("schedule_id", scheduleId);

            Object.keys(form).forEach((key) => {
                formData.append(key, form[key]);
            });

            const res = await createRegistration(formData);

            alert("Registrasi berhasil!");
            console.log("Res:", res);
        } catch (error) {
            console.error("Registrasi gagal:", error);
        }
    };

    if (!schedule) return <p>Loading...</p>;

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Formulir Registrasi Tour</h2>

            <div className="space-y-4">
                <input
                    name="name"
                    onChange={handleChange}
                    placeholder="Nama Lengkap"
                    className="w-full p-2 border rounded"
                />

                <input
                    name="region"
                    onChange={handleChange}
                    placeholder="Region"
                    className="w-full p-2 border rounded"
                />

                <input
                    name="phone"
                    onChange={handleChange}
                    placeholder="No Telepon"
                    className="w-full p-2 border rounded"
                />

                <input
                    name="email"
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                />

                <input
                    name="instagram"
                    onChange={handleChange}
                    placeholder="Instagram"
                    className="w-full p-2 border rounded"
                />

                <input
                    name="jumlah_orang"
                    onChange={handleChange}
                    placeholder="Jumlah Orang"
                    className="w-full p-2 border rounded"
                />

                <div className="bg-gray-100 p-4 rounded text-sm">
                    <p><strong>Program Tour:</strong> {schedule?.program?.name}</p>
                    <p><strong>Tour Guide:</strong> {schedule?.guide?.name}</p>
                    <p><strong>Tanggal:</strong> {schedule?.date}</p>
                    <p><strong>Start:</strong> {schedule?.start_time}</p>
                    <p><strong>End:</strong> {schedule?.end_time}</p>
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
                >
                    Daftar Sekarang
                </button>

                <button className="w-full mt-2 bg-green-500 text-white py-2 rounded hover:bg-green-600">
                    Lanjut ke Pembayaran
                </button>
            </div>
        </div>
    );
}

export default TourRegistration;
