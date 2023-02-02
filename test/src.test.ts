import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { GameStateStack } from '../lib/game-state-stack';

describe('Game State API Gateway Stack', () => {
  let gameStateTemplate: Template;

  beforeAll(() => {
    const app = new App();

    const gameStateStack = new GameStateStack(app, 'GameStateStack');
    gameStateTemplate = Template.fromStack(gameStateStack);
  });

  test('creates DynamoDB resources', () => {
    gameStateTemplate.resourceCountIs('AWS::DynamoDB::Table', 1);
  });

  test('creates Lambda resources', () => {
    gameStateTemplate.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'game-state-handler.handler',
      Runtime: 'nodejs18.x',
    });
  });

  test('creates API Gateway resources', () => {
    gameStateTemplate.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
    gameStateTemplate.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: 'game-state-api',
      ProtocolType: 'WEBSOCKET',
      RouteSelectionExpression: '$request.body.action',
    });
    gameStateTemplate.resourceCountIs('AWS::ApiGatewayV2::Route', 1);
    gameStateTemplate.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'gamestate',
      RequestModels: {
        gamestate: 'gamestate-request-model',
      },
    });
    gameStateTemplate.resourceCountIs('AWS::ApiGatewayV2::Model', 1);
    gameStateTemplate.resourceCountIs('AWS::ApiGatewayV2::Integration', 1);
  });
});
