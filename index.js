const express = require("express");
const app = express();
const cors = require("cors");
const port = 3001;
const swaggerUI = require("swagger-ui-express");
const yamljs = require("yamljs")
const swaggerSpec = yamljs.load("./swagger.yaml");
const expressWs = require('express-ws')(app);
const Comments = require("./services/comments.js");
const fs = require("fs");
const readline = require('readline');

app.use( "/docs" , swaggerUI.serve , swaggerUI.setup(swaggerSpec) );
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
});

app.get("/", (req, res) => {
    res.json({message: "ok"});
});

/* Error handler middleware */
app.use((err, req, res, next) => {
    // Use error code 500 if error code is missing or not a number and return error message
    res.status(parseInt(err.code) || 500).send({message: err.code + ': ' + err.message});
});

function Notify(action, object) {
    expressWs.getWss().clients.forEach(client => client.send(
        JSON.stringify({
            action: action,
            object: object,
        })
    ));
}

app.get("/logs", async (req, res, next) => {
    const lines = [];
    const lineReader = readline.createInterface({
        input: fs.createReadStream('log.txt'),
        crlfDelay: Infinity
    });

    for await (const line of lineReader) {
        const fields = line.match(/(\\.|[^,])+/g);
        lines.push({
            timeStamp: fields[0],
            originalUrl: fields[1],
            method: fields[2],
        });
    }
    return res.send(lines);
});

function log(req, res, next) {
    const currentDate = new Date().toISOString();
    let date_ob = new Date(currentDate);

    let dateDay = date_ob.getDate();
    let dateMonth = date_ob.getMonth() + 1;
    let dateYear = date_ob.getFullYear();
    let time = date_ob.getHours() + ":" + date_ob.getMinutes() + ":" + date_ob.getSeconds();

    const timeStamp = dateDay + "-" + dateMonth + "-" + dateYear + " " + time;

    fs.appendFile('log.txt', timeStamp + ',' + req.originalUrl + ',' + req.method + '\r\n', function(err) {
        if (err) throw err;
    });
    next();
}

/* GET */
app.get("/comments", async function (req, res, next) {
    try {
        res.json(await Comments.getAllComments(req.query.page));
    } catch (err) {
        next(err);
    }
});

/* POST */
app.post("/comments", log, async function (req, res, next) {
    try {
        const newComment = await Comments.create(req.body);
        Notify("add", newComment);
        res.json(newComment);
    } catch (err) {
        next(err);
    }
});

/* PUT */
app.put("/comments/:id", log, async function (req, res, next) {
    try {
        res.json(await Comments.update(req.params.id, req.body));
        Notify("edit", {
            id: parseInt(req.params.id),
            name: req.body.name,
            email: req.body.email,
            body: req.body.body
        });
    } catch (err) {
        res.status(404).send({message:"Post not found"});
        next(err);
    }
});

/* DELETE */
app.delete("/comments/:id", log, async function (req, res, next) {
    try {
        await Comments.remove(req.params.id);
        Notify("delete", {
            id: parseInt(req.params.id)
        });
        res.status(204).send();
    } catch (err) {
        res.status(404).send();
        next(err);
    }
});

app.listen(port, () => {
    console.log(`Server started. Docs at http://localhost:${port}/docs`);
});
