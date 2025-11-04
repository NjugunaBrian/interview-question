const API_URL = "http://localhost:5000/tasks";

export async function getTasks(){
    const res = await fetch(API_URL);
    return res.json();
}

export async function createTask(task){
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
    return res.json();
}

export async function updateTask(id, task){
    const res = await fetch (`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    });
    return res.json();
}

export async function deleteTask(id){
    await fetch (`${API_URL}/${id}`, { method: "DELETE" });
}

