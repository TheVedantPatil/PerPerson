function GroupRight({ balances, settlements, userMap }) {
  return (
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

        {settlements.length === 0 && <p className="muted">All settled</p>}

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
  );
}

export default GroupRight;
