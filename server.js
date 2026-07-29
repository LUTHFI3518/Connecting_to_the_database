const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");
const db = require("./database");

const app = express();
app.use(express.json());
app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

const PORT = 3002;

app.get("/tasks", (req, res) => {

    const tasks = db.prepare("SELECT * FROM tasks").all();

    const formattedTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        done: Boolean(task.done)
    }));

    res.json(formattedTasks);

});

app.get("/", (req, res) => {
    res.json({

        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});



app.get("/tasks/:id", (req, res) => {

    const taskId = Number(req.params.id);

    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(taskId);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json({
        id: task.id,
        title: task.title,
        done: Boolean(task.done)
    });

});
app.post("/tasks", (req, res) => {

    const { title } = req.body;

    if (!title) {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    const insert = db.prepare(
        "INSERT INTO tasks (title, done) VALUES (?, ?)"
    );

    const result = insert.run(title, 0);

    res.status(201).json({
        id: result.lastInsertRowid,
        title: title,
        done: false
    });

});

app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});
app.put("/tasks/:id", (req, res) => {

    const taskId = Number(req.params.id);

    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const { title, done } = req.body;

    if (!title || typeof done !== "boolean") {
        return res.status(400).json({
            error: "Title and done are required"
        });
    }

    task.title = title;
    task.done = done;

    res.json(task);

});
app.delete("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);

    const index = tasks.findIndex(t => t.id === taskId);

    if (index === -1) {
        return res.status(404).json({
            error: "Task not found"
        });
    }
    tasks.splice(index, 1);

    res.status(204).send();



});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});