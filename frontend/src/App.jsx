import { useEffect, useState } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import AuthPage from "./components/auth/AuthPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) return null; // ✅ prevents auth flash

  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
