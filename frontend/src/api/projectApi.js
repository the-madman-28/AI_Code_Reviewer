import {
    apiRequest
} from "./apiClient";


export function getProjects() {

    return apiRequest(
        "/projects",
        {
            method: "GET"
        }
    );
}


export function getProject(
    projectId
) {

    return apiRequest(
        `/projects/${projectId}`,
        {
            method: "GET"
        }
    );
}


export function createProject(
    projectData
) {

    return apiRequest(
        "/projects",
        {
            method: "POST",

            body: JSON.stringify(
                projectData
            )
        }
    );
}


export function updateProject(
    projectId,
    projectData
) {

    return apiRequest(
        `/projects/${projectId}`,
        {
            method: "PATCH",

            body: JSON.stringify(
                projectData
            )
        }
    );
}


export function deleteProject(
    projectId
) {

    return apiRequest(
        `/projects/${projectId}`,
        {
            method: "DELETE"
        }
    );
}