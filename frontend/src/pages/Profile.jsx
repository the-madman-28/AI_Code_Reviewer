import {
    useAuth
} from "../context/AuthContext";


function Profile() {

    const {
        user
    } = useAuth();


    return (
        <section>

            <div className="page-header">

                <div>
                    <h1>
                        Profile
                    </h1>

                    <p>
                        Current authenticated
                        account information.
                    </p>
                </div>

            </div>


            <div className="profile-card">

                <div className="profile-avatar">
                    {user?.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                </div>


                <div className="profile-details">

                    <div>
                        <span>
                            Name
                        </span>

                        <strong>
                            {user?.name}
                        </strong>
                    </div>


                    <div>
                        <span>
                            User ID
                        </span>

                        <strong>
                            {user?.user_id}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Role
                        </span>

                        <strong>
                            {user?.role}
                        </strong>
                    </div>

                </div>

            </div>

        </section>
    );
}


export default Profile;