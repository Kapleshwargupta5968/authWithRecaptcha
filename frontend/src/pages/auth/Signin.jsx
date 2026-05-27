import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import FormWrapper from "../../components/reusableComponents/FormWrapper";
import Input from "../../components/reusableComponents/Input";
import Button from "../../components/reusableComponents/Button";
import { signin } from "../../services/api/authService";
import { authStart, authSuccess, authFailure } from "../../features/authSlice";

const Signin = () => {
    const methods = useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { executeRecaptcha } = useGoogleReCaptcha();
    
    const handleSubmit = async (data) => {
        if (!executeRecaptcha) {
            toast.error("ReCAPTCHA is not ready yet");
            return;
        }

        try {
            dispatch(authStart());
            
            // Generate the v3 token programmatically
            const token = await executeRecaptcha("signin");
            data.gRecaptchaToken = token;

            const response = await signin(data);

            if (response?.success) {
                dispatch(authSuccess({ user: response?.user }));
                toast.success(response?.message || "Logged in successfully");
                navigate("/"); // Redirect to home/dashboard
            } else {
                dispatch(authFailure(response?.message));
                toast.error(response?.message);
            }
        } catch (error) {
            dispatch(authFailure(error?.message));
            toast.error(error?.message);
        }
    };

    return (
        <section>
            <FormWrapper methods={methods} onSubmit={handleSubmit} title="Sign In" description="Welcome back to your account">
                <Input
                    label="Email"
                    type="email"
                    name="email"
                    rules={{
                        required: "Email is required",
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Invalid email address",
                        },
                    }}
                    autoComplete="email"
                />
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    rules={{
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters long",
                        },
                    }}
                    autoComplete="current-password"
                />

                <div className="text-xs text-gray-500 mt-2">
                    This site is protected by reCAPTCHA and the Google <Link to="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Privacy Policy</Link> and <Link to="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Terms of Service</Link> apply.
                </div>

                <Button type="submit">Sign In</Button>
            </FormWrapper>
        </section>
    )
}

export default Signin;
