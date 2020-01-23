// aws lambda update-function-code --function-name ENTER_FUNC_NAME --zip-file fileb://function.zip
const AWS = require("aws-sdk");

exports.handler = async event => {
  AWS.config.update({
    region: "us-east-1"
  });

  const dynamoTable = process.env.dynamoTable;

  const docClient = new AWS.DynamoDB();
  const productSubset = event.headers["product-subset"];
  const department = "products";
  const params = {
    TableName: dynamoTable,
    KeyConditionExpression:
      "#pKeyProp = :pKeyVal AND begins_with(#sKeyProp, :sKeyVal)",
    ExpressionAttributeNames: {
      "#pKeyProp": "department",
      "#sKeyProp": "productPath"
    },
    ExpressionAttributeValues: {
      ":pKeyVal": { S: department },
      ":sKeyVal": { S: productSubset }
    }
  };

  return new Promise((resolve, reject) => {
    docClient.query(params, function(err, data) {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        reject({
          status: 500,
          error: err
        });
      } else {
        resolve(data);
      }
    });
  })
    .then(json => {
      const response = {
        statusCode: 200,
        body: JSON.stringify(json),
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      };

      return response;
    })
    .catch(e => {
      const error = {
        statusCode: 500,
        body: JSON.stringify(e),
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      };

      return error;
    });
};
