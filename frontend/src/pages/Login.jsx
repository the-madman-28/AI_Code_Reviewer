import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


function Login() {

    const navigate =
        useNavigate();

    const {
        login,
        isAuthenticated
    } = useAuth();


    const [userId, setUserId] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    useEffect(() => {

        if (isAuthenticated) {

            navigate(
                "/dashboard",
                {
                    replace: true
                }
            );
        }

    }, [
        isAuthenticated,
        navigate
    ]);


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");

        setSubmitting(true);


        try {

            await login(
                userId,
                password
            );


            navigate(
                "/dashboard",
                {
                    replace: true
                }
            );

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setSubmitting(false);
        }
    }


    return (
        <div className="auth-page">

            <div className="auth-panel">

                <div className="auth-brand">
                    <div className="brand-icon large">
                        SR
                    </div>

                    <h1>
                        SecureReview AI
                    </h1>

                    <p>
                        AI-powered secure code
                        review platform
                    </p>
                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <h2>
                        Welcome back
                    </h2>

                    <p className="muted-text">
                        Sign in to continue reviewing
                        your projects.
                    </p>


                    {error && (
                        <div className="alert error">
                            {error}
                        </div>
                    )}


                    <label>
                        User ID

                        <input
                            type="text"
                            value={userId}
                            onChange={(event) =>
                                setUserId(
                                    event.target.value
                                )
                            }
                            placeholder="EMP123"
                            required
                        />
                    </label>


                    <label>
                        Password

                        <div className="password-field">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter password"
                                required
                            />


                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>
                    </label>


                    <button
                        type="submit"
                        className="primary-button full-width"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Signing in..."
                            : "Sign In"}
                    </button>


                    <p className="auth-switch">
                        Don't have an account?{" "}

                        <Link to="/register">
                            Register
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    );
}


export default Login;