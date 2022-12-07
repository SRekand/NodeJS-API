const express = require("express");
const router = express.Router();
const comments = require("../services/comments.js");

/* GET */
router.get("/", async function (req, res, next) {
  try {
    res.json(await comments.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting the comments `, err.message);
    next(err);
  }
});

/* POST */
router.post("/", async function (req, res, next) {
  try {
    res.json(await comments.create(req.body));
  } catch (err) {
    console.error(`Error while creating a comment`, err.message);
    next(err);
  }
});

/* PUT */
router.put("/:id", async function (req, res, next) {
  try {
    res.json(await comments.update(req.params.id, req.body));
  } catch (err) {
    res.status(404).send();
    console.error(`Error while updating comments`, err.message);
    next(err);
  }
});

/* DELETE */
router.delete("/:id", async function (req, res, next) {
  try {
    res.json(await comments.remove(req.params.id));
  } catch (err) {
    res.status(404).send();
    console.error(`Error while deleting comments`, err.message);
    next(err);
  }
});

module.exports = router;
