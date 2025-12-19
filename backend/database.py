from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.orm import Session

# The purpose of this file is to connect fastAPI to the databse
# And prepare a base for the tables

DATABASE_URL = "sqlite:///./perperson.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# Opens DB connection per request
# Closes it safely
# Prevents memory leaks
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

