import {
    Outlet
} from "react-router-dom";

import Navbar
    from "./Navbar";

import Sidebar
    from "./Sidebar";


function Layout() {

    return (
        <div className="app-shell">

            <Sidebar />


            <div className="main-area">

                <Navbar />


                <main className="page-content">

                    <Outlet />

                </main>

            </div>

        </div>
    );
}


export default Layout;