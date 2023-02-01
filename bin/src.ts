#!/usr/bin/env node
import 'source-map-support/register';
import { App, StackProps } from 'aws-cdk-lib';
import { DynamodbStack } from '../lib/dynamodb-stack';
import { GameStateApiGatewayStack } from '../lib/game-state-apigw-stack';
import { S3Stack } from '../lib/s3-stack';

const app = new App();

const props: StackProps = {
  env: {
    account: '919611087808',
    region: 'us-east-1',
  },
};

new DynamodbStack(app, 'DynamoDbStack', props);

const s3Stack = new S3Stack(app, 'S3Stack', props);

new GameStateApiGatewayStack(app, 'GameStateApiGatewayStack', {
  ...props,
  s3Stack,
});
