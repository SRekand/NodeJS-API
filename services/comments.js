const db = require("./db");
const helper = require("../helper");
const config = require("../config");

// Get comments
async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const [rows] = await db.query(
    `SELECT * FROM comments LIMIT ${offset},${config.listPerPage}`
    // `INSERT INTO comments(name, email, body) VALUES (1,1,1)`
  );
  return helper.emptyOrRows(rows);
}

// Create a comment
async function create(comment) {
  const result = await db.query(
    `INSERT INTO comments (name, email, body) VALUES (?, ?, ?)`,
    [comment.name, comment.email, comment.body]
  );
  if (result[0].affectedRows) {
    return {
      id: result[0].insertId,
      name: comment.name,
      email: comment.email,
      body: comment.body,
    };
  }
}

// Update a comment
async function update(id, comment) {
  await db.query(
    `UPDATE comments
     SET name="${comment.name}",
         email="${comment.email}",
         body="${comment.body}"
     WHERE id = ${id}`
  );

  return { message: "Comment updated successfully" };
}

// Delete a comment
async function remove(id) {
  const [result] = await db.query(`DELETE FROM comments WHERE id=${id}`);

  let message = "Comment deleted successfully";

  if (!result.affectedRows) {
    throw "Error in deleting a comment";
  }

  return { message };
}

module.exports = {
  getMultiple,
  create,
  update,
  remove,
};
