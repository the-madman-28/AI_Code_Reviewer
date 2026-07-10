import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    registerUser
} from "../api/authApi";


function Register() {

    const navigate =
        useNavigate();


    const [name, setName] =
        useState("");

    const [userId, setUserId] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");

        setSuccess("");

        setSubmitting(true);


        try {

            const data =
                await registerUser({
                    name,
                    user_id: userId,
                    password
                });


            setSuccess(
                data.message
            );


            setTimeout(() => {

                navigate(
                    "/login"
                );

            }, 1000);

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
                        Create your security
                        workspace
                    </p>

                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <h2>
                        Create account
                    </h2>


                    {error && (
                        <div className="alert error">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="alert success">
                            {success}
                        </div>
                    )}


                    <label>
                        Name

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            placeholder="Your name"
                            required
                        />
                    </label>


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

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="Create password"
                            required
                        />
                    </label>


                    <button
                        type="submit"
                        className="primary-button full-width"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Creating..."
                            : "Create Account"}
                    </button>


                    <p className="auth-switch">
                        Already registered?{" "}

                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    );
}


export default Register;