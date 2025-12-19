import { useState } from "react";
import { signup, login } from "../../api";
import '../../styles/auth.css'

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

  const handleSignup = async () => {
    try {
      const user = await signup(signupData);
      localStorage.setItem("user", JSON.stringify(user));
      onAuth(user);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await login(loginData);
      localStorage.setItem("user", JSON.stringify(user));
      onAuth(user);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* signup page */}
        <div className="auth-section">
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

          <button className="primary" onClick={handleSignup}>
            Create Account
          </button>
        </div>

        {/* middle line */}
        <div className="divider" />

        {/* login page */}
        <div className="auth-section">
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

          <button className="primary" onClick={handleLogin}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
