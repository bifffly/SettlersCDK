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

  const gameStateTableName = process.env.GAME_STATE_TABLE_NAME;
  if (!gameStateTableName) {
    throw new Error('game state table name not specified as environment variable');
  }

  const getGameIdParams: DocumentClient.GetItemInput = {
    TableName: connectionsTableName,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
  };

  const deleteConnectionParams: DocumentClient.DeleteItemInput = {
    TableName: connectionsTableName,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
  };

  function getRemoveFromGameStateParams(gameId: string): DocumentClient.UpdateItemInput {
    return {
      TableName: gameStateTableName!,
      Key: {
        gameId,
      },
      UpdateExpression: 'DELETE connections :c',
      ExpressionAttributeValues: {
        ':c': ddb.createSet([event.requestContext.connectionId!]),
      },
    };
  }

  let gameId: string;
  try {
    await ddb
      .get(getGameIdParams, (err, data) => {
        if (err) {
          throw new Error(`Failed to retrieve gameId: ${err}`);
        }
        gameId = data.Item!.gameId;
      })
      .promise();
  } catch (err) {
    throw new Error(`Failed to disconnect: ${err} with gameId: ${gameId!}`);
  }

  try {
    await ddb.update(getRemoveFromGameStateParams(gameId!)).promise();
  } catch (err) {
    throw new Error(`Failed to remove connection from gameState with gameId: ${gameId!}`);
  }

  try {
    await ddb.delete(deleteConnectionParams).promise();
  } catch (err) {
    throw new Error('Failed to delete connection reccord.');
  }

  return {
    statusCode: 200,
    body: 'Disconnected.',
  };
};
