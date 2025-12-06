import { API } from "../_api"

export const getRoutes = async () => {
    const { data } = await API.get("/routes");
    return data.data;
};


export const createRoutes = async (data) => {
    try {
        const response = await API.post("/routes", data, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        return response.data;
    } catch (error) {
        console.log(error.response?.data || error);
        throw error;
    }
}

export const showRoutes = async (id) => {
    const { data } = await API.get(`/routes/${id}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });

    return data.data;
};


export const updateRoutes = async (id, formData) => {
    try {
        const response = await API.post(`/routes/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating routes:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteRoutes = async (id) => {
    try {
        await API.delete(`/routes/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    } catch (error) {
        console.error("Error deleting routes:", error.response?.data || error.message);
        throw error;
    }
};