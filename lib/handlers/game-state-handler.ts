import { Handler } from 'aws-cdk-lib/aws-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DocumentClient, UpdateItemInput } from 'aws-sdk/clients/dynamodb';

const ddb: DocumentClient = new DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) {
    throw new Error('table name not specified as environment variable');
  }

  if (!event.body) {
    return {
      statusCode: 500,
      body: 'Event body cannot be null.',
    };
  }
  const eventBody = JSON.parse(event.body);

  const updateParams: UpdateItemInput = {
    TableName: tableName,
    Key: {
      gameId: { S: eventBody.gameId },
    },
    UpdateExpression: 'ADD connections :c',
    ExpressionAttributeValues: {
      ':c': { SS: [event.requestContext.connectionId as string] },
    },
  };

  try {
    await ddb.update(updateParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: `Failed to connect: ${err}`,
    };
  }

  return {
    statusCode: 200,
    body: 'Connected.',
  };
};
