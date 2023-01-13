const database = require("./db");
const helper = require("../helper");
const configuration = require("../config");

// Get comments
async function getAllComments(page = 1) {
    const offset = helper.getOffset(page, configuration.listPerPage);
    const [rows] = await database.query(
        `SELECT *
         FROM comments LIMIT ${offset},${configuration.listPerPage}`
    );
    return helper.emptyOrRows(rows);
}

// Create a comment
async function create(comment) {
    const result = await database.query(
        `INSERT INTO comments (name, email, body)
         VALUES (?, ?, ?)`,
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
    await database.query(
        `UPDATE comments
         SET name="${comment.name}",
             email="${comment.email}",
             body="${comment.body}"
         WHERE id = ${id}`
    );

    return {message: "Comment updated successfully"};
}

// Delete a comment
async function remove(id) {
    const [result] = await database.query(`DELETE
                                           FROM comments
                                           WHERE id = ${id}`);
    let message = "Comment deleted successfully";

    if (!result.affectedRows) {
        throw "Error in deleting a comment";
    }
    return {message};
}

module.exports = {
    getAllComments,
    create,
    update,
    remove,
};
