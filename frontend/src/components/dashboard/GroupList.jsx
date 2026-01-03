function GroupList({ groups = [], balances = {}, userId, onSelectGroup }) {
  if (groups.length === 0) {
    return <p className="muted">No groups yet</p>;
  }

  return (
    <div className="group-list">
      {groups.map((group) => {
        const groupBalance =
          balances[group.group_id]?.[userId] || 0;

        let statusText = "Settled up";
        let statusClass = "settled";

        if (groupBalance > 0) {
          statusText = `You are owed ₹${groupBalance.toFixed(2)}`;
          statusClass = "owed";
        } else if (groupBalance < 0) {
          statusText = `You owe ₹${Math.abs(groupBalance).toFixed(2)}`;
          statusClass = "owe";
        }

        return (
          <div
            key={group.group_id}
            className="group-item"
            onClick={() => onSelectGroup(group)}
          >
            <div className="group-avatar">
              {group.name?.charAt(0).toUpperCase()}
            </div>

            <div className="group-info">
              <h4>{group.name}</h4>
            </div>

            <div className={`group-status ${statusClass}`}>
              {statusText}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default GroupList;
