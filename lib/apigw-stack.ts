import {
  Stack,
  StackProps
} from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from 'constructs';

export interface ApiGatewayStackProps extends StackProps {
  lambda: Function;
}

export class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const apiGateway = new LambdaRestApi(this, 'game-state-api', {
      handler: props.lambda,
      proxy: false
    });

    const gameState = apiGateway.root.addResource('game-state');
    gameState.addMethod('GET')  // Retrieval
    gameState.addMethod('POST') // Update
  }
}
