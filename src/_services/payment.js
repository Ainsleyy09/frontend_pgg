import { API } from "../_api"

export const getPayments = async () => {
    try {
        const response = await API.get("/payments", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

        // cek isi datanya di console
        console.log("PAYMENTS RESPONSE:", response.data);

        return response.data.data || []; // fallback biar ga undefined
    } catch (error) {
        console.error("GET PAYMENTS ERROR:", error.response?.data || error.message);
        return []; // biar tidak undefined
    }
};

export const createPaymentToken = async (paymentData) => {
    try {
        const response = await API.post("/create-snap-token", paymentData, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error creating payment token:", error.response?.data || error.message);
        throw error;
    }
};