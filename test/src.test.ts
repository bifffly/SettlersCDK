import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DynamodbStack } from '../lib/dynamodb-stack';
import { GameStateApiGatewayStack } from '../lib/game-state-apigw-stack';

test('DynamoDB stack created', () => {
  const app = new App();
  const dynamoDbStack = new DynamodbStack(app, 'DynamoDbStack');
  const dynamoDbTemplate = Template.fromStack(dynamoDbStack);
  dynamoDbTemplate.resourceCountIs('AWS::DynamoDB::Table', 1);
});

describe('Game State API Gateway Stack', () => {
  let gameStateApiTemplate: Template;

  beforeAll(() => {
    const app = new App();

    const gameStateApiStack = new GameStateApiGatewayStack(app, 'GameStateApiGatewayStack');
    gameStateApiTemplate = Template.fromStack(gameStateApiStack);
  });

  test('creates Lambda resources', () => {
    gameStateApiTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'game-state-handler.handler',
      Runtime: 'nodejs18.x',
    });
  });

  test('creates API Gateway resources', () => {
    gameStateApiTemplate.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
    gameStateApiTemplate.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: 'game-state-api',
      ProtocolType: 'WEBSOCKET',
      RouteSelectionExpression: '$request.body.action',
    });
    gameStateApiTemplate.resourceCountIs('AWS::ApiGatewayV2::Route', 1);
    gameStateApiTemplate.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'gamestate',
      RequestModels: {
        gamestate: 'gamestate-request-model',
      },
    });
    gameStateApiTemplate.resourceCountIs('AWS::ApiGatewayV2::Model', 1);
    gameStateApiTemplate.resourceCountIs('AWS::ApiGatewayV2::Integration', 1);
  });
});
