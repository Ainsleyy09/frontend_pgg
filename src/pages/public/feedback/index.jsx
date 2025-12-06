import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getFeedbacks, createFeedbacks } from "../../../_services/feedback";
import { getUsers } from "../../../_services/user";
import { useNavigate } from "react-router-dom";

export default function Feedbacks() {
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [formData, setFormData] = useState({
        rating: 0,
        hoverRating: 0,
        comments: "",
    });

    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        }
    };

    // Ambil semua feedback
    const fetchReviews = async () => {
        try {
            const data = await getFeedbacks();
            setReviews(data || []);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            setReviews([]);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, reviewsData] = await Promise.all([getUsers(), getFeedbacks()]);

                const reviewsWithName = reviewsData.map((r) => ({
                    ...r,
                    user_name: usersData.find(u => u.id === r.user_id)?.name || "Unknown User",
                }));

                setUsers(usersData);
                setReviews(reviewsWithName);
            } catch (err) {
                console.error(err);
                setUsers([]);
                setReviews([]);
            }
        };

        fetchData();
    }, []);

    const getUserName = (id) => {
        if (!users || users.length === 0) return "Unknown User";
        const user = users.find(u => u.id === id);
        return user?.name ?? "Unknown User";
    };

    const getUserInitial = (user_id) => {
        const name = getUserName(user_id);
        return name ? name.charAt(0).toUpperCase() : "U";
    };

    const totalReviews = reviews.length;
    const averageRating =
        totalReviews > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

    const maxRatings = Math.max(
        ...[1, 2, 3, 4, 5].map((star) => reviews.filter((r) => r.rating === star).length)
    );

    const ratingCounts = [5, 4, 3, 2, 1].reduce((acc, star) => {
        acc[star] = reviews.filter((r) => r.rating === star).length;
        return acc;
    }, {});

    const handleStarClick = (star) => setFormData({ ...formData, rating: star });
    const handleStarHover = (star) => setFormData({ ...formData, hoverRating: star });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!accessToken) {
            alert("Silakan login terlebih dahulu!");
            navigate("/login");
            return;
        }

        if (!formData.rating || !formData.comments) {
            alert("Rating dan komentar harus diisi!");
            return;
        }

        try {
            const payload = {
                user_id: userInfo.id,
                rating: formData.rating,
                comments: formData.comments,
            };

            const response = await createFeedbacks(payload);
            setReviews([response.data, ...reviews]);
            setFormData({ rating: 0, hoverRating: 0, comments: "" });
            setShowReviewForm(false);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Gagal mengirim feedback!");
        }
    };

    return (
        <section className="bg-gradient-to-br from-blue-50 to-teal-50 py-16 px-6 md:px-16">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
                    Feedback & Rating
                </h1>

                <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 mb-12">
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Summary Rating */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-6xl font-bold text-teal-600 mb-2">{averageRating}</div>
                            <div className="text-xl text-gray-600 mb-4">/ 5</div>

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={32}
                                        className={
                                            i < Math.round(averageRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }
                                    />
                                ))}
                            </div>

                            <div className="text-gray-600 font-semibold mb-6">{totalReviews} Review</div>

                            <button
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-300"
                            >
                                Berikan Feedback
                            </button>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-12">
                                        <span className="text-sm font-semibold text-gray-700">{star}</span>
                                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    </div>

                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${maxRatings > 0 ? (ratingCounts[star] / maxRatings) * 100 : 0}%`,
                                            }}
                                        />
                                    </div>

                                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                                        ({ratingCounts[star]})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    {showReviewForm && (
                        <div className="mt-12 pt-12 border-t border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Tulis Review Anda</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleStarClick(star)}
                                                onMouseEnter={() => handleStarHover(star)}
                                                onMouseLeave={() => setFormData({ ...formData, hoverRating: 0 })}
                                                className="transition-transform duration-200 hover:scale-110"
                                            >
                                                <Star
                                                    size={32}
                                                    className={
                                                        star <= (formData.hoverRating || formData.rating)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                    }
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Komentar</label>
                                    <textarea
                                        value={formData.comments}
                                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                                        placeholder="Bagikan pengalaman Anda..."
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-300"
                                    >
                                        Kirim Review
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg transition-colors duration-300"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* List Reviews */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Review dari Wisatawan</h2>
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div
                                            className="
                                            w-12 h-12
                                            rounded-full
                                            bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600
                                            flex items-center justify-center
                                            text-white font-bold text-lg
                                            shadow-md
                                            hover:scale-110 transition-transform duration-300
                                            relative
                                          "
                                        >
                                            {getUserInitial(review.user_id)}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {review.user_name}
                                        </p>

                                        <div className="flex gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                                />
                                            ))}
                                        </div>

                                        <p className="text-gray-700 mb-3">{review.comments}</p>
                                        <p className="text-sm text-gray-500">{review.date}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
