import sqlite3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite Database
def init_db():
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY,
            text TEXT NOT NULL,
            completed BOOLEAN NOT NULL
        )
    """)
    # Seed default tasks if the database is empty
    cursor.execute("SELECT COUNT(*) FROM tasks")
    if cursor.fetchone()[0] == 0:
        default_tasks = [
            (1, "Review Chapter 4 notes", 1),
            (2, "Complete practice problems 1–10", 0),
            (3, "Summarize key concepts", 0),
        ]
        cursor.executemany("INSERT INTO tasks (id, text, completed) VALUES (?, ?, ?)", default_tasks)
    conn.commit()
    conn.close()

# Run database setup on startup
init_db()

class Task(BaseModel):
    id: int
    text: str
    completed: bool = False

@app.get("/api/status")
def get_status():
    return {
        "status": "success",
        "message": "FastAPI connected to SQLite database!"
    }

# Get all tasks from SQLite
@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, text, completed FROM tasks")
    rows = cursor.fetchall()
    conn.close()
    
    return [{"id": row[0], "text": row[1], "completed": bool(row[2])} for row in rows]

# Save a new task into SQLite
@app.post("/api/tasks", response_model=Task)
def create_task(task: Task):
    conn = sqlite3.connect("tasks.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO tasks (id, text, completed) VALUES (?, ?, ?)",
        (task.id, task.text, int(task.completed))
    )
    conn.commit()
    conn.close()
    return task