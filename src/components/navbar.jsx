import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../_services/auth";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const rawUserInfo = localStorage.getItem("userInfo");
    const userInfo =
        rawUserInfo && rawUserInfo !== "undefined"
            ? JSON.parse(rawUserInfo)
            : null;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProgramsOpen, setIsProgramsOpen] = useState(false);

    const handleLogout = async () => {
        if (token) {
            await logout({ token });
            localStorage.removeItem("userInfo");
            localStorage.removeItem("accessToken");
        }
        navigate("/login");
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinkClass = ({ isActive }) =>
        `block py-2 pr-4 pl-3 border-b border-gray-100 lg:border-0 lg:p-0 ${isActive
            ? "text-orange-600 font-semibold"
            : "text-gray-700 hover:text-orange-600 dark:text-gray-400 lg:dark:hover:text-white"
        }`;

    return (
        <header>
            <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">

                    {/* Logo */}
                    <NavLink to="/" className="flex items-center">
                        <img
                            src="/images/pgg.jpg"
                            className="mr-3 h-6 sm:h-9"
                            alt="Logo"
                        />
                        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                            Palembang Good Guide
                        </span>
                    </NavLink>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-6 font-medium text-gray-700">

                        <NavLink to="/" className={navLinkClass}>
                            Home
                        </NavLink>

                        {/* Tour Programs Dropdown */}
                        <div className="relative group">
                            <button className="text-gray-700 hover:text-orange-600 font-medium">
                                Tour Programs
                            </button>

                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md py-2 w-40 z-50">
                                <NavLink
                                    to="/programs?type=regular"
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                >
                                    Regular
                                </NavLink>
                                <NavLink
                                    to="/programs?type=event"
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                >
                                    Event
                                </NavLink>
                                <NavLink
                                    to="/programs?type=special"
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                >
                                    Special
                                </NavLink>
                                <NavLink
                                    to="/programs?type=private"
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                >
                                    Private
                                </NavLink>
                            </div>
                        </div>

                        <NavLink to="/guides" className={navLinkClass}>
                            Tour Guides
                        </NavLink>

                        <NavLink to="/abouts" className={navLinkClass}>
                            About Us
                        </NavLink>

                        {/* Services Dropdown */}
                        <div className="relative group">
                            <button className="text-gray-700 hover:text-orange-600 font-medium">
                                Services
                            </button>

                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md py-2 w-40 z-50">
                                <NavLink
                                    to="/contacts"
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                >
                                    Contact Us
                                </NavLink>
                                <NavLink
                                    to="/feedback"
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                >
                                    Feedback
                                </NavLink>
                                <NavLink
                                    to="/faqs"
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                                >
                                    FAQ
                                </NavLink>
                            </div>
                        </div>
                    </div>

                    {/* Auth Buttons + Mobile Toggle */}
                    <div className="flex items-center lg:order-2">
                        {token && userInfo ? (
                            <>
                                <NavLink
                                    to="/transactions"
                                    className="text-gray-800 dark:text-white hover:bg-gray-50 font-medium rounded-lg text-sm px-4 py-2 mr-2"
                                >
                                    {userInfo.name}
                                </NavLink>

                                <button
                                    onClick={handleLogout}
                                    className="text-white bg-orange-600 hover:bg-orange-700 font-medium rounded-lg text-sm px-4 py-2 mr-2"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="/login"
                                    className="text-gray-800 dark:text-white hover:bg-gray-50 font-medium rounded-lg text-sm px-4 py-2 mr-2"
                                >
                                    Sign In
                                </NavLink>
                                <NavLink
                                    to="/register"
                                    className="text-white bg-orange-600 hover:bg-orange-700 font-medium rounded-lg text-sm px-4 py-2 mr-2"
                                >
                                    Sign Up
                                </NavLink>
                            </>
                        )}

                        {/* Mobile Toggle Btn */}
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center p-2 ml-1 text-sm text-gray-900 dark:text-white rounded-lg lg:hidden hover:bg-gray-100"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d={
                                        isMenuOpen
                                            ? "M6 18L18 6M6 6l12 12"
                                            : "M3 5h14M3 10h14M3 15h14"
                                    }
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="lg:hidden w-full mt-2 bg-white rounded-lg shadow-lg p-4">
                            <ul className="flex flex-col space-y-2">

                                <li>
                                    <NavLink
                                        to="/"
                                        className={navLinkClass}
                                        onClick={toggleMenu}
                                    >
                                        Home
                                    </NavLink>
                                </li>

                                {/* Mobile dropdown */}
                                <li>
                                    <button
                                        className="flex justify-between items-center w-full text-left text-gray-700 py-2"
                                        onClick={() =>
                                            setIsProgramsOpen(!isProgramsOpen)
                                        }
                                    >
                                        Tour Programs
                                        <span>{isProgramsOpen ? "▲" : "▼"}</span>
                                    </button>

                                    {isProgramsOpen && (
                                        <ul className="pl-4 flex flex-col space-y-2">
                                            <li>
                                                <NavLink
                                                    to="/programs?type=regular"
                                                    className={navLinkClass}
                                                    onClick={toggleMenu}
                                                >
                                                    Regular
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    to="/programs?type=event"
                                                    className={navLinkClass}
                                                    onClick={toggleMenu}
                                                >
                                                    Event
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    to="/programs?type=special"
                                                    className={navLinkClass}
                                                    onClick={toggleMenu}
                                                >
                                                    Special
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    to="/programs?type=private"
                                                    className={navLinkClass}
                                                    onClick={toggleMenu}
                                                >
                                                    Private
                                                </NavLink>
                                            </li>
                                        </ul>
                                    )}
                                </li>

                                <li>
                                    <NavLink
                                        to="/guides"
                                        className={navLinkClass}
                                        onClick={toggleMenu}
                                    >
                                        Guides
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink
                                        to="/abouts"
                                        className={navLinkClass}
                                        onClick={toggleMenu}
                                    >
                                        About Us
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink
                                        to="/contacts"
                                        className={navLinkClass}
                                        onClick={toggleMenu}
                                    >
                                        Contact Us
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink
                                        to="/feedback"
                                        className={navLinkClass}
                                        onClick={toggleMenu}
                                    >
                                        Feedback
                                    </NavLink>
                                </li>

                                <li>
                                    <NavLink
                                        to="/faqs"
                                        className={navLinkClass}
                                        onClick={toggleMenu}
                                    >
                                        FAQS
                                    </NavLink>
                                </li>

                            </ul>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
