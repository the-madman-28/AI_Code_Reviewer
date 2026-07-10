import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    deleteProject,
    getProject
} from "../api/projectApi";

import {
    deleteSourceFile,
    getProjectFiles,
    uploadSourceFile
} from "../api/fileApi";

import LoadingSpinner
    from "../components/LoadingSpinner";


function ProjectDetails() {

    const {
        projectId
    } = useParams();


    const navigate =
        useNavigate();


    const fileInputRef =
        useRef(null);


    const [project, setProject] =
        useState(null);

    const [files, setFiles] =
        useState([]);

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    async function loadProjectData() {

        const [
            projectData,
            fileData
        ] = await Promise.all([

            getProject(projectId),

            getProjectFiles(projectId)

        ]);


        setProject(
            projectData.project
        );


        setFiles(
            fileData.files || []
        );
    }


    useEffect(() => {

        async function initialize() {

            try {

                await loadProjectData();

            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        }


        initialize();

    }, [projectId]);


    async function handleUpload(event) {

        event.preventDefault();


        if (!selectedFile) {

            setError(
                "Please choose a source file"
            );

            return;
        }


        setError("");

        setSuccess("");

        setUploading(true);


        try {

            const data =
                await uploadSourceFile(
                    projectId,
                    selectedFile
                );


            setSuccess(
                data.message
            );


            setSelectedFile(null);


            if (fileInputRef.current) {

                fileInputRef.current.value =
                    "";
            }


            await loadProjectData();

        } catch (error) {

            setError(
                error.message
            );

        } finally {

            setUploading(false);
        }
    }


    async function handleDeleteFile(
        fileId
    ) {

        const confirmed =
            window.confirm(
                "Delete this source file?"
            );


        if (!confirmed) {

            return;
        }


        try {

            await deleteSourceFile(
                projectId,
                fileId
            );


            setFiles(
                (currentFiles) =>
                    currentFiles.filter(
                        (file) =>
                            file.id !== fileId
                    )
            );

        } catch (error) {

            setError(
                error.message
            );
        }
    }


    async function handleDeleteProject() {

        const confirmed =
            window.confirm(
                "Delete this project and its files?"
            );


        if (!confirmed) {

            return;
        }


        try {

            await deleteProject(
                projectId
            );


            navigate(
                "/projects"
            );

        } catch (error) {

            setError(
                error.message
            );
        }
    }


    if (loading) {

        return <LoadingSpinner />;
    }


    if (!project) {

        return (
            <div className="empty-state">
                <h3>
                    Project unavailable
                </h3>

                <p>
                    {error ||
                        "Project not found"}
                </p>
            </div>
        );
    }


    return (
        <section>

            <div className="page-header">

                <div>
                    <span className="language-badge">
                        {project.primary_language}
                    </span>

                    <h1>
                        {project.name}
                    </h1>

                    <p>
                        {project.description ||
                            "No description provided."}
                    </p>
                </div>


                <button
                    className="danger-button"
                    onClick={
                        handleDeleteProject
                    }
                >
                    Delete Project
                </button>

            </div>


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


            <div className="upload-card">

                <div>
                    <h2>
                        Upload Source Code
                    </h2>

                    <p>
                        Allowed: .py, .js, .jsx,
                        .mjs, .cjs, .cpp, .cc,
                        .cxx, .h, .hpp
                    </p>
                </div>


                <form
                    onSubmit={handleUpload}
                    className="upload-form"
                >

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={
                            ".py,.js,.jsx,.mjs,.cjs,.cpp,.cc,.cxx,.h,.hpp"
                        }
                        onChange={(event) =>
                            setSelectedFile(
                                event.target.files[0] ||
                                null
                            )
                        }
                    />


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={uploading}
                    >
                        {uploading
                            ? "Uploading..."
                            : "Upload File"}
                    </button>

                </form>

            </div>


            <div className="section-heading">

                <div>
                    <h2>
                        Source Files
                    </h2>

                    <p>
                        {files.length} uploaded file(s)
                    </p>
                </div>

            </div>


            {files.length === 0 ? (

                <div className="empty-state">

                    <h3>
                        No source files
                    </h3>

                    <p>
                        Upload vulnerable.py or
                        another supported source file.
                    </p>

                </div>

            ) : (

                <div className="file-table-wrapper">

                    <table className="file-table">

                        <thead>
                            <tr>
                                <th>
                                    Filename
                                </th>

                                <th>
                                    Language
                                </th>

                                <th>
                                    Size
                                </th>

                                <th>
                                    Actions
                                </th>
                            </tr>
                        </thead>


                        <tbody>

                            {files.map(
                                (file) => (

                                    <tr key={file.id}>

                                        <td>
                                            <strong>
                                                {file.filename}
                                            </strong>
                                        </td>


                                        <td>
                                            {file.language}
                                        </td>


                                        <td>
                                            {file.size_bytes}
                                            {" "}bytes
                                        </td>


                                        <td className="table-actions">

                                            <Link
                                                to={
                                                    `/projects/${projectId}/files/${file.id}`
                                                }
                                                className="small-button"
                                            >
                                                Open
                                            </Link>


                                            <button
                                                className="small-button danger"
                                                onClick={() =>
                                                    handleDeleteFile(
                                                        file.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </section>
    );
}


export default ProjectDetails;