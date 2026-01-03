import { RxExit } from "react-icons/rx";

function GroupHeader({ group, user, onBack, onLeave, onDelete }) {
  return (
    <div className="group-header-card">
      <div className="group-title">
        <div>
          <h2>{group.name}</h2>
          <p className="group-code">
            Group Code:<span> {group.join_code}</span>
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-ghost" onClick={onBack}>
            Back
          </button>

          {group.created_by !== user.user_id && (
            <button className="btn btn-danger btn-icon" onClick={onLeave}>
              <RxExit />
            </button>
          )}

          {group.created_by === user.user_id && (
            <button className="btn btn-danger" onClick={onDelete}>
              Delete Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupHeader;
