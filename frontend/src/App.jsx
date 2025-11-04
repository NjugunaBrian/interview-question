import { useState } from "react";
import { createTask, deleteTask, getTasks, updateTask } from "./services/tasks";
import { useEffect } from "react";
import { socket } from "./services/socket";


function App() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState("");

  async function loadTasks(){
    const data = await getTasks();
    setTasks(data);
  }

  async function handleAddTask(e){
    e.preventDefault();
    await createTask({ description, status: "pending" });
    setDescription("");
    loadTasks();
  }

  async function handleToggleStatus(task){
    const newStatus = task.status === "pending" ? "done" : "pending";
    await updateTask(task.id, { ...task, status: newStatus });
    loadTasks();
  }

  async function handleDelete(id){
    await deleteTask(id);
    loadTasks();
  }

  useEffect(() => {
    loadTasks();
    // Listeners for socket events
    socket.on("taskCreated", (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    });

    socket.on("taskDeleted", (id) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    });

    //Clean up socket listeners when component unmounts
    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-xl bg-white shadow p-6 rounded-xl space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-700">
          Task Manager
        </h1>
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input className="flex-1 border p-2 rounded" placeholder="Task Description..." value={description} onChange={e => setDescription(e.target.value)} required />
          <button className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">Add</button>
        </form>

        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center justify-between bg-50 p-3 rounded shadow-sm">
              <div>
                <p className={`font-medium ${task.status === "done" ? "line-through text-gray-500" : ""}`}>
                  {task.description}
                </p>
                <small className="text-sm text-gray-600">{task.status}</small>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggleStatus(task)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                  {task.status === "pending" ? "Done" : "Undo"}
                </button>
                <button onClick={() => handleDelete(task.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  Delete
                </button>
              </div>

            </li>
          ))}
        </ul>

      </div>

      
    </div>
  );
}

export default App;
