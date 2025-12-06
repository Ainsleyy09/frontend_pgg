export const checkTokenExpiration = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);

    // Token expired
    if (payload.exp < now) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        return true;
    }

    return false;
};
