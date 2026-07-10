import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Layout
    from "./components/Layout";

import ProtectedRoute
    from "./components/ProtectedRoute";

import CreateProject
    from "./pages/CreateProject";

import Dashboard
    from "./pages/Dashboard";

import Login
    from "./pages/Login";

import Profile
    from "./pages/Profile";

import ProjectDetails
    from "./pages/ProjectDetails";

import Projects
    from "./pages/Projects";

import Register
    from "./pages/Register";

import SourceViewer
    from "./pages/SourceViewer";


function App() {

    return (
        <Routes>

            {/* PUBLIC ROUTES */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* PROTECTED APPLICATION */}

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />


                <Route
                    path="/projects"
                    element={<Projects />}
                />


                <Route
                    path="/projects/new"
                    element={<CreateProject />}
                />


                <Route
                    path="/projects/:projectId"
                    element={<ProjectDetails />}
                />


                <Route
                    path={
                        "/projects/:projectId/files/:fileId"
                    }
                    element={<SourceViewer />}
                />


                <Route
                    path="/profile"
                    element={<Profile />}
                />

            </Route>


            {/* DEFAULT */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />


            {/* UNKNOWN ROUTE */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>
    );
}


export default App;