import { Handler } from 'aws-cdk-lib/aws-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const ddb: DocumentClient = new DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const gameStateTableName = process.env.GAME_STATE_TABLE_NAME;
  if (!gameStateTableName) {
    throw new Error('game state table name not specified as environment variable');
  }

  const connectionsTableName = process.env.CONNECTIONS_TABLE_NAME;
  if (!connectionsTableName) {
    throw new Error('connections table name not specified as environment variable');
  }

  if (!event.body) {
    throw new Error('event body cannot be null');
  }
  const eventBody = JSON.parse(event.body);

  const updateConnectionParams: DocumentClient.UpdateItemInput = {
    TableName: connectionsTableName,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
    UpdateExpression: 'SET gameId = :g',
    ExpressionAttributeValues: {
      ':g': eventBody.gameId,
    },
  };

  const updateGameStateParams: DocumentClient.UpdateItemInput = {
    TableName: gameStateTableName,
    Key: {
      gameId: eventBody.gameId,
    },
    UpdateExpression: 'ADD connections :c',
    ExpressionAttributeValues: {
      ':c': ddb.createSet([event.requestContext.connectionId!]),
    },
  };

  try {
    await ddb.update(updateConnectionParams).promise();
  } catch (err) {
    throw new Error(`Failed to update connections table: ${err}`);
  }

  try {
    await ddb.update(updateGameStateParams).promise();
  } catch (err) {
    throw new Error(`Failed to update gameState table: ${err}`);
  }

  return {
    statusCode: 200,
    body: 'Connected.',
  };
};
