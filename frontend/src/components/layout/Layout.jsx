import Header from "../sheared/Header"
import Footer from "../sheared/Footer"
import { Outlet } from "react-router-dom"
const Layout = () => {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col border-inline-4">
                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet />
                    </div>
                </main>
                <Footer />
            </div>
        </>
    )
}

export default Layout