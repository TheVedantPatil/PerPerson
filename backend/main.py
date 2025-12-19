from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db
import schemas
from utils import generate_user_id, generate_group_code


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# create tables
models.Base.metadata.create_all(bind=engine)

# root endpoint
@app.get("/")
def root():
    return {"message": "Backend is running"}

# create user endpoint
@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    user_id = generate_user_id()

    new_user = models.User(
        user_id=user_id,
        name=user.name
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# create group endpoint 
@app.post("/groups", response_model=schemas.GroupResponse)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    group_id = generate_user_id()  # reuse ID generator for simplicity
    join_code = generate_group_code()

    new_group = models.Group(
        group_id=group_id,
        name=group.name,
        join_code=join_code,
        created_by=group.created_by
    )

    db.add(new_group)

    # add creator as group member
    member = models.GroupMember(
        user_id=group.created_by,
        group_id=group_id
    )
    db.add(member)

    db.commit()
    db.refresh(new_group)

    return new_group

# get user groups endpoint
@app.get("/users/{user_id}/groups")
def get_user_groups(user_id: str, db: Session = Depends(get_db)):
    groups = (
        db.query(models.Group)
        .join(models.GroupMember)
        .filter(models.GroupMember.user_id == user_id)
        .all()
    )

    return groups

# get group members with names
@app.get("/groups/{group_id}/members")
def get_group_members(group_id: str, db: Session = Depends(get_db)):
    members = (
        db.query(
            models.User.user_id,
            models.User.first_name,
            models.User.last_name
        )
        .join(models.GroupMember)
        .filter(models.GroupMember.group_id == group_id)
        .all()
    )

    return [
        {
            "user_id": m.user_id,
            "name": f"{m.first_name} {m.last_name}"
        }
        for m in members
    ]



# join group endpoint
@app.post("/groups/join")
def join_group(data: schemas.JoinGroupRequest, db: Session = Depends(get_db)):
    # find group by join code
    group = (
        db.query(models.Group)
        .filter(models.Group.join_code == data.join_code)
        .first()
    )

    if not group:
        raise HTTPException(status_code=404, detail="Invalid group code")


    # check if already a member
    existing = (
        db.query(models.GroupMember)
        .filter(
            models.GroupMember.user_id == data.user_id,
            models.GroupMember.group_id == group.group_id
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="User already in group")

    # add user to group
    new_member = models.GroupMember(
        user_id=data.user_id,
        group_id=group.group_id
    )

    db.add(new_member)
    db.commit()

    return {"message": "Joined group successfully"}


# Expense Endpoint
@app.post("/expenses")
def add_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    total_split = sum(split.amount for split in expense.splits)

    if total_split != expense.total_amount:
        return {
            "status": "error",
            "message": "Split amounts do not match total expense"
        }
    expense_id = generate_user_id()  # reuse ID generator

    # get all members of the group
    members = (
        db.query(models.GroupMember)
        .filter(models.GroupMember.group_id == expense.group_id)
        .all()
    )
    member_ids = {member.user_id for member in members}

    # check payer
    if expense.paid_by not in member_ids:
        return {
            "status": "error",
            "message": "Payer is not a member of this group"
        }
    # check all split users
    for split in expense.splits:
        if split.user_id not in member_ids:
            return {
                "status": "error",
                "message": f"User {split.user_id} is not a member of this group"
            }

    new_expense = models.Expense(
        expense_id=expense_id,
        group_id=expense.group_id,
        paid_by=expense.paid_by,
        total_amount=expense.total_amount,
        description=expense.description
    )

    db.add(new_expense)

    for split in expense.splits:
        expense_split = models.ExpenseSplit(
            expense_id=expense_id,
            user_id=split.user_id,
            amount_owed=split.amount
        )
        db.add(expense_split)

    db.commit()

    return {
        "status": "success",
        "expense_id": expense_id
    }

# Get group balances endpoint
@app.get("/groups/{group_id}/balances")
def get_group_balances(group_id: str, db: Session = Depends(get_db)):
    balances = {}

    # get all members of the group
    members = (
        db.query(models.GroupMember)
        .filter(models.GroupMember.group_id == group_id)
        .all()
    )

    for member in members:
        balances[member.user_id] = 0.0

    # add paid amounts
    expenses = (
        db.query(models.Expense)
        .filter(models.Expense.group_id == group_id)
        .all()
    )

    for expense in expenses:
        balances[expense.paid_by] += expense.total_amount

    # subtract owed amounts
    splits = (
        db.query(models.ExpenseSplit)
        .join(models.Expense)
        .filter(models.Expense.group_id == group_id)
        .all()
    )

    for split in splits:
        balances[split.user_id] -= split.amount_owed

    return balances

# Get settlements endpoint
@app.get("/groups/{group_id}/settlements")
def get_settlements(group_id: str, db: Session = Depends(get_db)):
    balances = get_group_balances(group_id, db)

    creditors = []
    debtors = []

    for user_id, balance in balances.items():
        if balance > 0:
            creditors.append([user_id, balance])
        elif balance < 0:
            debtors.append([user_id, -balance])

    settlements = []

    i = j = 0
    while i < len(debtors) and j < len(creditors):
        debtor_id, debt = debtors[i]
        creditor_id, credit = creditors[j]

        amount = min(debt, credit)
        settlements.append({
            "from": debtor_id,
            "to": creditor_id,
            "amount": amount
        })

        debtors[i][1] -= amount
        creditors[j][1] -= amount

        if debtors[i][1] == 0:
            i += 1
        if creditors[j][1] == 0:
            j += 1

    return settlements


# Get all expenses for a group
@app.get("/groups/{group_id}/expenses")
def get_group_expenses(group_id: str, db: Session = Depends(get_db)):
    expenses = (
        db.query(models.Expense)
        .filter(models.Expense.group_id == group_id)
        .all()
    )

    return expenses


# Delete an expense
@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    expense = (
        db.query(models.Expense)
        .filter(models.Expense.expense_id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    # delete splits first
    db.query(models.ExpenseSplit).filter(
        models.ExpenseSplit.expense_id == expense_id
    ).delete()

    db.delete(expense)
    db.commit()

    return {"message": "Expense deleted"}


# Signup Endpoint
@app.post("/signup", response_model=schemas.UserAuthResponse)
def signup(user: schemas.UserSignup, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        user_id=generate_user_id(),
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=user.password  # ⚠️ temporary
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# Login Endpoint
@app.post("/login", response_model=schemas.UserAuthResponse)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return user
