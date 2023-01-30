import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import {
  ApiGatewayStack,
  ApiGatewayStackProps,
} from "../lib/apigw-stack";
import { DynamodbStack } from "../lib/dynamodb-stack";
import {
  LambdaStack,
  LambdaStackProps,
} from "../lib/lambda-stack";
import { S3Stack } from "../lib/s3-stack";
import {
  Code,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import {
  AttributeType,
  BillingMode,
} from "aws-cdk-lib/aws-dynamodb";

let app: App;

beforeEach(() => {
  app = new App();
});

test('DynamoDB stack created', () => {
  const dynamoDbStack = new DynamodbStack(app, 'DynamoDbStack');
  const dynamoDbTemplate = Template.fromStack(dynamoDbStack);
  dynamoDbTemplate.resourceCountIs('AWS::DynamoDB::Table', 1);
});

test('S3 stack created', () => {
  const s3Stack = new S3Stack(app, 'S3Stack');
  const s3Template = Template.fromStack(s3Stack);
  s3Template.resourceCountIs('AWS::S3::Bucket', 1);
});

test('Lambda stack created', () => {
  const s3Stack = new S3Stack(app, 'S3Stack');

  const lambdaStackProps: LambdaStackProps = {
    bucket: s3Stack.bucket,
  };
  const lambdaStack = new LambdaStack(app, 'LambdaStack', lambdaStackProps);
  const lambdaTemplate = Template.fromStack(lambdaStack);
  lambdaTemplate.resourceCountIs('AWS::Lambda::Function', 1);
});

test('API Gateway stack created', () => {
  const s3Stack = new S3Stack(app, 'S3Stack');
  const lambdaStack = new LambdaStack(app, 'LambdaStack', {
    bucket: s3Stack.bucket,
  });

  const apiGatewayProps: ApiGatewayStackProps = {
    lambda: lambdaStack.lambda,
  };
  const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayStack', apiGatewayProps);
  const apiGatewayTemplate = Template.fromStack(apiGatewayStack);
  apiGatewayTemplate.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
  apiGatewayTemplate.resourceCountIs('AWS::ApiGatewayV2::Route', 1);
  apiGatewayTemplate.resourceCountIs('AWS::ApiGatewayV2::Integration', 1);
});
