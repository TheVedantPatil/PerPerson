// This is the dashboard of the app

import { useEffect, useState } from "react";
import Header from "../Header/Header";
import GroupList from "./GroupList";
import GroupPage from "../group/GroupPage";
import "../../styles/Dashboard/dashboard.css";
import "../../styles/Dashboard/grouplist.css";
import { toast } from "react-toastify"; 
import {
  getUserGroups,
  joinGroup,
  createGroup,
  getGroupBalances,
} from "../../api";

function Dashboard({ user, onLogout }) {
  const [groups, setGroups] = useState([]);
  const [groupBalances, setGroupBalances] = useState({});
  const [joinCode, setJoinCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  // loading flag
  const [loadingGroups, setLoadingGroups] = useState(true);

  // load groups and balances
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingGroups(true);

        const userGroups = await getUserGroups(user.user_id);
        setGroups(userGroups);

        const balancesMap = {};
        for (const group of userGroups) {
          const balances = await getGroupBalances(group.group_id);
          balancesMap[group.group_id] = balances;
        }
        setGroupBalances(balancesMap);
      } catch {
        toast.error("Failed to load groups");
      } finally {
        setLoadingGroups(false);
      }
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

    if (myBalance > 0) totalOwed += myBalance;
    else totalOwe += Math.abs(myBalance);
  });

  if (selectedGroup) {
    return (
      <GroupPage
        group={selectedGroup}
        user={user}
        onBack={() => setSelectedGroup(null)}
        onGroupDeleted={(id) =>
          setGroups((prev) => prev.filter((g) => g.group_id !== id))
        }
      />
    );
  }

  return (
    <div className="dashboard-root">
      {/* header */}
      <Header onLogout={onLogout} />

      {/* main content */}
      <main className="dashboard-content">
        <div className="container dashboard-grid">
          {/* LEFT COLUMN */}
          <div className="dashboard-left">
            {/* summary */}
            <div className="summary-card">
              <div className="user-details">
                <h2>
                  {user.first_name} {user.last_name}
                </h2>
                <p>
                  Your ID: <strong>{user.user_id}</strong>
                </p>
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

            {/* groups */}
            <div className="card groups-card">
              <h3>Your Groups</h3>

              {loadingGroups ? (
                <p className="muted">Loading groups...</p>
              ) : (
                <div className="groups-scroll">
                  <GroupList
                    groups={groups}
                    balances={groupBalances}
                    userId={user.user_id}
                    onSelectGroup={setSelectedGroup}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="dashboard-right">
            {/* create group */}
            <div className="card action-card">
              <h4>Create Group</h4>
              <input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (!groupName) {
                    toast.error("Group name required");
                    return;
                  }

                  try {
                    const newGroup = await createGroup(groupName, user.user_id);

                    setGroups((prev) => [
                      ...prev,
                      { ...newGroup, created_by: user.user_id },
                    ]);
                    setGroupName("");
                    toast.success("Group created");
                  } catch {
                    toast.error("Failed to create group");
                  }
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
                className="btn btn-primary"
                onClick={async () => {
                  if (!joinCode) {
                    toast.error("Enter a group code");
                    return;
                  }

                  try {
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
                    toast.success("Joined group successfully");
                  } catch (err) {
                    toast.error(err?.message || "Invalid group code");
                  }
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
