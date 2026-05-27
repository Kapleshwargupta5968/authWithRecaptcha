import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
    const navItems = {
        public:[
            {id:1,name:"Home",path:"/"},
            {id:2,name:"Signup",path:"/signup"},
            {id:3,name:"Signin",path:"/signin"},
            {id:4,name:"About",path:"/about"}
        ],
        private:[
            {id:1,name:"Dashboard",path:"/dashboard"},
            {id:2,name:"Logout",path:"/logout"},
            {id:3,name:"About",path:"/about"}
        ]
    };

    const {user, isAuthenticated} = useSelector((state) => state.auth);
    return (
        <>
        <header>
            <nav>
                {
                    user && isAuthenticated ? (
                        navItems.private.map((item) => (
                            <NavLink key={item.id} to={item.path}>
                                {item.name}
                            </NavLink>
                        ))
                    ) : (
                        navItems.public.map((item) => (
                            <NavLink key={item.id} to={item.path}>
                                {item.name}
                            </NavLink>
                        ))
                    )
                }
            </nav>
        </header>
        </>
    )
}

export default Header;