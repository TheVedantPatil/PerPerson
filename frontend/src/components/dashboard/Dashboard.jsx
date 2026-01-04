// This is the dashboard of the app

import { useEffect, useState, useRef } from "react";
import Header from "../Header/Header";
import GroupList from "./GroupList";
import GroupPage from "../group/GroupPage";
import "../../styles/Dashboard/dashboard.css";
import "../../styles/Dashboard/grouplist.css";
import { toast } from "react-toastify";
import usePolling from "../../hooks/usePolling";

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
  const [loadingGroups, setLoadingGroups] = useState(true);

  // keep previous snapshot for comparison
  const prevGroupsRef = useRef([]);
  const prevBalancesRef = useRef({});

  /* =========================================================
     HELPERS — CHANGE DETECTION
     ========================================================= */

  const haveGroupsChanged = (prev, next) => {
    if (prev.length !== next.length) return true;
    return prev.some(
      (g, i) => g.group_id !== next[i]?.group_id
    );
  };

  const haveBalancesChanged = (prev, next) => {
    return JSON.stringify(prev) !== JSON.stringify(next);
  };

  /* =========================================================
     LOAD DASHBOARD DATA
     ========================================================= */

  const loadDashboard = async (isInitial = false) => {
    try {
      if (isInitial) setLoadingGroups(true);

      const userGroups = await getUserGroups(user.user_id);

      const balancesMap = {};
      for (const group of userGroups) {
        balancesMap[group.group_id] = await getGroupBalances(
          group.group_id
        );
      }

      // update ONLY if something changed
      if (haveGroupsChanged(prevGroupsRef.current, userGroups)) {
        setGroups(userGroups);
        prevGroupsRef.current = userGroups;
      }

      if (haveBalancesChanged(prevBalancesRef.current, balancesMap)) {
        setGroupBalances(balancesMap);
        prevBalancesRef.current = balancesMap;
      }
    } catch {
      if (isInitial) toast.error("Failed to load groups");
    } finally {
      if (isInitial) setLoadingGroups(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadDashboard(true);
  }, [user]);

  /* =========================================================
     POLLING (NO FLICKER)
     ========================================================= */

  usePolling(
    () => {
      loadDashboard(false);
    },
    5000,
    !selectedGroup
  );

  /* =========================================================
     CALCULATE TOTALS
     ========================================================= */

  let totalOwed = 0;
  let totalOwe = 0;

  groups.forEach((group) => {
    const balances = groupBalances[group.group_id];
    if (!balances) return;

    const myBalance = balances[user.user_id] || 0;
    if (myBalance > 0) totalOwed += myBalance;
    else totalOwe += Math.abs(myBalance);
  });

  /* =========================================================
     GROUP PAGE ROUTING
     ========================================================= */

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

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="dashboard-root">
      <Header onLogout={onLogout} />

      <main className="dashboard-content">
        <div className="container dashboard-grid">
          {/* LEFT COLUMN */}
          <div className="dashboard-left">
            {/* SUMMARY */}
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

            {/* GROUPS */}
            <div className="card groups-card">
              <h3>Your Groups</h3>

              {loadingGroups && groups.length === 0 ? (
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
            {/* CREATE GROUP */}
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
                    await createGroup(groupName, user.user_id);
                    setGroupName("");
                    toast.success("Group created");
                    loadDashboard(false);
                  } catch {
                    toast.error("Failed to create group");
                  }
                }}
              >
                Create
              </button>
            </div>

            {/* JOIN GROUP */}
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
                    setJoinCode("");
                    toast.success("Joined group successfully");
                    loadDashboard(false);
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
