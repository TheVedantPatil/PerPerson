import AddExpense from "./AddExpense";
import ExpenseList from "./ExpenseList";

function GroupLeft({ members, expenses, userMap, onAddExpense, onDeleteExpense }) {
  return (
    <div className="group-left">
      <div className="card">
        <h3>Add Expense</h3>
        <AddExpense members={members} onAdd={onAddExpense} />
      </div>
    
      <div className="card expense">
        <h3>Expenses</h3>

        {expenses.length === 0 ? (
          <p className="muted">No expenses added yet</p>
        ) : (
          <ExpenseList
            expenses={expenses}
            userMap={userMap}
            onDelete={onDeleteExpense}
          />
        )}
      </div>
    </div>
  );
}

export default GroupLeft;
