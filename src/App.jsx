import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import PublicLayout from "./layout/public";
import Home from "./pages/public/index";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import AdminLayout from "./layout/admin";
import Dashboard from "./pages/admin";
import AdminUsers from "./pages/admin/users";
import AboutUs from "./pages/public/about_us";
import Contacts from "./pages/public/contact";
import TourPrograms from "./pages/public/tour_program";
import Guides from "./pages/public/guide";
import Feedbacks from "./pages/public/feedback";
import Faqs from "./pages/public/faqs";
import AdminGuides from "./pages/admin/guides";
import CreateGuides from "./pages/admin/guides/create";
import EditGuides from "./pages/admin/guides/edit";
import AdminPrograms from "./pages/admin/program_tour";
import CreatePrograms from "./pages/admin/program_tour/create";
import EditPrograms from "./pages/admin/program_tour/edit";
import AdminSchedule from "./pages/admin/tour_schedule";
import CreateSchedule from "./pages/admin/tour_schedule/create";
import EditSchedule from "./pages/admin/tour_schedule/edit";
import AdminRoute from "./pages/admin/tour_route";
import CreateRoute from "./pages/admin/tour_route/create";
import EditRoute from "./pages/admin/tour_route/edit";
import AdminRegistration from "./pages/admin/registrations";
import AdminPayment from "./pages/admin/payments";
import AdminFeedback from "./pages/admin/feedbacks";
import CreateUsers from "./pages/admin/users/create";
import TourRegistration from "./pages/public/registration";
import AdminPrice from "./pages/admin/prices";
import CreatePrice from "./pages/admin/prices/create";
import EditPrice from "./pages/admin/prices/edit";
import DetailProgram from "./pages/public/tour_program/detail";
import { checkTokenExpiration } from "./_services/checktoken";

function App() {
    const navigate = useNavigate();

    useEffect(() => {
        const expired = checkTokenExpiration();

        if (expired) {
            navigate("/login");
        }
    }, []);

    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route index element={<Home />} />

                <Route path="programs">
                    <Route index element={<TourPrograms />} />
                    <Route path="detail/:id" element={<DetailProgram />} />
                </Route>
                <Route
                    path="/registrations/:id"
                    element={<TourRegistration />}
                />
                <Route path="guides" element={<Guides />} />
                <Route path="feedback" element={<Feedbacks />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="abouts" element={<AboutUs />} />
                <Route path="faqs" element={<Faqs />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Route>

            <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />

                <Route path="guides">
                    <Route index element={<AdminGuides />} />
                    <Route path="create" element={<CreateGuides />} />
                    <Route path="edit/:id" element={<EditGuides />} />
                </Route>

                <Route path="programs">
                    <Route index element={<AdminPrograms />} />
                    <Route path="create" element={<CreatePrograms />} />
                    <Route path="edit/:id" element={<EditPrograms />} />
                </Route>

                <Route path="prices">
                    <Route index element={<AdminPrice />} />
                    <Route path="create" element={<CreatePrice />} />
                    <Route path="edit/:id" element={<EditPrice />} />
                </Route>

                <Route path="routes">
                    <Route index element={<AdminRoute />} />
                    <Route path="create" element={<CreateRoute />} />
                    <Route path="edit/:id" element={<EditRoute />} />
                </Route>

                <Route path="schedules">
                    <Route index element={<AdminSchedule />} />
                    <Route path="create" element={<CreateSchedule />} />
                    <Route path="edit/:id" element={<EditSchedule />} />
                </Route>

                <Route path="registrations">
                    <Route index element={<AdminRegistration />} />
                </Route>

                <Route path="payments">
                    <Route index element={<AdminPayment />} />
                </Route>

                <Route path="feedbacks">
                    <Route index element={<AdminFeedback />} />
                </Route>

                <Route path="users">
                    <Route index element={<AdminUsers />} />
                    <Route path="create" element={<CreateUsers />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
