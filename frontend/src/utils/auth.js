import { jwtDecode } from 'jwt-decode';

export const getAuthData = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return { token: null, role: null, username: null };

    try {
        const decoded = jwtDecode(token);
        // We pull 'role' because that's what your backend team put in the claims
        return { 
            token, 
            role: decoded.role, 
            username: decoded.username 
        };
    } catch (error) {
        // If the token is tampered with or expired, clear it
        localStorage.removeItem('access_token');
        return { token: null, role: null, username: null };
    }
};