import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, useDecodeToken } from '../../_services/auth';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const token = localStorage.getItem("accessToken");
    const decodedData = useDecodeToken(token);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await login(formData);
            console.log("Response dari server:", response.data);

            localStorage.setItem("accessToken", response.data.token);
            localStorage.setItem("userInfo", JSON.stringify(response.data.user));

            navigate(response.data.user.role === "admin" ? "/admin" : "/");
        } catch (error) {
            setError(error?.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Login - Palembang Good Guide";

        if (!token) return;

        if (decodedData?.exp) {
            const now = Math.floor(Date.now() / 1000);
            if (decodedData.exp < now) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userInfo");
                navigate("/login");
                return;
            }
        }

        if (decodedData?.user?.role) {
            const role = decodedData.user.role;
            navigate(role === "admin" ? "/admin" : "/");
        }
    }, [decodedData]);


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
                                    src="/public/pgg_Images/pgg_ImgID1.png"
                                    alt="Logo"
                                    className="w-16 h-16 bg-white rounded-full object-cover"
                                />
                            </div>
                            <h1 className="text-center font-bold text-gray-800 mt-4">
                                Welcome to Palembang Good Guide!
                            </h1>
                            <p className="text-gray-500 text-sm text-center mt-2">
                                Please sign in to continue
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                    <User className="w-4 h-4 mr-1 text-orange-600" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none"
                                    placeholder="Masukkan email Anda"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                    <Lock className="w-4 h-4 mr-1 text-orange-600" />
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        id="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 outline-none"
                                        placeholder="Masukkan password Anda"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#E57C23] hover:bg-[#D46D16] text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-[1.02] focus:ring-2 focus:ring-[#E57C23] focus:ring-offset-1 flex justify-center items-center gap-2"
                                disabled={loading} // disable saat loading
                            >
                                {loading && (
                                    <svg
                                        className="w-5 h-5 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        ></path>
                                    </svg>
                                )}
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        By continuing, you agree to our{" "}
                        <a href="#" className="text-orange-600 hover:underline">Terms of Service</a> and{" "}
                        <a href="#" className="text-orange-600 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
