import { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { registerUser } from "../services/userService";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Register() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: "",
            email: "",
            password: "",
            password2: "",
            first_name: "",
            last_name: "",
            bio: "",
            birth_date: "",
            profile_pic: null
        },
        validationSchema: Yup.object({
            username: Yup.string().required("Username is required"),
            email: Yup.string().email("Invalid email address").required("Email is required"),
            password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
            password2: Yup.string()
                .oneOf([Yup.ref("password"), null], "Passwords must match")
                .required("Confirm Password is required"),
            first_name: Yup.string(),
            last_name: Yup.string(),
            bio: Yup.string(),
            birth_date: Yup.date(),
            profile_pic: Yup.mixed()
        }),
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const tokens = await registerUser(values);
                login(tokens.access, tokens.refresh);
                navigate("/");
            } catch (err) {
                setErrors({ submit: "Registration failed. Please try again." });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm p-4">
                        <h2 className="text-center">Register</h2>
                        {formik.errors.submit && <p className="text-danger text-center">{formik.errors.submit}</p>}
                        <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                            <div className="row">
                                {/* Left Column */}
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Username</label>
                                        <input type="text" className="form-control" {...formik.getFieldProps("username")} />
                                        {formik.touched.username && formik.errors.username && (
                                            <div className="text-danger">{formik.errors.username}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" {...formik.getFieldProps("email")} />
                                        {formik.touched.email && formik.errors.email && (
                                            <div className="text-danger">{formik.errors.email}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input type="password" className="form-control" {...formik.getFieldProps("password")} />
                                        {formik.touched.password && formik.errors.password && (
                                            <div className="text-danger">{formik.errors.password}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm Password</label>
                                        <input type="password" className="form-control" {...formik.getFieldProps("password2")} />
                                        {formik.touched.password2 && formik.errors.password2 && (
                                            <div className="text-danger">{formik.errors.password2}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">First Name</label>
                                        <input type="text" className="form-control" {...formik.getFieldProps("first_name")} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input type="text" className="form-control" {...formik.getFieldProps("last_name")} />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Bio</label>
                                        <textarea className="form-control" {...formik.getFieldProps("bio")} rows="3"></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Birth Date</label>
                                        <input type="date" className="form-control" {...formik.getFieldProps("birth_date")} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Profile Picture</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={(event) => formik.setFieldValue("profile_pic", event.target.files[0])}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Register Button */}
                            <div className="text-center mt-4">
                                <button type="submit" className="btn btn-primary w-50" disabled={formik.isSubmitting}>
                                    {formik.isSubmitting ? "Registering..." : "Register"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
