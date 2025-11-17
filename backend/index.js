import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import tasksRoutes from "./routes/tasks.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT  = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.use("/tasks", tasksRoutes(io));


server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id)
    });
});



