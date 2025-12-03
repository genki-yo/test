import sqlite3
from datetime import datetime
from pathlib import Path

from flask import Flask, redirect, render_template, request, url_for, flash

APP_ROOT = Path(__file__).resolve().parent
DATABASE_PATH = APP_ROOT / "data.sqlite"

app = Flask(__name__)
app.config["SECRET_KEY"] = "offline-shared-db"


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    if not DATABASE_PATH.exists():
        conn = get_connection()
        try:
            conn.execute(
                """
                CREATE TABLE records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()
        finally:
            conn.close()


# アプリケーション起動時にデータベースを初期化
initialize_database()


@app.route("/")
def index():
    conn = get_connection()
    try:
        records = conn.execute(
            "SELECT id, title, description, updated_at FROM records ORDER BY updated_at DESC"
        ).fetchall()
    finally:
        conn.close()
    return render_template("index.html", records=records)


@app.route("/records/new", methods=["GET", "POST"])
def create_record():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        if not title:
            flash("タイトルを入力してください。", "error")
        else:
            conn = get_connection()
            try:
                conn.execute(
                    "INSERT INTO records (title, description, updated_at) VALUES (?, ?, ?)",
                    (title, description, datetime.utcnow().isoformat()),
                )
                conn.commit()
                flash("レコードを追加しました。", "success")
                return redirect(url_for("index"))
            finally:
                conn.close()
    return render_template("form.html", record=None)


@app.route("/records/<int:record_id>/edit", methods=["GET", "POST"])
def edit_record(record_id: int):
    conn = get_connection()
    try:
        record = conn.execute(
            "SELECT id, title, description FROM records WHERE id = ?", (record_id,)
        ).fetchone()
    finally:
        conn.close()

    if record is None:
        flash("指定されたレコードが見つかりません。", "error")
        return redirect(url_for("index"))

    if request.method == "POST":
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        if not title:
            flash("タイトルを入力してください。", "error")
        else:
            conn = get_connection()
            try:
                conn.execute(
                    "UPDATE records SET title = ?, description = ?, updated_at = ? WHERE id = ?",
                    (title, description, datetime.utcnow().isoformat(), record_id),
                )
                conn.commit()
                flash("レコードを更新しました。", "success")
                return redirect(url_for("index"))
            finally:
                conn.close()

    return render_template("form.html", record=record)


@app.route("/records/<int:record_id>/delete", methods=["POST"])
def delete_record(record_id: int):
    conn = get_connection()
    try:
        conn.execute("DELETE FROM records WHERE id = ?", (record_id,))
        conn.commit()
        flash("レコードを削除しました。", "success")
    finally:
        conn.close()
    return redirect(url_for("index"))


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)
