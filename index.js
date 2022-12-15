const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
const swaggerUI = require("swagger-ui-express");
const yamljs = require("yamljs")
const swaggerSpec = yamljs.load("./swagger.yaml");
const expressWs = require('express-ws')(app);
const comments = require("./services/comments.js");

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.ws('/', function (ws, req) {
    ws.on('message', function (msg) {
        expressWs.getWss().clients.forEach(client => client.send(msg));
    });
    console.log('socket', req.headers["user-agent"]);
});

app.get("/", (req, res) => {
    res.json({message: "ok"});
});

/* Error handler middleware */
app.use((err, req, res, next) => {

    // Console log the error if error code is missing or not a number
    if (!err.code || isNaN(err.code)) console.error(err.message, err.stack);

    // Use error code 500 if error code is missing or not a number and return error message
    res.status(parseInt(err.code) || 500).send({message: err.code + ': ' + err.message});

});

function notify(action, object) {
    expressWs.getWss().clients.forEach(client => client.send(
        JSON.stringify({
            action: action,
            object: object,
        })
    ));
}

/* GET */
app.get("/comments", async function (req, res, next) {
    try {
        res.json(await comments.getMultiple(req.query.page));
    } catch (err) {
        console.error(`Error while getting the comments `, err.message);
        next(err);
    }
});

/* POST */
app.post("/comments", async function (req, res, next) {
    try {
        const newComment = await comments.create(req.body);
        notify("add", newComment);
        res.json(newComment);
    } catch (err) {
        console.error(`Error while creating a comment`, err.message);
        next(err);
    }
});

/* PUT */
app.put("/comments/:id", async function (req, res, next) {
    try {
        res.json(await comments.update(req.params.id, req.body));
        notify("edit", {
            id: parseInt(req.params.id),
            name: req.body.name,
            email: req.body.email,
            body: req.body.body
        });
        console.log(expressWs.getWss().clients)
    } catch (err) {
        res.status(404).send();
        console.error(`Error while updating comments`, err.message);
        next(err);
    }
});

/* DELETE */
app.delete("/comments/:id", async function (req, res, next) {
    try {
        await comments.remove(req.params.id);
        notify("delete", {
            id: parseInt(req.params.id)
        });
        res.status(204).send();
    } catch (err) {
        res.status(404).send();
        console.error(`Error while deleting comments`, err.message);
        next(err);
    }
});

app.listen(port, () => {
    console.log(`Server started. Docs at http://localhost:${port}/docs`);
});
