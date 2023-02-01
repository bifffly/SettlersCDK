import { Stack, StackProps } from 'aws-cdk-lib';
import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';

export class GameStateApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambda = new Function(this, 'game-state-function', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'game-state-handler.handler',
      code: Code.fromAsset(join(__dirname, '../src')),
    });

    const apiGateway = new WebSocketApi(this, 'game-state-api');
    apiGateway.addRoute('gamestate', {
      integration: new WebSocketLambdaIntegration('GameStateIntegration', lambda),
    });
  }
}
