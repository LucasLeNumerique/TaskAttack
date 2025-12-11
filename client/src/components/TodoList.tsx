import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Task {
  id: number;
  title: string;
  done: boolean;
}

const TodoList = () => {
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // ---- GET tasks
  const { data, isLoading, isError } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("http://localhost:4000/todos");
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
  });

  // ---- CREATE task
  const createTask = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("http://localhost:4000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  // ---- UPDATE task (PATCH)
  const updateTask = useMutation({
    mutationFn: async ({ id, title, done }: { id: number; title?: string; done?: boolean }) => {
      const res = await fetch(`http://localhost:4000/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, done }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries(["tasks"]);
    },
  });

  // ---- DELETE task
  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:4000/todos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur serveur");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  // ---- UI
  if (isLoading) return <p>Chargement…</p>;
  if (isError) return <p>Erreur lors du chargement.</p>;
  if (!data || data.length === 0) return <p>Aucune tâche pour le moment.</p>;

  return (
    <div>
      <h1>Todo List</h1>

      {/* CREATE */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTask.trim()) return;
          createTask.mutate(newTask);
          setNewTask("");
        }}
      >
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nouvelle tâche"
        />
        <button type="submit">Ajouter</button>
      </form>

      <ul>
        {data.map((task) => (
          <li key={task.id}>
            {editingId === task.id ? (
              <>
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                />
                <button
                  onClick={() =>
                    updateTask.mutate({ id: task.id, title: editingTitle })
                  }
                >
                  Sauver
                </button>
                <button onClick={() => setEditingId(null)}>Annuler</button>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() =>
                    updateTask.mutate({ id: task.id, done: !task.done })
                  }
                />
                {task.title}
                <button
                  onClick={() => {
                    setEditingId(task.id);
                    setEditingTitle(task.title);
                  }}
                >
                  Modifier
                </button>
                <button onClick={() => deleteTask.mutate(task.id)}>
                  Supprimer
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;