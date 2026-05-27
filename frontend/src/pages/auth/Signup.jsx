import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

import FormWrapper from "../../components/reusableComponents/FormWrapper";
import Input from "../../components/reusableComponents/Input";
import Button from "../../components/reusableComponents/Button";
import { signup } from "../../services/api/authService";

const Signup = () => {
    const methods = useForm();
    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();
    
    const handleSubmit = async (data) => {
        if (!executeRecaptcha) {
            toast.error("ReCAPTCHA is not ready yet");
            return;
        }

        try{
            // Generate the v3 token programmatically
            const token = await executeRecaptcha("signup");
            // Add it to the data payload
            data.gRecaptchaToken = token;

            const response = await signup(data);
            if(response?.success){
                toast.success(response?.message);
                navigate("/signin");
            }else{
                toast.error(response?.message);
            }
        }catch(error){
            toast.error(error?.message);
        }
    };

    return (
        <section>
            <FormWrapper methods={methods} onSubmit={handleSubmit} title="Sign Up" description="Create your account">
                    <Input
                        label="Full Name"
                        type="text"
                        name="name"
                        rules={{
                            required: "Full name is required",
                            pattern: {
                                value: /^[A-Za-z ]+$/,
                                message: "Only alphabets and space are allowed",
                            },
                        }}
                        autoComplete="name"
                    />
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
                        autoComplete="new-password"
                    />

                    {/* V3 ReCAPTCHA is invisible, so we don't need a UI widget here! */}
                    <div className="text-xs text-gray-500 mt-2">
                        This site is protected by reCAPTCHA and the Google <Link to="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Privacy Policy</Link> and <Link to="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Terms of Service</Link> apply.
                    </div>

                    <Button type="submit">Sign Up</Button>
            </FormWrapper>
        </section>
    )
}

export default Signup;