import {
    NavLink,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


function Sidebar() {

    const navigate =
        useNavigate();

    const {
        logout
    } = useAuth();


    function handleLogout() {

        logout();

        navigate(
            "/login",
            {
                replace: true
            }
        );
    }


    return (
        <aside className="sidebar">

            <div className="sidebar-brand">

                <div className="brand-icon">
                    SR
                </div>

                <div>
                    <strong>
                        SecureReview
                    </strong>

                    <span>
                        Security Platform
                    </span>
                </div>

            </div>


            <nav className="sidebar-nav">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-item active"
                            : "nav-item"
                    }
                >
                    Dashboard
                </NavLink>


                <NavLink
                    to="/projects"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-item active"
                            : "nav-item"
                    }
                >
                    Projects
                </NavLink>


                <NavLink
                    to="/projects/new"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-item active"
                            : "nav-item"
                    }
                >
                    New Project
                </NavLink>


                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive
                            ? "nav-item active"
                            : "nav-item"
                    }
                >
                    Profile
                </NavLink>

            </nav>


            <button
                className="logout-button"
                onClick={handleLogout}
            >
                Logout
            </button>

        </aside>
    );
}


export default Sidebar;