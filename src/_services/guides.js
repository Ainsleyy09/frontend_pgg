import { API } from "../_api"

export const getGuides = async () => {
    const { data } = await API.get("/guides", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });

    return data.data;
};


export const createGuides = async (data) => {
    try {
        const response = await API.post("/guides", data, {
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

export const showGuides = async (id) => {
    const { data } = await API.get(`/guides/${id}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });

    return data.data;
};


export const updateGuides = async (id, formData) => {
    try {
        const response = await API.post(`/guides/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating guide:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteGuides = async (id) => {
    try {
        await API.delete(`/guides/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    } catch (error) {
        console.error("Error deleting guide:", error.response?.data || error.message);
        throw error;
    }
};