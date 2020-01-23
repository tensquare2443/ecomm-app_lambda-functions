// aws lambda update-function-code --function-name ENTER_FUNC_NAME --zip-file fileb://function.zip
const AWS = require("aws-sdk");

exports.handler = async event => {
  AWS.config.update({
    region: "us-east-1"
  });

  const dynamoTable = process.env.dynamoTable;
  const docClient = new AWS.DynamoDB();
  const params = {
    TableName: dynamoTable,
    Item: JSON.parse(event.body),
    ReturnConsumedCapacity: "TOTAL"
  };
  const headers = { "Access-Control-Allow-Origin": "*" };
  let response = { headers };

  return new Promise((resolve, reject) => {
    docClient.putItem(params, function(error, data) {
      if (error) {
        reject({ statusCode: 500, error });
      } else resolve(data);
    });
  })
    .then(data => {
      console.log(data);
      response.statusCode = 200;
      response.body = JSON.stringify(data);

      return response;
    })
    .catch(e => {
      console.log(e);
      response.statusCode = e.statusCode;
      response.body = JSON.stringify(e.error);

      return response;
    });
};
