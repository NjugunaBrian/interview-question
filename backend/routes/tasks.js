import { Router } from "express";
import { pool } from "../db.js";
import redisClient from "../redis.js";

const router = Router();

export default (io) => {
    // CREATE TASK
    router.post("/", async (req, res) => {
        const { description, status, due_date } = req.body;

        try {
            const result = await pool.query(
                `INSERT INTO tasks (description, status, due_date) VALUES ($1, $2, $3) RETURNING *`,
                [description, status, due_date]
            );
            const newTask = result.rows[0];

            // clear cache
            await redisClient.del("tasks");
            //Emit real-time event
            io.emit("taskCreated", newTask);
            res.json(newTask);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to create task" });
        }
    });

    // GET ALL TASKS
    router.get("/", async (req, res) => {
        try {
            const cachedTasks = await redisClient.get("tasks");
            if (cachedTasks) {
                return res.json(JSON.parse(cachedTasks));
            }
            const result = await pool.query(`SELECT * FROM tasks ORDER BY id DESC`);
            const tasks = result.rows;

            //Store in redis for 30 seconds
            await redisClient.setEx("tasks", 30, JSON.stringify(tasks));
            res.json(tasks);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to fetch tasks " });
        }
    });

    //UPDATE TASKS
    router.put("/:id", async (req, res) => {
        const { id } = req.params;
        const { description, status, due_date } = req.body;

        try {
            const result = await pool.query(
                `UPDATE tasks SET description = $1, status = $2, due_date = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
                [description, status, due_date, id]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Task not found " });
            }

            const updatedTask = result.rows[0];

            //invalidate cache
            await redisClient.del("tasks");

            //Emit real-time event
            io.emit("taskUpdated", updatedTask);
            res.json(updatedTask);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to update task" });
        }
    });

    //DELETE TASKS
    router.delete("/:id", async (req, res) => {
        const { id } = req.params;

        try {
            const result = await pool.query(
                `DELETE FROM tasks WHERE id = $1 RETURNING *`,
                [id]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            const deletedTask = result.rows[0];

            //invalidate cache
            await redisClient.del("tasks");

            //Emit real-time event
            io.emit(" taskDeleted", deletedTask);

            res.json(deletedTask);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to delete task" });
        }
    });
    return router;
}



