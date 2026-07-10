import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    getProjects
} from "../api/projectApi";

import {
    getProjectFiles
} from "../api/fileApi";

import {
    useAuth
} from "../context/AuthContext";

import ProjectCard
    from "../components/ProjectCard";

import LoadingSpinner
    from "../components/LoadingSpinner";


function Dashboard() {

    const {
        user
    } = useAuth();


    const [projects, setProjects] =
        useState([]);

    const [totalFiles, setTotalFiles] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        async function loadDashboard() {

            try {

                const projectData =
                    await getProjects();


                const projectList =
                    projectData.projects || [];


                setProjects(
                    projectList
                );


                // Count files across owned projects
                const fileResponses =
                    await Promise.all(

                        projectList.map(
                            (project) =>
                                getProjectFiles(
                                    project.id
                                )
                        )

                    );


                const count =
                    fileResponses.reduce(
                        (total, response) =>
                            total +
                            (
                                response.total_files || 0
                            ),
                        0
                    );


                setTotalFiles(
                    count
                );

            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        }


        loadDashboard();

    }, []);


    if (loading) {

        return <LoadingSpinner />;
    }


    return (
        <section>

            <div className="page-header">

                <div>
                    <h1>
                        Welcome back, {user?.name}
                    </h1>

                    <p>
                        Manage projects and review
                        uploaded source code.
                    </p>
                </div>


                <Link
                    to="/projects/new"
                    className="primary-button"
                >
                    New Project
                </Link>

            </div>


            {error && (
                <div className="alert error">
                    {error}
                </div>
            )}


            <div className="stats-grid">

                <div className="stat-card">
                    <span>
                        Total Projects
                    </span>

                    <strong>
                        {projects.length}
                    </strong>
                </div>


                <div className="stat-card">
                    <span>
                        Source Files
                    </span>

                    <strong>
                        {totalFiles}
                    </strong>
                </div>


                <div className="stat-card">
                    <span>
                        Security Scans
                    </span>

                    <strong>
                        0
                    </strong>
                </div>


                <div className="stat-card">
                    <span>
                        Open Findings
                    </span>

                    <strong>
                        0
                    </strong>
                </div>

            </div>


            <div className="section-heading">

                <div>
                    <h2>
                        Recent Projects
                    </h2>

                    <p>
                        Your latest secure review
                        workspaces.
                    </p>
                </div>


                <Link
                    to="/projects"
                    className="text-link"
                >
                    View all
                </Link>

            </div>


            {projects.length === 0 ? (

                <div className="empty-state">

                    <h3>
                        No projects yet
                    </h3>

                    <p>
                        Create your first project
                        to begin uploading source code.
                    </p>

                    <Link
                        to="/projects/new"
                        className="primary-button"
                    >
                        Create Project
                    </Link>

                </div>

            ) : (

                <div className="project-grid">

                    {projects
                        .slice(0, 3)
                        .map((project) => (

                            <ProjectCard
                                key={project.id}
                                project={project}
                            />

                        ))}

                </div>

            )}

        </section>
    );
}


export default Dashboard;