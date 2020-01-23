var express = require("express");
var app = express();
var cors = require("cors");
const port = 3001;

const handlerFunc = require("./index.js").handler;

app.use(cors());

app.get("/authorize-user", (req, res) => {
  handlerFunc(req)
    .then(response => {
      if (response.statusCode === 404) {
        return res.send({ statusCode: 404 });
      }
      return res.send(JSON.parse(response.body));
    })
    .catch(e => {
      console.log("e: " + e);
      res.send(JSON.parse(e.body));
    });
});

app.listen(port, () => console.log(`listening on ${port}`));
