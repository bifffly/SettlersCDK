import { Handler } from 'aws-cdk-lib/aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) {
    throw new Error('table name not specified as environment variable');
  }

  const deleteParams = {
    TableName: tableName,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
  };

  try {
    await ddb.delete(deleteParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: `Failed to disconnect: ${err}`,
    };
  }

  return {
    statusCode: 200,
    body: 'Disconnected.',
  };
};
