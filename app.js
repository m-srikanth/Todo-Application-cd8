const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initiatingDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("It's Running...");
    });
  } catch (e) {
    console.log(`Error is ${e.message}`);
  }
};
initiatingDB();
//API-1
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriorityProperties = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusProperties = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let array = null;
  let query = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}' AND status = '${status}';`;
      break;
    case hasPriorityProperties(request.query):
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    case hasStatusProperties(request.query):
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    default:
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }
  array = await db.all(query);
  response.send(array);
});
//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id = ${todoId};`;
  const result = await db.get(query);
  response.send(result);
});
//API-3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const query = `INSERT INTO todo (id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}');`;
  const result = await db.run(query);
  response.send("Todo Successfully Added");
});
//API-4
app.put("/todos/:todoId/", async (request, response) => {
  let result = "";
  const { todoId } = request.params;
  const data = request.body;
  switch (true) {
    case data.status !== undefined:
      result = "Status";
      break;
    case data.priority !== undefined:
      result = "Priority";
      break;
    case data.todo !== undefined:
      result = "Todo";
      break;
  }
  const previous = `SELECT * FROM todo WHERE id = ${todoId};`;
  const preTodo = await db.get(previous);
  const {
    todo = preTodo.todo,
    priority = preTodo.priority,
    status = preTodo.status,
  } = request.body;
  const query = `UPDATE todo SET todo = '${todo}', priority = '${priority}', status = '${status}' WHERE id = ${todoId};`;
  const adding = await db.run(query);
  response.send(`${result} Updated`);
});
//API-5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id = ${todoId};`;
  const result = await db.get(query);
  response.send("Todo Deleted");
});
module.exports = app;
