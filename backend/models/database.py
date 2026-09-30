import os
import mysql.connector
from mysql.connector import Error
import logging
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Establish and return MySQL database connection."""
    try:
        conn = mysql.connector.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            charset='utf8mb4',
            autocommit=True
        )
        if conn and conn.is_connected():
            return conn
    except Error as e:
        logger.warning(f"MySQL Connection Warning: {e}")
    return None

def execute_query(sql, params=None, fetchone=False, fetchall=True, commit=False):
    """
    Executes SQL queries against MySQL database 'landguard'.
    Returns dictionary formatted records.
    """
    params = params or ()
    conn = get_db_connection()
    if not conn:
        logger.error("MySQL Connection unavailable")
        return None

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, params)
        if commit:
            conn.commit()
            res = cursor.lastrowid or True
        elif fetchone:
            res = cursor.fetchone()
        elif fetchall:
            res = cursor.fetchall()
        else:
            res = True
        cursor.close()
        conn.close()
        return res
    except Error as e:
        logger.error(f"MySQL Query Error: {e} | Query: {sql}")
        if conn and conn.is_connected():
            conn.close()
        return None

def check_db_status():
    """Verify MySQL database connectivity."""
    conn = get_db_connection()
    if conn and conn.is_connected():
        conn.close()
        return "mysql_connected"
    return "disconnected"
