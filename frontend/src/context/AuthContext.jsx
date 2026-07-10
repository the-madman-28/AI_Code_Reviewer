import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getCurrentUser,
    loginUser
} from "../api/authApi";

import {
    getAccessToken,
    removeAccessToken,
    saveAccessToken
} from "../api/apiClient";


const AuthContext =
    createContext(null);


// ======================================================
// AUTH PROVIDER
// ======================================================

export function AuthProvider({
    children
}) {

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    // --------------------------------------------------
    // RESTORE SESSION
    // --------------------------------------------------

    useEffect(() => {

        async function restoreSession() {

            const token =
                getAccessToken();


            if (!token) {

                setLoading(false);

                return;
            }


            try {

                const data =
                    await getCurrentUser();


                setUser(
                    data.user
                );

            } catch (error) {

                removeAccessToken();

                setUser(null);

            } finally {

                setLoading(false);
            }
        }


        restoreSession();

    }, []);


    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------

    async function login(
        userId,
        password
    ) {

        const data =
            await loginUser({
                user_id: userId,
                password
            });


        saveAccessToken(
            data.access_token
        );


        // Verify token through protected endpoint
        const profile =
            await getCurrentUser();


        setUser(
            profile.user
        );


        return data;
    }


    // --------------------------------------------------
    // LOGOUT
    // --------------------------------------------------

    function logout() {

        removeAccessToken();

        setUser(null);
    }


    const value = {
        user,

        loading,

        isAuthenticated:
            Boolean(user),

        login,

        logout
    };


    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}


// ======================================================
// CUSTOM AUTH HOOK
// ======================================================

export function useAuth() {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }


    return context;
}