import { Provider } from "react-redux";
import { store } from "./app/store";
import { RouterProvider } from "react-router-dom";
import Routers from "./routes/Router";
import { createRoot } from 'react-dom/client'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import config from './config/config';
import './index.css'

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        {/* <Toaster position="top-center" duration={2000} /> */}
        <GoogleReCaptchaProvider reCaptchaKey={config.siteKey}>
            <RouterProvider router={Routers} />
        </GoogleReCaptchaProvider>
    </Provider>
)
