import { API } from "../_api"

export const getFeedbacks = async () => {
    const { data } = await API.get("/feedbacks", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });

    return data.data;
};


export const createFeedbacks = async (data) => {
    try {
        const response = await API.post("/feedbacks", data, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            },
        });
        return response.data
    } catch (error) {
        console.log(error);
        throw error
    }
}

export const showFeedbacks = async (id) => {
    const { data } = await API.get(`/feedbacks/${id}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });

    return data.data;
};


export const deleteFeedbacks = async (id) => {
    try {
        await API.delete(`/feedbacks/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    } catch (error) {
        console.error("Error deleting feedback:", error.response?.data || error.message);
        throw error;
    }
};