const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

exports.handler = async event => {
  const dynamoTable = process.env.dynamoTable;
  const jwtSecret = process.env.jwtSecret;

  const headers = { "Access-Control-Allow-Origin": "*" };
  let response = { headers };
  const docClient = new AWS.DynamoDB();
  AWS.config.update({ region: "us-east-1" });
  const username = event.headers["x-username"];
  const incomingToken = event.headers["x-user-token"];
  const params = {
    TableName: dynamoTable,
    Key: { userId: { S: username } }
  };

  return new Promise((resolve, reject) => {
    docClient.getItem(params, function(error, data) {
      if (error) {
        reject(error);
      } else resolve(data);
    });
  })
    .then(json => {
      if (!json["Item"]) {
        throw "User not found";
      } else if (json["Item"].token["S"] !== incomingToken) {
        throw "Invalid token";
      }

      const decoded = jwt.verify(incomingToken, jwtSecret);


      if (decoded.name === "TokenExpiredError") {
        throw "Token expired";
      }

      response.statusCode = 200;
      response.body = JSON.stringify("Authorized");

      return response;
    })
    .catch(e => {
      if (e === "User not found") {
        response.statusCode = 404;
      } else if (e === "Invalid token" || e === "Token expired") {
        response.statusCode = 403;
      } else {
        response.statusCode = 500;
      }

      response.body = JSON.stringify(e);

      return response;
    });
};
