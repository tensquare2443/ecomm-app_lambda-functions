const AWS = require("aws-sdk");

exports.handler = async event => {
  AWS.config.update({ region: "us-east-1" });

  const dynamoTable = process.env.dynamoTable;

  const docClient = new AWS.DynamoDB();
  const productPath = event.headers["product-path"];
  const department = event.headers["department"];
  const params = {
    Key: {
      productPath: { S: productPath },
      department: { S: department }
    },
    TableName: dynamoTable
  };
  const headers = { "Access-Control-Allow-Origin": "*" };
  let response = { headers };

  return new Promise((resolve, reject) => {
    docClient.getItem(params, function(error, data) {
      if (error) {
        reject(error);
      } else resolve(data);
    });
  })
    .then(item => {
      response.statusCode = 200;
      response.body = JSON.stringify(item);

      return response;
    })
    .catch(e => {
      response.statusCode = 500;
      response.body = JSON.stringify(e);

      return response;
    });
};
