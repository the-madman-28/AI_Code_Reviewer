import {
    apiRequest
} from "./apiClient";


export function getProjectFiles(
    projectId
) {

    return apiRequest(
        `/projects/${projectId}/files`,
        {
            method: "GET"
        }
    );
}


export function getSourceFile(
    projectId,
    fileId
) {

    return apiRequest(
        `/projects/${projectId}/files/${fileId}`,
        {
            method: "GET"
        }
    );
}


export function uploadSourceFile(
    projectId,
    file
) {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    return apiRequest(
        `/projects/${projectId}/files`,
        {
            method: "POST",

            body: formData
        }
    );
}


export function deleteSourceFile(
    projectId,
    fileId
) {

    return apiRequest(
        `/projects/${projectId}/files/${fileId}`,
        {
            method: "DELETE"
        }
    );
}