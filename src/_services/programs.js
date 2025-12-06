import { API } from "../_api"

export const getPrograms = async () => {
    const { data } = await API.get("/programs");
    return data.data;
};



export const createPrograms = async (data) => {
    try {
        const response = await API.post("/programs", data, {
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

export const showPrograms = async (id) => {
    const { data } = await API.get(`/programs/${id}`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
    });

    return data.data;
};


export const updatePrograms = async (id, formData) => {
    try {
        const response = await API.post(`/programs/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating program tour:", error.response?.data || error.message);
        throw error;
    }
};

export const deletePrograms = async (id) => {
    try {
        await API.delete(`/programs/${id}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    } catch (error) {
        console.error("Error deleting program:", error.response?.data || error.message);
        throw error;
    }
};