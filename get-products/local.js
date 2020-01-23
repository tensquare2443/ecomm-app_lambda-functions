var express = require("express");
var app = express();
var cors = require("cors");
const port = 3000;

const handlerFunc = require("./index.js").handler;

app.use(cors());

app.get("/fetch-products", (req, res) => {
  console.log(req.headers);

  handlerFunc(req).then(response => {
    res.send(JSON.parse(response.body));
  });
});

app.listen(port, () => console.log(`listening on ${port}`));
