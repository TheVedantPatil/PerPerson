# This defines what the frontend can send and what backend can return

from pydantic import BaseModel, EmailStr

class UserSignup(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserAuthResponse(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: EmailStr


# Database schemas for users
class UserCreate(BaseModel):
    name: str

# Response schema for users
class UserResponse(BaseModel):
    user_id: str
    name: str

# Database schemas for groups
class GroupCreate(BaseModel):
    name: str
    created_by: str

# Response schema for groups
class GroupResponse(BaseModel):
    group_id: str
    name: str
    join_code: str

# Request schema for joining a group
class JoinGroupRequest(BaseModel):
    user_id: str
    join_code: str

# Database schemas for expenses
class ExpenseSplitInput(BaseModel):
    user_id: str
    amount: float

# Request schema for creating an expense
class ExpenseCreate(BaseModel):
    group_id: str
    paid_by: str
    total_amount: float
    description: str
    splits: list[ExpenseSplitInput]
