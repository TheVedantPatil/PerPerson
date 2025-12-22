import { FaTrashAlt } from "react-icons/fa";


function ExpenseList({ expenses, userMap, onDelete }) {
  if (!expenses || expenses.length === 0) {
    return <p className="muted">No expenses yet</p>;
  }

  return (
    <div className="expense-list">
      {expenses.map((exp) => (
        <div key={exp.expense_id} className="expense-item">
          <div className="expense-main">
            <div>
              <h4 className="expense-title">
                {exp.description}
              </h4>
              <p className="expense-sub">
                Paid by{" "}
                <strong>
                  {userMap[exp.paid_by] || exp.paid_by}
                </strong>
              </p>
            </div>

            <div className="expense-amount">
              ₹ {exp.total_amount}
            </div>
          </div>

          <button
            className="expense-delete"
            onClick={() => onDelete(exp.expense_id)}
          >
          <h3><FaTrashAlt/></h3>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ExpenseList;
