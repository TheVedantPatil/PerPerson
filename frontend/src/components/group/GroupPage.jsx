import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "../Header/Header";
import GroupHeader from "./GroupHeader";
import GroupLeft from "./GroupLeft";
import GroupRight from "./GroupRight";
import usePolling from "../../hooks/usePolling";
import ConfirmModal from "../confirmModal";
import "../../styles/group.css";

import {
  addExpense,
  getGroupExpenses,
  deleteExpense,
  getGroupBalances,
  getGroupSettlements,
  getGroupMembers,
  deleteGroup,
  leaveGroup,
} from "../../api";

function GroupPage({ group, user, onBack, onGroupDeleted }) {
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [members, setMembers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* =========================
     LOAD GROUP DATA
     ========================= */
  useEffect(() => {
    loadAll();
  }, [group]);

  usePolling(() => {
    loadAll();
  }, 3000, !!group);

  const loadAll = async () => {
    try {
      const membersData = await getGroupMembers(group.group_id);
      setMembers(membersData);

      const map = {};
      membersData.forEach((m) => {
        map[m.user_id] = m.name.split(" ")[0];
      });
      setUserMap(map);

      const bal = await getGroupBalances(group.group_id);
      setBalances(
        Object.entries(bal).map(([u, b]) => ({
          user_id: u,
          balance: b,
        }))
      );

      setSettlements(await getGroupSettlements(group.group_id));
      setExpenses(await getGroupExpenses(group.group_id));
    } catch {
      toast.error("Failed to load group data");
    }
  };

  /* =========================
     EXPENSE ACTIONS
     ========================= */
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

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      loadAll();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  /* =========================
     GROUP ACTIONS
     ========================= */
  const confirmDeleteGroup = async () => {
    try {
      await deleteGroup(group.group_id, user.user_id);
      toast.success("Group deleted");
      onGroupDeleted(group.group_id);
      onBack();
    } catch {
      toast.error("Failed to delete group");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await leaveGroup(group.group_id, user.user_id);
      toast.success("You left the group");
      onGroupDeleted(group.group_id);
      onBack();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Header />

      <main className="group-page">
        <div className="container">
          <GroupHeader
            group={group}
            user={user}
            onBack={onBack}
            onLeave={handleLeaveGroup}
            onDelete={() => setShowDeleteModal(true)}
          />

          <div className="group-grid">
            <GroupLeft
              members={members}
              expenses={expenses}
              userMap={userMap}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />

            <GroupRight
              balances={balances}
              settlements={settlements}
              userMap={userMap}
            />
          </div>
        </div>
      </main>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Group?"
        message="This will permanently delete the group and all its expenses. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteGroup}
      />
    </>
  );
}

export default GroupPage;
