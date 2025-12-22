import { useEffect, useState } from "react";
import AddExpense from "./AddExpense";
import ExpenseList from "./ExpenseList";
import "../../styles/group.css";



import {
  addExpense,
  getGroupExpenses,
  deleteExpense,
  getGroupBalances,
  getGroupSettlements,
  getGroupMembers,
} from "../../api";

function GroupPage({ group, user, onBack }) {
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [members, setMembers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [expenses, setExpenses] = useState([]);

  // initialize the data load
  useEffect(() => {
    getGroupMembers(group.group_id).then((data) => {
      setMembers(data);

      const map = {};
      data.forEach((m) => {
        map[m.user_id] = m.name.split(" ")[0];
      });

      setUserMap(map);
    });

    getGroupBalances(group.group_id).then((data) => {
      const balanceArray = Object.entries(data).map(([userId, balance]) => ({
        user_id: userId,
        balance,
      }));
      setBalances(balanceArray);
    });

    getGroupSettlements(group.group_id).then(setSettlements);
    getGroupExpenses(group.group_id).then(setExpenses);
  }, [group]);

  // add expense
  const handleAddExpense = async (data) => {
    const splitAmount = data.total_amount / data.participants.length;

    const splits = data.participants.map((userId) => ({
      user_id: userId,
      amount: splitAmount,
    }));

    await addExpense({
      group_id: group.group_id,
      paid_by: data.paid_by,
      total_amount: data.total_amount,
      description: data.description,
      splits,
    });

    refreshAll();
  };

  // delete expense
  const handleDeleteExpense = async (expenseId) => {
    await deleteExpense(expenseId);
    refreshAll();
  };

  const refreshAll = () => {
    getGroupExpenses(group.group_id).then(setExpenses);

    getGroupBalances(group.group_id).then((data) => {
      const balanceArray = Object.entries(data).map(([userId, balance]) => ({
        user_id: userId,
        balance,
      }));
      setBalances(balanceArray);
    });

    getGroupSettlements(group.group_id).then(setSettlements);
  };

  return (
    <div className="container group-container">
      {/* group header */}
      <div className="group-header-card">
        <div className="group-title">
          <div>
            <h2>{group.name}</h2>
            <p className="group-code">
              Group Code:
              <span> {group.join_code}</span>
            </p>
          </div>

          {/* back button */}
          <button className="back-btn" onClick={onBack}>
            Back
          </button>
        </div>
      </div>

      {/* main content group */}
      <div className="group-grid">
        {/* left side */}
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

        {/* RIGHT side */}
        <div className="group-right">
          <div className="card">
            <h3>Balances</h3>

            {balances.length === 0 && <p className="muted">No balances yet</p>}

            <ul className="balance-list">
              {balances.map((bal) => (
                <li key={bal.user_id} className="balance-item">
                  <span>{userMap[bal.user_id] || bal.user_id}</span>
                  <span className={bal.balance >= 0 ? "positive" : "negative"}>
                    ₹ {Number(bal.balance).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="card">
            <h3>Settlements</h3>

            {settlements.length === 0 && <p className="muted">All settled</p>}

            <ul className="settlement-list">
              {settlements.map((s, index) => (
                <li key={index}>
                  <strong>{userMap[s.from] || s.from}</strong> pays{" "}
                  <strong>{userMap[s.to] || s.to}</strong> ₹{" "}
                  {Number(s.amount).toFixed(2)}
                </li>
              ))}
            </ul>
          </div> */}

          {/* SETTLEMENTS */}
          <div className="card s-card">
            <h3>Settlements</h3>

            {settlements.length === 0 && (
              <p className="muted">All settled</p>
              // <h3> Lets go for a <FaTrashAlt/>? </h3>
            )}

            <div className="settlement-list">
              {settlements.map((s, index) => (
                <div key={index} className="settlement-item">
                  <div className="settlement-users">
                    <span className="payer">{userMap[s.from] || s.from}</span>
                    <span className="arrow">pays</span>
                    <span className="receiver">{userMap[s.to] || s.to}</span>
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
