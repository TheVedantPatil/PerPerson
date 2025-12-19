// This file shows data of the group list on the dashboard

function GroupList({ groups, balances, userId, onSelectGroup }) {
  if (!groups || groups.length === 0) {
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
              {group.name?.[0]}
            </div>

            <div className="group-info">
              <h4>{group.name}</h4>
              {/* <p>{group.group_id.members}</p> */}
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
