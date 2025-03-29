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

    // password validation logic to match django's requirements including UserAttributeSimilarityValidator
    const passwordValidation = Yup.string()
        .min(8, "Password must be at least 8 characters long")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/\d/, "Password must contain at least one number")
        .matches(/[\W_]/, "Password must contain at least one special character")
        .notOneOf(["password", "12345678", "qwerty123"], "Password is too common")
        .test(
            "not-similar",
            "Password is too similar to username or email",
            function (value) {
                const { username, email } = this.parent;
                if (!value || !username || !email) return true;

                const lowerPass = value.toLowerCase();
                const lowerUsername = username.toLowerCase();
                const lowerEmail = email.split("@")[0].toLowerCase();

                if (lowerPass === lowerUsername || lowerPass === lowerEmail) {
                    return false;
                }

                if (lowerPass.includes(lowerUsername) || lowerPass.includes(lowerEmail)) {
                    return false;
                }

                const levenshteinDistance = (a, b) => {
                    const dp = Array(a.length + 1)
                        .fill(null)
                        .map(() => Array(b.length + 1).fill(null));

                    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
                    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

                    for (let i = 1; i <= a.length; i++) {
                        for (let j = 1; j <= b.length; j++) {
                            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                            dp[i][j] = Math.min(
                                dp[i - 1][j] + 1,
                                dp[i][j - 1] + 1,
                                dp[i - 1][j - 1] + cost
                            );
                        }
                    }
                    return dp[a.length][b.length];
                };

                if (levenshteinDistance(lowerPass, lowerUsername) <= 2) return false;
                if (levenshteinDistance(lowerPass, lowerEmail) <= 2) return false;

                return true;
            }
        )
        .required("Password is required");

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
            password: passwordValidation,
            password2: Yup.string()
                .oneOf([Yup.ref("password"), null], "Passwords must match")
                .required("Please confirm your password"),
            first_name: Yup.string(),
            last_name: Yup.string(),
            bio: Yup.string(),
            birth_date: Yup.date(),
            profile_pic: Yup.mixed().nullable()
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
                                            onChange={(event) => {
                                                const file = event.target.files[0] || null;
                                                formik.setFieldValue("profile_pic", file);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

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
