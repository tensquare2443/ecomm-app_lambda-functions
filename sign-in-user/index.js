// aws lambda update-function-code --function-name ENTER_FUNC_NAME --zip-file fileb://function.zip
const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.handler = async event => {
  const dynamoTable = process.env.dynamoTable;
  const jwtSecret = process.env.jwtSecret;

  const username = event.headers["x-username"];
  const password = event.headers["x-password"];

  AWS.config.update({
    region: "us-east-1"
  });

  const docClient = new AWS.DynamoDB();
  const table = dynamoTable;

  const getParams = {
    TableName: table,
    Key: {
      userId: { S: username }
    }
  };
  const headers = { "Access-Control-Allow-Origin": "*" };

  return new Promise((resolve, reject) => {
    docClient.getItem(getParams, function(err, data) {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        reject({ status: 500, error: err });
      } else {
        resolve(data);
      }
    });
  })
    .then(json => {
      const response = {
        body: JSON.stringify({}),
        headers
      };

      if (!json["Item"]) {
        response.statusCode = 404;

        return response;
      }

      return bcrypt
        .compare(password, json["Item"]["password"]["S"])
        .then(passwordIsCorrect => {
          if (!passwordIsCorrect) {
            response.statusCode = 404;

            return response;
          }

          const tokenSecret = jwtSecret;
          const tokenDuration = 60 * 60 * 24; //seconds

          const token = jwt.sign(
            {
              iss: "ecomm-app",
              sub: json["Item"]["userId"]["S"]
            },
            tokenSecret,
            { algorithm: "HS256", expiresIn: tokenDuration }
          );

          console.log(`token: ${token}`);

          const updateParams = {
            TableName: table,
            Key: {
              userId: { S: username }
            },
            UpdateExpression: "SET #tokenKey = :tokenVal",
            ExpressionAttributeNames: {
              "#tokenKey": "token"
            },
            ExpressionAttributeValues: {
              ":tokenVal": { S: token }
            },
            ReturnValues: "ALL_NEW"
          };

          return new Promise((resolve, reject) => {
            docClient.updateItem(updateParams, function(err, data) {
              if (err) {
                console.log("UPDATE REJECTED");
                console.error(
                  "Unable to read item. Error JSON:",
                  JSON.stringify(err, null, 2)
                );
                reject(500);
              } else {
                console.log("UPDATE RESOLVED");
                resolve(data);
              }
            });
          })
            .then(json => {
              console.log("JSONJSON: " + JSON.stringify(json));
              response.statusCode = 200;
              response.body = JSON.stringify({
                user: {
                  username: json["Attributes"]["userId"]["S"],
                  token: json["Attributes"]["token"]["S"]
                }
              });

              return response;
            })
            .catch(e => {
              if (e === 500) {
                response.statusCode = 500;
              } else {
                response.statusCode = 404;
              }

              return response;
            });
        })
        .catch(e => {
          console.log("bcrypt catch");
          response.statusCode = 500;

          return response;
        });
    })
    .catch(e => {
      const error = {
        statusCode: 500,
        body: JSON.stringify(e),
        headers
      };

      return error;
    });
};
