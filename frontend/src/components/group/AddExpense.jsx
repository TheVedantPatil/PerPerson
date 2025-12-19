import { useState } from "react";

function AddExpense({ members, onAdd }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (
      !amount ||
      !description ||
      !paidBy ||
      selectedMembers.length === 0
    ) {
      alert("Fill all fields");
      return;
    }

    onAdd({
      total_amount: Number(amount),
      description,
      paid_by: paidBy,
      participants: selectedMembers,
    });

    setAmount("");
    setDescription("");
    setPaidBy("");
    setSelectedMembers([]);
  };

  return (
    <div className="add-expense">
      <div className="form-row">
        <input
          className="input"
          placeholder="Expense description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label className="label">Paid by</label>
        <select
          className="input"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label className="label">Split between</label>

        <div className="member-chips">
          {members.map((m) => {
            const active = selectedMembers.includes(m.user_id);

            return (
              <div
                key={m.user_id}
                className={`member-chip ${
                  active ? "active" : ""
                }`}
                onClick={() => toggleMember(m.user_id)}
              >
                {m.name}
              </div>
            );
          })}
        </div>
      </div>

      <button className="primary-btn" onClick={handleSubmit}>
        Add Expense
      </button>
    </div>
  );
}

export default AddExpense;
