from sqlalchemy import Column, String, DateTime, ForeignKey, Float
from datetime import datetime
from database import Base

# Database Table for users
class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)



# Database Table for groups
class Group(Base):
    __tablename__ = "groups"

    group_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    join_code = Column(String, unique=True, index=True)
    created_by = Column(String, ForeignKey("users.user_id"))
    created_at = Column(DateTime, default=datetime.utcnow)


# Database Table for group members
class GroupMember(Base):
    __tablename__ = "group_members"

    user_id = Column(String, ForeignKey("users.user_id"), primary_key=True)
    group_id = Column(String, ForeignKey("groups.group_id"), primary_key=True)


# Database Table for expenses
class Expense(Base):
    __tablename__ = "expenses"

    expense_id = Column(String, primary_key=True, index=True)
    group_id = Column(String, ForeignKey("groups.group_id"))
    paid_by = Column(String, ForeignKey("users.user_id"))
    total_amount = Column(Float)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


# Database Table for expense split
class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    expense_id = Column(String, ForeignKey("expenses.expense_id"), primary_key=True)
    user_id = Column(String, ForeignKey("users.user_id"), primary_key=True)
    amount_owed = Column(Float)
