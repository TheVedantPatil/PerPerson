import { useEffect, useState } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import AuthPage from "./components/auth/AuthPage";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  // 🔴 LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // If not logged in → show auth
  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }

  // Logged in → dashboard
  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;
