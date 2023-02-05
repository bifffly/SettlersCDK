import { Handler } from 'aws-cdk-lib/aws-lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
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

  const gameId = uuidv4();

  const updateConnectionParams: DocumentClient.UpdateItemInput = {
    TableName: connectionsTableName,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
    UpdateExpression: 'SET gameId = :g',
    ExpressionAttributeValues: {
      ':g': gameId,
    },
  };

  const putGameIdParams: DocumentClient.PutItemInput = {
    TableName: gameStateTableName,
    Item: {
      gameId,
      connections: ddb.createSet([event.requestContext.connectionId!]),
      resources: {
        [event.requestContext.connectionId!]: {
          sheep: 0,
          wood: 0,
          clay: 0,
          wheat: 0,
          stone: 0,
        },
      },
    },
  };

  try {
    await ddb.update(updateConnectionParams).promise();
    // await ddb.put(putGameIdParams).promise();
  } catch (err) {
    throw new Error(`Failed to update connection for new game: ${err}`);
  }

  try {
    // await ddb.update(updateConnectionParams).promise();
    await ddb.put(putGameIdParams).promise();
  } catch (err) {
    throw new Error(`Failed to create new game: ${err}`);
  }

  return {
    statusCode: 200,
    body: 'Connected.',
  };
};
