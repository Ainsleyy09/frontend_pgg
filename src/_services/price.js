import { API } from "../_api";

export const getPrices = async () => {
    const { data } = await API.get("/prices");
    return data.data;
};

export const createPrices = async (data) => {
    try {
        const response = await API.post("/prices", data, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            },
        });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const showPrices = async (id) => {
    const { data } = await API.get(`/prices/${id}`);
    return data.data;
};

export const updatePrices = async (id, formData) => {
    try {
        const response = await API.post(`/prices/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating price tour:", error.response?.data || error.message);
        throw error;
    }
};

export const deletePrices = async (id) => {
    try {
        await API.delete(`/prices/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    } catch (error) {
        console.error("Error deleting prices:", error.response?.data || error.message);
        throw error;
    }
};
