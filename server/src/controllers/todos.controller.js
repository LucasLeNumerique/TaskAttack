import { pool } from "../db.js";

// -----------------------------
// GET /todos
// -----------------------------
export async function getTodos(req, res) {
  try {
    const result = await pool.query("SELECT * FROM todo ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ getTodos error:", err);
    res.status(500).json({ error: "Impossible de récupérer les tâches" });
  }
}

// -----------------------------
// POST /todos
// -----------------------------
export async function createTodo(req, res) {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Le titre est requis" });
    }

    const result = await pool.query(
      "INSERT INTO todo (title, done) VALUES ($1, $2) RETURNING *",
      [title.trim(), false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ createTodo error:", err);
    res.status(500).json({ error: "Impossible de créer la tâche" });
  }
}

// -----------------------------
// PATCH /todos/:id
// -----------------------------
export async function updateTodo(req, res) {
  try {
    const { id } = req.params;
    const { title, done } = req.body;

    // Récupérer la tâche existante
    const existing = await pool.query("SELECT * FROM todo WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    const newTitle = title ?? existing.rows[0].title;
    const newDone = typeof done === "boolean" ? done : existing.rows[0].done;

    const result = await pool.query(
      "UPDATE todo SET title = $1, done = $2 WHERE id = $3 RETURNING *",
      [newTitle, newDone, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ updateTodo error:", err);
    res.status(500).json({ error: "Impossible de mettre à jour la tâche" });
  }
}

// -----------------------------
// DELETE /todos/:id
// -----------------------------
export async function deleteTodo(req, res) {
  try {
    const { id } = req.params;

    const existing = await pool.query("SELECT * FROM todo WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    await pool.query("DELETE FROM todo WHERE id = $1", [id]);

    res.json({ message: "Tâche supprimée" });
  } catch (err) {
    console.error("❌ deleteTodo error:", err);
    res.status(500).json({ error: "Impossible de supprimer la tâche" });
  }
}