import { Handler } from 'aws-cdk-lib/aws-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DeleteItemInput, DocumentClient, UpdateItemInput } from 'aws-sdk/clients/dynamodb';

const ddb: DocumentClient = new DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME;
  if (!connectionsTableName) {
    throw new Error('connections table name not specified as environment variable');
  }

  const gameStateTableName = process.env.GAME_STATE_TABLE_NAME;
  if (!gameStateTableName) {
    throw new Error('game state table name not specified as environment variable');
  }

  if (!event.body) {
    return {
      statusCode: 500,
      body: 'Event body cannot be null',
    };
  }

  const eventBody = JSON.parse(event.body);

  const deleteConnectionParams: DeleteItemInput = {
    TableName: connectionsTableName,
    Key: {
      connectionId: { S: event.requestContext.connectionId },
    },
  };

  const updateGameStateParams: UpdateItemInput = {
    TableName: gameStateTableName,
    Key: {
      gameId: { S: eventBody.gameId },
    },
    UpdateExpression: 'DELETE connections :c',
    ExpressionAttributeValues: {
      ':c': { SS: [event.requestContext.connectionId as string] },
    },
  };

  try {
    await ddb.update(updateGameStateParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: `Failed to disconnect: ${err}`,
    };
  }

  try {
    await ddb.delete(deleteConnectionParams).promise();
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
