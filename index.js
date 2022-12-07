const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
const commentsRouter = require("./routes/comments.js");
const swaggerUI = require("swagger-ui-express");

const yamljs = require("yamljs")
const swaggerSpec = yamljs.load("./swagger.yaml");

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.use("/comments", commentsRouter);

/* Error handler middleware */
app.use((err, req, res, next) => {
  if (!err.code) console.error(err.message, err.stack);
  res.status(err.code || 500).send({message: err.message});
});

app.listen(port, () => {
  console.log(`Server started. Docs at http://localhost:${port}/docs`);
});