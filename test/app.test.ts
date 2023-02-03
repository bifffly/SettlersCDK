import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { GameStateStack } from '../lib/stacks/game-state-stack';

describe('Game State API Gateway Stack', () => {
  let gameStateTemplate: Template;

  beforeAll(() => {
    const app = new App();

    const gameStateStack = new GameStateStack(app, 'GameStateStack');
    gameStateTemplate = Template.fromStack(gameStateStack);
  });

  test('creates DynamoDB resources', () => {
    gameStateTemplate.resourceCountIs('AWS::DynamoDB::Table', 2);
  });

  test('creates Lambda resources', () => {
    gameStateTemplate.resourceCountIs('AWS::Lambda::Function', 4);
  });

  test('creates API Gateway resources', () => {
    gameStateTemplate.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
    gameStateTemplate.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: 'game-state-api',
      ProtocolType: 'WEBSOCKET',
      RouteSelectionExpression: '$request.body.action',
    });

    gameStateTemplate.resourceCountIs('AWS::ApiGatewayV2::Route', 4);
    gameStateTemplate.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: '$connect',
    });
    gameStateTemplate.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: '$disconnect',
    });
    gameStateTemplate.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'new-game',
    });
    gameStateTemplate.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'game-state',
    });

    gameStateTemplate.resourceCountIs('AWS::ApiGatewayV2::Integration', 4);
  });

  test('creates IAM resources', () => {
    gameStateTemplate.resourceCountIs('AWS::IAM::Policy', 4);
    gameStateTemplate.resourceCountIs('AWS::IAM::Role', 4);
  });

  test('creates IAM resources', () => {
    gameStateTemplate.resourceCountIs('AWS::IAM::Policy', 4);
    gameStateTemplate.resourceCountIs('AWS::IAM::Role', 4);
  });
});
