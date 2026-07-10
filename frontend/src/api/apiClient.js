const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";


const ACCESS_TOKEN_KEY =
    "secure_review_access_token";


// ======================================================
// TOKEN HELPERS
// ======================================================

export function getAccessToken() {

    return sessionStorage.getItem(
        ACCESS_TOKEN_KEY
    );
}


export function saveAccessToken(token) {

    sessionStorage.setItem(
        ACCESS_TOKEN_KEY,
        token
    );
}


export function removeAccessToken() {

    sessionStorage.removeItem(
        ACCESS_TOKEN_KEY
    );
}


// ======================================================
// CENTRAL API REQUEST
// ======================================================

export async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        getAccessToken();


    const headers = {
        ...(options.headers || {})
    };


    // --------------------------------------------------
    // ADD JSON CONTENT TYPE
    //
    // Do NOT add for FormData.
    // Browser must generate multipart boundary.
    // --------------------------------------------------

    if (
        options.body &&
        !(options.body instanceof FormData)
    ) {

        headers["Content-Type"] =
            "application/json";
    }


    // --------------------------------------------------
    // ADD JWT
    // --------------------------------------------------

    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;
    }


    // --------------------------------------------------
    // SEND REQUEST
    // --------------------------------------------------

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );


    // --------------------------------------------------
    // PARSE RESPONSE SAFELY
    // --------------------------------------------------

    let data = null;


    try {

        data = await response.json();

    } catch {

        data = null;
    }


    // --------------------------------------------------
    // HANDLE ERRORS
    // --------------------------------------------------

    if (!response.ok) {

        // Token invalid / expired
        if (response.status === 401) {

            removeAccessToken();
        }


        throw new Error(
            data?.detail ||
            data?.message ||
            "Request failed"
        );
    }


    return data;
}