import { Handler } from 'aws-cdk-lib/aws-lambda';

// eslint-disable-next-line no-unused-vars
export const handler: Handler = async (event: any, context: any) => {
  const eventBody = JSON.parse(event.body);
  return {
    statusCode: 200,
    body: eventBody.gameId,
  };
};
