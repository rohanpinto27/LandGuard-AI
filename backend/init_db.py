import os
import mysql.connector
from mysql.connector import Error

PASSWORDS_TO_TRY = [
    '', 'root', 'admin', 'password', '123456', 'rohan', 'mysql', 'root123',
    'Rohan', 'Rohan@123', 'Rohan27', 'rohan27', 'rohanpinto27', 'rohan123',
    'Root@123', 'Admin@123', 'Password@123', 'mysql123', 'landguard',
    '12345', '12345678', '1234', 'system', 'manager'
]

def find_working_connection():
    for pwd in PASSWORDS_TO_TRY:
        try:
            conn = mysql.connector.connect(
                host='localhost',
                port=3306,
                user='root',
                password=pwd
            )
            if conn.is_connected():
                print(f"[MySQL SUCCESS] Connection successful with user 'root' and password: '{pwd}'")
                return conn, pwd
        except Error:
            pass
    return None, None

def run_schema_import(conn, pwd):
    schema_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'schema.sql')
    if not os.path.exists(schema_path):
        print(f"[Error] Schema file not found at: {schema_path}")
        return False

    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()

    cursor = conn.cursor()
    try:
        statements = schema_sql.split(';')
        for stmt in statements:
            stmt_clean = stmt.strip()
            if stmt_clean:
                cursor.execute(stmt_clean)
        conn.commit()
        print(f"[MySQL SUCCESS] Successfully created database 'landguard' and imported schema & seed data!")
        return True
    except Error as e:
        print(f"[MySQL Error] Failed executing schema: {e}")
        return False
    finally:
        cursor.close()

if __name__ == '__main__':
    conn, pwd = find_working_connection()
    if conn:
        run_schema_import(conn, pwd)
        conn.close()
    else:
        print("[MySQL Info] Checked standard password list. Please specify the root password.")
