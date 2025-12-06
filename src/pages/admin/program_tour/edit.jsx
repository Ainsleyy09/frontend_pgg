import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    showPrograms,
    updatePrograms,
    getPrograms,
} from "../../../_services/programs";
import { guideImageStorage } from "../../../_api";

function EditPrograms() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        payment_type: "",
        duration: "",
        status: "",
        program_type: "",
        program_photo: "",
        newPhoto: null,
    });

    const [photoPreview, setPhotoPreview] = useState(null);
    const [programTypes, setProgramTypes] = useState([]);

    useEffect(() => {
        const loadProgram = async () => {
            try {
                // Ambil data program berdasarkan id
                const program = await showPrograms(id);

                // Ambil semua program untuk mengambil tipe unik
                const allPrograms = await getPrograms();

                const types = [
                    ...new Set(allPrograms.map((p) => p.program_type)),
                ];
                setProgramTypes(types);

                setFormData({
                    name: program.name || "",
                    description: program.description || "",
                    payment_type: program.payment_type || "",
                    duration: program.duration || "",
                    status: program.status || "",
                    program_type: program.program_type || "",
                    program_photo: program.program_photo || "",
                    newPhoto: null,
                });

                if (program.program_photo) {
                    setPhotoPreview(`${guideImageStorage}/${program.program_photo}`
                    );
                }
            } catch (error) {
                console.error("Error fetching program:", error);
            }
        };

        loadProgram();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "program_photo") {
            const file = files[0];

            if (file && file.size > 10 * 1024 * 1024) {
                alert("Ukuran foto minimal 10MB!");
                return;
            }

            setFormData({ ...formData, newPhoto: file });

            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPhotoPreview(reader.result);
                reader.readAsDataURL(file);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("description", formData.description);
            payload.append("payment_type", formData.payment_type);
            payload.append("duration", formData.duration);
            payload.append("status", formData.status);
            payload.append("program_type", formData.program_type);

            if (formData.newPhoto) {
                payload.append("program_photo", formData.newPhoto);
            }

            await updatePrograms(id, payload);

            alert("Program updated successfully!");
            navigate("/admin/programs");
        } catch (error) {
            console.error("Error updating program:", error);
            alert("Gagal memperbarui program!");
        }
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
                    <div className="px-8 py-10 border-b border-orange-100">
                        <h2 className="text-4xl font-extrabold text-orange-600">
                            Edit Program Tour
                        </h2>
                        <p className="text-orange-500 text-sm mt-1">
                            Perbarui informasi program tour
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Program Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Description
                                </label>
                                <textarea
                                    rows="4"
                                    name="description"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white"
                                ></textarea>
                            </div>

                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Payment Type
                                </label>
                                <select
                                    name="payment_type"
                                    required
                                    value={formData.payment_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white"
                                >
                                    <option value="" disabled>
                                        Pilih tipe pembayaran
                                    </option>
                                    <option value="awal">Awal</option>
                                    <option value="akhir">Akhir</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Duration
                                </label>
                                <input
                                    type="text"
                                    name="duration"
                                    required
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white"
                                />
                            </div>

                            <div className="md:col-span-1">
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    required
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white"
                                >
                                    <option value="" disabled>
                                        Pilih status
                                    </option>
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>

                            {/* PROGRAM TYPE (Dynamic) */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Program Type
                                </label>
                                <select
                                    name="program_type"
                                    required
                                    value={formData.program_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white"
                                >
                                    <option value="" disabled>
                                        Pilih tipe program
                                    </option>
                                    {programTypes.map((type, i) => (
                                        <option key={i} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* UPLOAD */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-2 block">
                                Program Photo
                            </label>

                            <div className="flex gap-6 flex-col md:flex-row">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="file"
                                        name="program_photo"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 bg-orange-50 hover:bg-orange-100">
                                        <div className="text-center">
                                            <svg
                                                className="mx-auto h-12 w-12 text-orange-500 mb-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                            <p className="font-semibold text-gray-800">
                                                Klik untuk upload foto baru
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                PNG, JPG, GIF max 10MB
                                            </p>
                                        </div>
                                    </div>
                                </label>

                                {photoPreview && (
                                    <div className="flex-1">
                                        <div className="rounded-xl overflow-hidden border-2 border-orange-200 bg-orange-50">
                                            <img
                                                src={photoPreview}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="p-2 bg-orange-100 text-center text-xs font-semibold text-gray-800">
                                                {formData.newPhoto?.name ||
                                                    formData.program_photo}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t border-orange-100">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700"
                            >
                                Update Program
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/programs")}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold
                                rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default EditPrograms;
