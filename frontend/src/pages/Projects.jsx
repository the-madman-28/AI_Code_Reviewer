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

import ProjectCard
    from "../components/ProjectCard";

import LoadingSpinner
    from "../components/LoadingSpinner";


function Projects() {

    const [projects, setProjects] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        async function loadProjects() {

            try {

                const data =
                    await getProjects();


                setProjects(
                    data.projects || []
                );

            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        }


        loadProjects();

    }, []);


    if (loading) {

        return <LoadingSpinner />;
    }


    return (
        <section>

            <div className="page-header">

                <div>
                    <h1>
                        Projects
                    </h1>

                    <p>
                        Manage your secure code
                        review workspaces.
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


            {projects.length === 0 ? (

                <div className="empty-state">

                    <h3>
                        No projects found
                    </h3>

                    <p>
                        Create a project to begin.
                    </p>

                </div>

            ) : (

                <div className="project-grid">

                    {projects.map(
                        (project) => (

                            <ProjectCard
                                key={project.id}
                                project={project}
                            />

                        )
                    )}

                </div>

            )}

        </section>
    );
}


export default Projects;