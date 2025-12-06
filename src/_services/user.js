import { API } from "../_api"

export const getUsers = async () => {
    const { data } = await API.get("/users");
    return data.data;
}

export const createUsers = async (data) => {
    try {
        const response = await API.post("/users", data, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            },
        });
        return response.data
    } catch (error) {
        console.log(error.response?.data);
        throw error;
    }
};

export const deleteUsers = async (id) => {
    try {
        await API.delete(`/users/${id}`, {
            headers :{
                "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    } catch (error) {
        console.error("Error deleting user:", error.response?.data || error.message);
        throw error;
    }
};