import { useState } from "react";
import { toast } from "react-toastify";

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !amount ||
      !description ||
      !paidBy ||
      selectedMembers.length === 0
    ) {
      toast.error("Please fill all fields");
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
    <form className="add-expense" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          placeholder="Expense description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label className="label">Paid by</label>
        <select
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

      <button className="btn btn-primary" type="submit">
        Add Expense
      </button>
    </form>
  );
}

export default AddExpense;
