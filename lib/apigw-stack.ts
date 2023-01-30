import {
  Stack,
  StackProps
} from 'aws-cdk-lib';
import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';

export interface ApiGatewayStackProps extends StackProps {
  lambda: Function;
}

export class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const apiGateway = new WebSocketApi(this, 'game-state-api');
    apiGateway.addRoute('gamestate', {
      integration: new WebSocketLambdaIntegration('GameStateIntegration', props.lambda),
    });
  }
}
