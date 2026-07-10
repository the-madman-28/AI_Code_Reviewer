import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import {
    getSourceFile
} from "../api/fileApi";

import LoadingSpinner
    from "../components/LoadingSpinner";


function SourceViewer() {

    const {
        projectId,
        fileId
    } = useParams();


    const [sourceFile, setSourceFile] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        async function loadFile() {

            try {

                const data =
                    await getSourceFile(
                        projectId,
                        fileId
                    );


                setSourceFile(
                    data.file
                );

            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        }


        loadFile();

    }, [
        projectId,
        fileId
    ]);


    if (loading) {

        return <LoadingSpinner />;
    }


    if (error) {

        return (
            <div className="alert error">
                {error}
            </div>
        );
    }


    return (
        <section>

            <div className="page-header">

                <div>
                    <h1>
                        {sourceFile.filename}
                    </h1>

                    <p>
                        {sourceFile.language}
                        {" • "}
                        {sourceFile.size_bytes}
                        {" bytes"}
                    </p>
                </div>


                <Link
                    to={`/projects/${projectId}`}
                    className="secondary-button"
                >
                    Back to Project
                </Link>

            </div>


            <div className="source-meta">

                <span>
                    SHA-256
                </span>

                <code>
                    {sourceFile.sha256}
                </code>

            </div>


            <div className="code-viewer">

                <pre>
                    <code>
                        {sourceFile.content}
                    </code>
                </pre>

            </div>

        </section>
    );
}


export default SourceViewer;