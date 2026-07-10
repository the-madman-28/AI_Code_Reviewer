import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    createProject
} from "../api/projectApi";


function CreateProject() {

    const navigate =
        useNavigate();


    const [name, setName] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [
        primaryLanguage,
        setPrimaryLanguage
    ] = useState("python");

    const [error, setError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");

        setSubmitting(true);


        try {

            const data =
                await createProject({
                    name,
                    description,

                    primary_language:
                        primaryLanguage
                });


            navigate(
                `/projects/${data.project.id}`
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
        <section>

            <div className="page-header">

                <div>
                    <h1>
                        Create Project
                    </h1>

                    <p>
                        Create a secure workspace
                        for source-code review.
                    </p>
                </div>

            </div>


            <div className="form-card">

                {error && (
                    <div className="alert error">
                        {error}
                    </div>
                )}


                <form
                    onSubmit={handleSubmit}
                    className="standard-form"
                >

                    <label>
                        Project Name

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            placeholder="Python Security Scanner"
                            required
                        />
                    </label>


                    <label>
                        Description

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            placeholder={
                                "Describe the project..."
                            }
                            rows="5"
                        />
                    </label>


                    <label>
                        Primary Language

                        <select
                            value={primaryLanguage}
                            onChange={(event) =>
                                setPrimaryLanguage(
                                    event.target.value
                                )
                            }
                        >
                            <option value="python">
                                Python
                            </option>

                            <option value="javascript">
                                JavaScript
                            </option>

                            <option value="cpp">
                                C++
                            </option>
                        </select>
                    </label>


                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    "/projects"
                                )
                            }
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="primary-button"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Creating..."
                                : "Create Project"}
                        </button>

                    </div>

                </form>

            </div>

        </section>
    );
}


export default CreateProject;