import { jwtDecode } from "jwt-decode";

export const getAuthData = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return { role: null, username: null };

    try {
        const decoded = jwtDecode(token);
        // These keys must match MyTokenObtainPairSerializer in serializers.py
        return {
            role: decoded.role,
            username: decoded.username
        };
    } catch (error) {
        return { role: null, username: null };
    }
};