var express = require("express");
var app = express();
var cors = require("cors");
const bodyParser = require("body-parser");
const port = 3002;
const handlerFunc = require("./index.js").handler;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/add-product", (req, res) => {
  console.log(Object.keys(req));
  console.log(req.body);

  console.log(`local.js: ${req.body}`);

  handlerFunc(req).then(response => {
    res.send(JSON.parse(response.body));
  });
});

app.listen(port, () => console.log(`listening on ${port}`));
