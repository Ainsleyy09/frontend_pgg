import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../_services/auth";
import { User, Lock, UserPlus, Mail } from 'lucide-react';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await register(formData);
            console.log("Register success:", res);
            alert("Account created successfully! Please log in.");
            navigate("/login");
        } catch (err) {
            console.error("Register error:", err);
            setError("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-10 left-10 w-64 h-64 bg-orange-100 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-red-100 rounded-full opacity-30 blur-2xl"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 h-2"></div>

                    <div className="p-8 md:p-10">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                                <img
                                    src="/pgg_Images/pgg_ImgID1.png"
                                    alt="Logo"
                                    className="w-16 h-16 bg-white rounded-full object-cover"
                                />
                            </div>
                            <h1 className="text-center font-bold text-gray-800 mt-4">
                                Welcome to Palembang Good Guide!
                            </h1>
                            <p className="text-gray-500 text-sm text-center mt-2">
                                Please sign up to continue
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                                >  <User className="w-4 h-4 mr-2 text-orange-600" />
                                Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    id="name"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                                ><Mail className="w-4 h-4 mr-2 text-orange-600" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="flex items-center text-sm font-semibold text-gray-700 mb-2"
                                ><Lock className="w-4 h-4 mr-1 text-orange-600" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                                        required
                                    />
                                    <span className="ml-2 text-gray-600">
                                        I accept the{" "}
                                        <Link to="#" className="text-orange-600 hover:underline">
                                            Terms and Conditions
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-[#E57C23] hover:bg-[#D46D16] text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-[1.02] focus:ring-2 focus:ring-[#E57C23] focus:ring-offset-1"
                            >
                                {loading ? "Processing..." : "Create Account"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link to="/login" className="text-orange-600 hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
