import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showGuides, updateGuides } from "../../../_services/guides";
import { guideImageStorage } from "../../../_api";

function EditGuides() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        role: "",
        email: "",
        instagram: "",
        bio: "",
        photo: null,
    });

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                const data = await showGuides(id);
                setFormData({
                    name: data.name || "",
                    phone: data.phone || "",
                    role: data.role || "",
                    email: data.email || "",
                    instagram: data.instagram || "",
                    bio: data.bio || "",
                    photo: data.photo || null,
                });
            } catch (error) {
                console.error("Error fetching guide:", error);
            }
        };

        fetchGuide();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "photo") {
            const file = files[0];

            if (file && file.size > 10 * 1024 * 1024) {
                alert("Ukuran foto maksimal 2MB!");
                return;
            }

            setFormData((prev) => ({
                ...prev,
                photo: file,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = new FormData();

            Object.keys(formData).forEach((key) => {
                if (key === "photo") {
                    if (formData.photo instanceof File) {
                        payload.append("photo", formData.photo);
                    }
                } else {
                    payload.append(key, formData[key]);
                }
            });

            await updateGuides(id, payload);

            alert("Guide updated successfully!");
            navigate("/admin/guides");
        } catch (error) {
            console.error("Error updating guide:", error);
            alert("Failed to update guide!");
        }
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-10 border-b border-orange-100">
                        <h2 className="text-4xl font-extrabold text-orange-600">Edit Guide</h2>
                        <p className="text-orange-500 text-sm mt-1">Update guide information</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-2 block">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-2 block">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-2 block">Role</label>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    placeholder="Masukkan Role Pemandu"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-2 block">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Instagram */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-2 block">Instagram</label>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                />
                            </div>

                            {/* Bio */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-2 block">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black placeholder-gray-500 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                                ></textarea>
                            </div>
                        </div>

                        {/* Photo */}
                        <div>
                            <label className="font-semibold text-gray-900 mb-2 block">Photo</label>

                            <div className="flex gap-6 flex-col md:flex-row">
                                {/* Upload */}
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleChange}
                                    />

                                    <div className="border-2 border-dashed border-orange-300 rounded-xl p-8 bg-orange-50 hover:bg-orange-100 transition">
                                        <div className="text-center">
                                            <svg className="mx-auto h-12 w-12 text-orange-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            <p className="font-semibold text-gray-800">Click to upload</p>
                                            <p className="text-xs text-gray-600 mt-1">PNG, JPG max 10MB</p>
                                        </div>
                                    </div>
                                </label>

                                {/* Preview */}
                                <div className="flex-1">
                                    <div className="rounded-xl overflow-hidden border-2 border-orange-200 bg-orange-50">
                                        <img
                                            src={
                                                formData.photo instanceof File
                                                    ? URL.createObjectURL(formData.photo)
                                                    : `${guideImageStorage}/${formData.photo}`
                                            }
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                        />

                                        <div className="p-2 bg-orange-100 text-center text-xs font-semibold text-gray-800">
                                            {formData.photo instanceof File ? formData.photo.name : formData.photo}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-4 pt-6 border-t border-orange-100">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl shadow-md hover:bg-orange-700 transition"
                            >
                                Save Guide
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/guides")}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
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

export default EditGuides;
