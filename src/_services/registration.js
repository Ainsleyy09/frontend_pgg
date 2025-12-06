import { API } from "../_api"

export const getRegistrations = async () => {
    const { data } = await API.get("/registrations");
    return data.data;
};

export const createRegistration = async (formData) => {
    try {
        const response = await API.post("/registrations", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating registration:", error.response?.data || error.message);
        throw error;
    }
};

export const showRegistration = async (id) => {
    try {
        const { data } = await API.get(`/registrations/${id}`);
        return data.data;
    } catch (error) {
        console.error(`Error fetching registration (ID: ${id}):`, error.response?.data || error.message);
        throw error;
    }
};

export const updateRegistration = async (id, formData) => {
    try {
        const response = await API.post(`/registrations/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating registration (ID: ${id}):`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteRegistration = async (id) => {
    try {
        await API.delete(`/registrations/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
    } catch (error) {
        console.error(`Error deleting registration (ID: ${id}):`, error.response?.data || error.message);
        throw error;
    }
};
