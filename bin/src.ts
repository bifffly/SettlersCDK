#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiGatewayStack } from '../lib/apigw-stack';
import { LambdaStack } from "../lib/lambda-stack";
import { S3Stack } from "../lib/s3-stack";
import { DynamodbStack } from "../lib/dynamodb-stack";

const app = new cdk.App();

const s3Stack = new S3Stack(app, 'S3Stack', {
  env: {
    account: '919611087808',
    region: 'us-east-1',
  },
});

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  env: {
    account: '919611087808',
    region: 'us-east-1',
  },
  bucket: s3Stack.bucket,
});

new ApiGatewayStack(app, 'ApiGatewayStack', {
  env: {
    account: '919611087808',
    region: 'us-east-1',
  },
  lambda: lambdaStack.lambda,
});

new DynamodbStack(app, 'DynamoDbStack', {
  env: {
    account: '919611087808',
    region: 'us-east-1',
  }
});