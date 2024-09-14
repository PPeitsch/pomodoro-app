import sqlite3
from datetime import datetime

def get_db_connection():
    conn = sqlite3.connect('pomodoro.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Create tasks table
    c.execute('''CREATE TABLE IF NOT EXISTS tasks
                 (id INTEGER PRIMARY KEY, task TEXT)''')
    
    # Create settings table
    c.execute('''CREATE TABLE IF NOT EXISTS settings
                 (id INTEGER PRIMARY KEY, pomodoro_time INTEGER, 
                  short_break_time INTEGER, long_break_time INTEGER, 
                  invert_layout BOOLEAN)''')
    
    # Create sessions table
    c.execute('''CREATE TABLE IF NOT EXISTS sessions
                 (id INTEGER PRIMARY KEY, timestamp TEXT)''')
    
    conn.commit()
    conn.close()

def get_tasks():
    conn = get_db_connection()
    tasks = conn.execute('SELECT task FROM tasks').fetchall()
    conn.close()
    return [task['task'] for task in tasks]

def save_tasks(tasks):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM tasks')
    for task in tasks:
        c.execute('INSERT INTO tasks (task) VALUES (?)', (task,))
    conn.commit()
    conn.close()

def get_settings():
    conn = get_db_connection()
    settings = conn.execute('SELECT * FROM settings').fetchone()
    conn.close()
    if settings:
        return {
            'pomodoroTime': settings['pomodoro_time'],
            'shortBreakTime': settings['short_break_time'],
            'longBreakTime': settings['long_break_time'],
            'invertLayout': bool(settings['invert_layout'])
        }
    else:
        return {
            'pomodoroTime': 25,
            'shortBreakTime': 5,
            'longBreakTime': 15,
            'invertLayout': False
        }

def save_settings(settings):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM settings')
    c.execute('''INSERT INTO settings 
                 (pomodoro_time, short_break_time, long_break_time, invert_layout) 
                 VALUES (?, ?, ?, ?)''', 
              (settings['pomodoroTime'], settings['shortBreakTime'], 
               settings['longBreakTime'], int(settings['invertLayout'])))
    conn.commit()
    conn.close()

def save_session(timestamp):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO sessions (timestamp) VALUES (?)', (timestamp,))
    conn.commit()
    conn.close()

def get_sessions():
    conn = get_db_connection()
    sessions = conn.execute('SELECT timestamp FROM sessions').fetchall()
    conn.close()
    return [{'timestamp': session['timestamp']} for session in sessions]

# Initialize the database
init_db()

# Error handling wrapper
def db_operation(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except sqlite3.Error as e:
            print(f"An error occurred: {e}")
            return None
    return wrapper

# Apply error handling to all database functions
get_tasks = db_operation(get_tasks)
save_tasks = db_operation(save_tasks)
get_settings = db_operation(get_settings)
save_settings = db_operation(save_settings)
save_session = db_operation(save_session)
get_sessions = db_operation(get_sessions)
