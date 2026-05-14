import { useState } from "react";
import { signup, login } from "../../api";
import { toast } from "react-toastify";
import "../../styles/auth.css";

function AuthPage({ onAuth }) {
  const [signupData, setSignupData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  /* ======================
     SIGNUP
     ====================== */
  const handleSignup = async (e) => {
    e.preventDefault();

    const { first_name, last_name, email, password } = signupData;

    if (!first_name || !last_name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      const user = await signup(signupData);
      localStorage.setItem("user", JSON.stringify(user));
      onAuth(user);
      toast.success("Account created successfully");
    } catch (err) {
      if (err.status === 422) {
        toast.error("All fields are required");
      } else {
        toast.error(err?.message || "Signup failed");
      }
    }
  };

  /* ======================
     LOGIN
     ====================== */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const user = await login(loginData);
      localStorage.setItem("user", JSON.stringify(user));
      onAuth(user);
      toast.success("Logged in successfully");
    } 
    catch (err) {
      toast.error(err?.message || "Invalid email or password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ================= SIGNUP FORM ================= */}
        <form className="auth-section" onSubmit={handleSignup}>
          <h2>Create account</h2>

          <div className="row">
            <input
              placeholder="First name"
              value={signupData.first_name}
              onChange={(e) =>
                setSignupData({
                  ...signupData,
                  first_name: e.target.value,
                })
              }
            />

            <input
              placeholder="Last name"
              value={signupData.last_name}
              onChange={(e) =>
                setSignupData({
                  ...signupData,
                  last_name: e.target.value,
                })
              }
            />
          </div>

          <input
            placeholder="Email"
            value={signupData.email}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={signupData.password}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                password: e.target.value,
              })
            }
          />

          <button className="btn btn-primary" type="submit">
            Create Account
          </button>
        </form>

        {/* middle divider */}
        <div className="divider" />

        {/* ================= LOGIN FORM ================= */}
        <form className="auth-section" onSubmit={handleLogin}>
          <h2>Login</h2>

          <input
            placeholder="Email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({
                ...loginData,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({
                ...loginData,
                password: e.target.value,
              })
            }
          />

          <button className="btn btn-primary" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
