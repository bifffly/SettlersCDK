import { Handler } from 'aws-cdk-lib/aws-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const ddb: DocumentClient = new DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME;
  if (!connectionsTableName) {
    throw new Error('connections table name not specified as environment variable');
  }

  const putParams: DocumentClient.PutItemInput = {
    TableName: connectionsTableName,
    Item: {
      connectionId: event.requestContext.connectionId,
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
