import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGuides } from "../../../_services/guides";

function CreateGuides() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        role: "",
        email: "",
        instagram: "",
        bio: "",
        photo: null,
    });

    const [photoPreview, setPhotoPreview] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "photo") {
            const file = files[0];

            if (file && file.size > 10 * 1024 * 1024) {
                alert("Ukuran foto minimal 2MB!");
                return;
            }

            setFormData({ ...formData, photo: file });

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

        const requiredFields = ["name", "phone", "role", "email", "instagram", "photo"];
        for (let field of requiredFields) {
            if (!formData[field]) {
                return alert(`${field} wajib diisi!`);
            }
        }

        try {
            const payload = new FormData();
            Object.keys(formData).forEach((key) => {
                payload.append(key, formData[key]);
            });

            await createGuides(payload);
            alert("Guide successfully created!");
            navigate("/admin/guides");
        } catch (error) {
            const msg = error.response?.data?.message;
            console.error(msg || error);
            alert("Failed to create guide: " + JSON.stringify(msg));
        }
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
                    {/* HEADER */}
                    <div className="px-8 py-10 bg-white border-b border-orange-100">
                        <h2 className="text-4xl font-extrabold text-orange-600 drop-shadow-sm">
                            Create New Guide
                        </h2>
                        <p className="text-orange-500 text-sm mt-1">
                            Isi semua data pemandu wisata
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* INPUT GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama pemandu"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                               bg-white text-black placeholder-gray-500
                                               focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Contoh: 0812xxxxx"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                               bg-white text-black placeholder-gray-500
                                               focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    name="role"
                                    required
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="Masukkan Role pemandu"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                               bg-white text-black placeholder-gray-500
                                               focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@mail.com"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                               bg-white text-black placeholder-gray-500
                                               focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Instagram */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Instagram
                                </label>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="@username"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                               bg-white text-black placeholder-gray-500
                                               focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Bio */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-1 block">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    rows="4"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Masukkan biografi pemandu"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl
                                               bg-white text-black placeholder-gray-500
                                               focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                ></textarea>
                            </div>
                        </div>

                        {/* PHOTO UPLOAD */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-2 block">
                                Photo
                            </label>

                            <div className="flex gap-6 flex-col md:flex-row">
                                {/* Upload Area */}
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="hidden"
                                    />

                                    <div
                                        className="border-2 border-dashed border-orange-300 rounded-xl
                                                   p-8 bg-orange-50 hover:bg-orange-100 transition"
                                    >
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
                                                Klik untuk upload foto
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                PNG, JPG max 10MB
                                            </p>
                                        </div>
                                    </div>
                                </label>

                                {/* Preview */}
                                {photoPreview && (
                                    <div className="flex-1">
                                        <div className="rounded-xl overflow-hidden border-2 border-orange-200 bg-orange-50">
                                            <img
                                                src={photoPreview}
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="p-2 bg-orange-100 text-center text-xs font-semibold text-gray-800">
                                                {formData.photo?.name}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex items-center gap-4 pt-6 border-t border-orange-100">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-600 text-white font-semibold
                                           rounded-xl shadow-md hover:bg-orange-700 transition"
                            >
                                Save Guide
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/guides")}
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

export default CreateGuides;
