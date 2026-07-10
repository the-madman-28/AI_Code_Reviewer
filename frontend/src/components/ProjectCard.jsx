import {
    Link
} from "react-router-dom";


function ProjectCard({
    project
}) {

    return (
        <article className="project-card">

            <div className="project-card-top">

                <span className="language-badge">
                    {project.primary_language}
                </span>

                <span className="project-id">
                    #{project.id}
                </span>

            </div>


            <h3>
                {project.name}
            </h3>


            <p>
                {project.description ||
                    "No description provided."}
            </p>


            <div className="project-card-footer">

                <span>
                    {new Date(
                        project.created_at
                    ).toLocaleDateString()}
                </span>


                <Link
                    to={`/projects/${project.id}`}
                    className="text-link"
                >
                    Open Project
                </Link>

            </div>

        </article>
    );
}


export default ProjectCard;