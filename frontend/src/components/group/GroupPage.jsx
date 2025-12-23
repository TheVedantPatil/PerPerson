import { useEffect, useState } from "react";
import AddExpense from "./AddExpense";
import ExpenseList from "./ExpenseList";
import "../../styles/group.css";
import { deleteGroup } from "../../api";
import { toast } from "react-toastify";

import {
  addExpense,
  getGroupExpenses,
  deleteExpense,
  getGroupBalances,
  getGroupSettlements,
  getGroupMembers,
} from "../../api";

function GroupPage({ group, user, onBack, onGroupDeleted }) {
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [members, setMembers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [expenses, setExpenses] = useState([]);

  // initial data load
  useEffect(() => {
    loadAll();
  }, [group]);

  const loadAll = async () => {
    try {
      const data = await getGroupMembers(group.group_id);
      setMembers(data);

      const map = {};
      data.forEach((m) => {
        map[m.user_id] = m.name.split(" ")[0];
      });
      setUserMap(map);

      const bal = await getGroupBalances(group.group_id);
      setBalances(
        Object.entries(bal).map(([u, b]) => ({ user_id: u, balance: b }))
      );

      setSettlements(await getGroupSettlements(group.group_id));
      setExpenses(await getGroupExpenses(group.group_id));
    } catch {
      toast.error("Failed to load group data");
    }
  };

  // add expense
  const handleAddExpense = async (data) => {
    try {
      const splitAmount = data.total_amount / data.participants.length;

      await addExpense({
        group_id: group.group_id,
        paid_by: data.paid_by,
        total_amount: data.total_amount,
        description: data.description,
        splits: data.participants.map((u) => ({
          user_id: u,
          amount: splitAmount,
        })),
      });

      toast.success("Expense added");
      loadAll();
    } catch {
      toast.error("Failed to add expense");
    }
  };

  // delete expense
  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      loadAll();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  // delete group
  const handleDeleteGroup = async () => {
    const ok = window.confirm(
      "This will permanently delete the group. Continue?"
    );
    if (!ok) return;

    try {
      await deleteGroup(group.group_id, user.user_id);
      toast.success("Group deleted");

      // notify dashboard immediately
      onGroupDeleted(group.group_id);

      onBack();
    } catch {
      toast.error("Failed to delete group");
    }
  };

  return (
    <div className="container group-container">
      {/* group header */}
      <div className="group-header-card">
        <div className="group-title">
          <div>
            <h2>{group.name}</h2>
            <p className="group-code">
              Group Code:<span> {group.join_code}</span>
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="back-btn" onClick={onBack}>
              Back
            </button>

            {group.created_by === user.user_id && (
              <button className="danger-btn" onClick={handleDeleteGroup}>
                Delete Group
              </button>
            )}
          </div>
        </div>
      </div>

      {/* main content */}
      <div className="group-grid">
        <div className="group-left">
          <div className="card">
            <h3>Add Expense</h3>
            <AddExpense members={members} onAdd={handleAddExpense} />
          </div>

          <div className="card expense">
            <h3>Expenses</h3>

            {expenses.length === 0 && (
              <p className="muted">No expenses added yet</p>
            )}

            {expenses.length > 0 && (
              <ExpenseList
                expenses={expenses}
                userMap={userMap}
                onDelete={handleDeleteExpense}
              />
            )}
          </div>
        </div>

        <div className="group-right">
          <div className="card">
            <h3>Balances</h3>

            {balances.length === 0 && <p className="muted">No balances yet</p>}

            <ul className="balance-list">
              {balances.map((b) => (
                <li key={b.user_id} className="balance-item">
                  <span>{userMap[b.user_id] || b.user_id}</span>
                  <span className={b.balance >= 0 ? "positive" : "negative"}>
                    ₹ {Number(b.balance).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card s-card">
            <h3>Settlements</h3>

            {settlements.length === 0 && (
              <p className="muted">All settled</p>
            )}

            <div className="settlement-list">
              {settlements.map((s, i) => (
                <div key={i} className="settlement-item">
                  <div className="settlement-users">
                    <span className="payer">{userMap[s.from]}</span>
                    <span className="arrow">pays</span>
                    <span className="receiver">{userMap[s.to]}</span>
                  </div>
                  <div className="settlement-amount">
                    ₹{Number(s.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupPage;
