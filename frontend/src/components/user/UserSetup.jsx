import { useState } from "react";
import { createUser } from "../../api";

function UserSetup({ onUserCreated }) {
  const [name, setName] = useState("");

  const handleCreateUser = async () => {
    if (!name) return;

    const data = await createUser(name);
    localStorage.setItem("user", JSON.stringify(data));
    onUserCreated(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>PerPerson</h1>

      <input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleCreateUser}>
        Create User
      </button>
    </div>
  );
}

export default UserSetup;
