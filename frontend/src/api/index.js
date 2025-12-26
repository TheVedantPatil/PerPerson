const BASE_URL = "http://127.0.0.1:8000";
// const BASE_URL = "http://192.168.29.148:8000";



// USER / AUTH
export async function signup(data) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    const message =
      typeof err.detail === "string"
        ? err.detail
        : "Something went wrong";
    throw new Error(message);
  }

  return res.json();
}


export async function login(data) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    const message =
      typeof err.detail === "string"
        ? err.detail
        : "Something went wrong";
    throw new Error(message);
  }

  return res.json();
}



// GROUPS
export async function getUserGroups(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}/groups`);
  return res.json();
}

export async function createGroup(name, userId) {
  const res = await fetch(`${BASE_URL}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      created_by: userId,
    }),
  });

  return res.json();
}

export async function joinGroup(userId, joinCode) {
  const res = await fetch(`${BASE_URL}/groups/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      join_code: joinCode,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // backend error → throw
    throw new Error(data.detail || "Failed to join group");
  }

  return data;
}



// GROUP DATA
export async function getGroupMembers(groupId) {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/members`);
  return res.json();
}

export async function getGroupBalances(groupId) {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/balances`);
  return res.json();
}

export async function getGroupSettlements(groupId) {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/settlements`);
  return res.json();
}


// EXPENSES
export async function addExpense(expenseData) {
  const res = await fetch(`${BASE_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expenseData),
  });

  return res.json();
}

export async function getGroupExpenses(groupId) {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/expenses`);
  return res.json();
}

export async function deleteExpense(expenseId) {
  const res = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
    method: "DELETE",
  });

  return res.json();
}

// DELETE GROUP  
export async function deleteGroup(groupId, userId) {
  const res = await fetch(
    `http://127.0.0.1:8000/groups/${groupId}?user_id=${userId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Delete failed");
  }

  return res.json();
}

// LEAVE GROUP
export async function leaveGroup(groupId, userId) {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/leave?user_id=${userId}`, {
    method: "POST",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Failed to leave group");
  }

  return data;
}
