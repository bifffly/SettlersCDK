import { Stack, StackProps } from 'aws-cdk-lib';
import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { S3Stack } from './s3-stack';

export interface GameStateApiGatewayStackProps extends StackProps {
  s3Stack: S3Stack;
}

export class GameStateApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: GameStateApiGatewayStackProps) {
    super(scope, id, props);

    const lambda = new Function(this, 'game-state-function', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromBucket(props.s3Stack.gameStateBucket, ''),
    });

    const apiGateway = new WebSocketApi(this, 'game-state-api');
    apiGateway.addRoute('gamestate', {
      integration: new WebSocketLambdaIntegration('GameStateIntegration', lambda),
    });
  }
}
