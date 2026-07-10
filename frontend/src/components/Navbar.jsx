import {
    useAuth
} from "../context/AuthContext";


function Navbar() {

    const {
        user
    } = useAuth();


    return (
        <header className="navbar">

            <div>
                <h2 className="navbar-title">
                    SecureReview AI
                </h2>

                <p className="navbar-subtitle">
                    AI-Powered Secure Code Review
                </p>
            </div>


            <div className="navbar-user">

                <div className="user-avatar">
                    {user?.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                </div>


                <div>
                    <strong>
                        {user?.name}
                    </strong>

                    <span>
                        {user?.role}
                    </span>
                </div>

            </div>

        </header>
    );
}


export default Navbar;