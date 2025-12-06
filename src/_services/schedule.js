import { API } from "../_api"

export const getSchedules = async () => {
    const { data } = await API.get("/schedules", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });

    return data.data;
};


export const createSchedules = async (data) => {
    try {
        const response = await API.post("/schedules", data, {
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

export const showSchedules = async (id) => {
    const { data } = await API.get(`/schedules/${id}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });
    return data.data;
};


export const updateSchedules = async (id, formData) => {
    try {
        const response = await API.post(`/schedules/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating tour schedule:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteSchedules = async (id) => {
    try {
        await API.delete(`/schedules/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    } catch (error) {
        console.error("Error deleting schedule:", error.response?.data || error.message);
        throw error;
    }
};