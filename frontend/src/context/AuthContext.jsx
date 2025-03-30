import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "../services/userService";
import { toast } from "react-toastify";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuperuser, setIsSuperuser] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.user_id;
                fetchUserProfile(userId);
            } catch (err) {
                logout();
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUserProfile = (userId) => {
        getUserProfile(userId)
            .then(res => {
                setUser(res.data);
                setGroups([...res.data.groups]);
                setPermissions([...res.data.permissions]);
                setIsSuperuser(res.data.is_superuser);
            })
            .catch(() => {
                logout();
            })
            .finally(() => setIsLoading(false));
    };

    const login = (accessToken, refreshToken) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        try {
            const decodedToken = jwtDecode(accessToken);
            const userId = decodedToken.user_id;

            setTimeout(() => {
                fetchUserProfile(userId);
            }, 500);
        } catch (err) {
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
        setGroups([]);
        setPermissions([]);
        setIsLoading(false);

        toast("Logged out successfully");

        setTimeout(() => {
            if (window.location.pathname === "/") {
                window.location.reload();
            } else {
                window.location.href = "/";
            }
        }, 1000);

    };



    return (
        <AuthContext.Provider value={{ user, groups, permissions, login, logout, isLoading, isSuperuser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
