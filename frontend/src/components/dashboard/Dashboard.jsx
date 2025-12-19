// This is the dashboard of the app 

import { useEffect, useState } from "react";
import {
  getUserGroups,
  joinGroup,
  createGroup,
  getGroupBalances,
} from "../../api";
import GroupList from "./GroupList";
import GroupPage from "../group/GroupPage";
import "../../styles/dashboard.css";




function Dashboard({ user, onLogout }) {
  const [groups, setGroups] = useState([]);
  const [groupBalances, setGroupBalances] = useState({});
  const [joinCode, setJoinCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  // load groups and balances
  useEffect(() => {
    async function loadData() {
      const userGroups = await getUserGroups(user.user_id);
      setGroups(userGroups);

      const balancesMap = {};
      for (const group of userGroups) {
        const balances = await getGroupBalances(group.group_id);
        balancesMap[group.group_id] = balances;
      }
      setGroupBalances(balancesMap);
    }

    loadData();
  }, [user]);

  // calculate totals
  let totalOwed = 0;
  let totalOwe = 0;

  groups.forEach((group) => {
    const balances = groupBalances[group.group_id];
    if (!balances) return;

    const myBalance = balances[user.user_id] || 0;

    if (myBalance > 0) {
      totalOwed += myBalance;
    } else {
      totalOwe += Math.abs(myBalance);
    }
  });

  if (selectedGroup) {
    return (
      <GroupPage
        group={selectedGroup}
        user={user}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="dashboard-root">
      {/* header */}
      <header className="header">
        <div className="container nav">
          <div className="logo">PerPerson</div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* main content */}
      <main className="dashboard-content">
        <div className="container">

          {/* dashboard card */}
          <div className="summary-card">
            <div className="user-details">
              <h2> {user.first_name} {user.last_name}</h2>
              <p> Your ID: <strong>{user.user_id}</strong> </p>
            </div>

            <div className="summary-split">
              <div>
                <p>You are owed</p>
                <strong>₹ {totalOwed.toFixed(2)}</strong>
              </div>
              
              <div className="divider" />

              <div>
                <p>You owe</p>
                <strong>₹ {totalOwe.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* create and join groups */}
          <div className="action-grid">
            {/* create group */}
            <div className="card action-card">
              <h4>Create Group</h4>
              <input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!groupName) return;
                  const newGroup = await createGroup(groupName, user.user_id);
                  setGroups((prev) => [...prev, newGroup]);
                  setGroupName("");
                }}
              >
                Create
              </button>
            </div>

            {/* join group */}
            <div className="card action-card">
              <h4>Join Group</h4>
              <input
                placeholder="Enter group code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!joinCode) return;
                  await joinGroup(user.user_id, joinCode);
                  const updated = await getUserGroups(user.user_id);
                  setGroups(updated);

                  const balancesMap = {};
                  for (const g of updated) {
                    balancesMap[g.group_id] = await getGroupBalances(
                      g.group_id
                    );
                  }
                  setGroupBalances(balancesMap);

                  setJoinCode("");
                }}
              >
                Join
              </button>
            </div>
          </div>

          
          {/* user groups */}
          <div>
            <h3 style={{marginBottom: "10px", marginLeft: "5px"}}>Your Groups</h3>
            <GroupList
              groups={groups}
              balances={groupBalances}
              userId={user.user_id}
              onSelectGroup={setSelectedGroup}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
