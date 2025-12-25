# PerPerson
**PerPerson** is a web application designed to track shared expenses, bills, and payments among friends or group members.

## Features: 
1. User signup and login
2. Create groups
3. Join groups using a unique group code
4. Delete groups (only group creator)
5. Add Expense
6. Select who paid
7. Split expense 
8. Delete Expense
9. Real time balance calculations
10. Dynamic calculations

## Setup:
1. Clone the repo 
```
git clone https://github.com/TheVedantPatil/PerPerson.git
cd perperson
```

2. Backend
```
cd backend
python -m venv venv
venv\Scripts\Activate
pip install -r requirements.txtuvicorn main:app --reload
```

**Backend will run on:** `http://127.0.0.1:8000` 

3. Frontend
```
cd frontend
npm instal
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

## Tech Stack
**Frontend:** React, JavaScript  
**Backend:** FastAPI, SQLAlchemy, SQLite, Uvicorn

![Dashboard](frontend/assets/dashboard.png)
