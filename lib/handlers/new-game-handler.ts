import { Handler } from 'aws-cdk-lib/aws-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const ddb: DocumentClient = new DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) {
    throw new Error('table name not specified as environment variable');
  }

  const putParams = {
    TableName: tableName,
    Item: {
      gameId: uuidv4(),
      connections: [event.requestContext.connectionId],
    },
  };

  try {
    await ddb.put(putParams).promise();
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
