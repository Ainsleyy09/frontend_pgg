import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUsers } from "../../../_services/user";

function CreateUsers() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        password: "",
    });

    const [passwordError, setPasswordError] = useState(""); // NEW

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // password validation
        if (name === "password") {
            if (value.length < 6) {
                setPasswordError("Password minimal 6 karakter");
            } else {
                setPasswordError("");
            }
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordError) {
            alert("Perbaiki password terlebih dahulu!");
            return;
        }

        try {
            await createUsers(formData);
            alert("User created successfully!");
            navigate("/admin/users");
        } catch (error) {
            console.log(error.response?.data);
            alert("Error creating user!");
        }
    };

    return (
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">

                    <div className="px-8 py-10 border-b border-orange-100">
                        <h2 className="text-4xl font-extrabold text-orange-600">Create New User</h2>
                        <p className="text-orange-500 text-sm mt-1">Add a new user to the system</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-1 block">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="User Name"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="font-semibold text-gray-900 mb-1 block">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black"
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl bg-white text-black"
                                    required
                                >
                                    <option value="">-- Select Role --</option>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="font-semibold text-gray-900 mb-1 block">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className={`w-full px-4 py-3 border-2 rounded-xl bg-white
                                        ${passwordError ? "border-red-400" : "border-orange-200"}`}
                                    required
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t border-orange-100">
                            <button
                                type="submit"
                                disabled={passwordError !== ""}
                                className={`px-6 py-3 text-white font-semibold rounded-xl shadow-md transition
                                    ${passwordError ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}`}
                            >
                                Create User
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/users")}
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

export default CreateUsers;
