const Database = require("better-sqlite3");

// Create or open tasks.db
const db = new Database("tasks.db");

// Create the tasks table
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
);
`);

// Check if the table is empty
const row = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

// Insert sample tasks only once
if (row.count === 0) {
    const insert = db.prepare(
        "INSERT INTO tasks (title, done) VALUES (?, ?)"
    );

    insert.run("Learn Express", 0);
    insert.run("Build CRUD API", 0);
    insert.run("Practice SQL", 1);

    console.log("Sample tasks inserted.");
} else {
    console.log("Sample tasks already exist.");
}

module.exports = db;