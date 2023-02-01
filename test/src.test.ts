import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DynamodbStack } from '../lib/dynamodb-stack';
import { GameStateApiGatewayStack } from '../lib/game-state-apigw-stack';
import { S3Stack } from '../lib/s3-stack';

test('DynamoDB stack created', () => {
  const app = new App();
  const dynamoDbStack = new DynamodbStack(app, 'DynamoDbStack');
  const dynamoDbTemplate = Template.fromStack(dynamoDbStack);
  dynamoDbTemplate.resourceCountIs('AWS::DynamoDB::Table', 1);
});

test('S3 stack created', () => {
  const app = new App();
  const s3Stack = new S3Stack(app, 'S3Stack');
  const s3StackTemplate = Template.fromStack(s3Stack);
  s3StackTemplate.resourceCountIs('AWS::S3::Bucket', 1);
});

describe('Game State API Gateway Stack', () => {
  let gameStateApiTemplate: Template;

  beforeAll(() => {
    const app = new App();
    const s3Stack = new S3Stack(app, 'S3Stack');

    const gameStateApiStack = new GameStateApiGatewayStack(app, 'GameStateApiGatewayStack', { s3Stack });
    gameStateApiTemplate = Template.fromStack(gameStateApiStack);
  });

  test('creates Lambda resources', () => {
    gameStateApiTemplate.resourceCountIs('AWS::Lambda::Function', 1);
  });

  test('creates API Gateway resources', () => {
    gameStateApiTemplate.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
    gameStateApiTemplate.resourceCountIs('AWS::ApiGatewayV2::Route', 1);
    gameStateApiTemplate.resourceCountIs('AWS::ApiGatewayV2::Integration', 1);
  });
});
