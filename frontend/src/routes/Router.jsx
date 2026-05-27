import { createBrowserRouter } from "react-router-dom";
import Signup from "../pages/auth/Signup";
import Signin from "../pages/auth/Signin"
import Layout from "../components/layout/Layout";

const Router = createBrowserRouter([
    {
        path:"/",
        element:<Layout/>,
        children:[
            {
                path:"/signup",
                element:<Signup/>
            },
            {
                path:"/signin",
                element:<Signin/>
            },

        ]
    }
])

export default Router;