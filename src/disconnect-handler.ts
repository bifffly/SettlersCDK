import { Handler } from 'aws-cdk-lib/aws-lambda';

export const handler: Handler = async (event: any) => ({
  statusCode: 200,
  body: event.body,
});
