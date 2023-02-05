import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export interface LambdaBackedRouteProps {
  apiGateway: WebSocketApi;
  routeKey: string;
  handlerBasePath: string;
  runtime: Runtime;
  environment: any;
}

export class LambdaBackedRoute extends Construct {
  private readonly lambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaBackedRouteProps) {
    super(scope, id);

    this.lambda = new NodejsFunction(this, `${props.routeKey}-function`, {
      entry: join(__dirname, `${props.handlerBasePath}/${props.routeKey}-handler.ts`),
      runtime: props.runtime,
      environment: props.environment,
    });

    props.apiGateway.addRoute(props.routeKey, {
      integration: new WebSocketLambdaIntegration(`${props.routeKey}-integration`, this.lambda),
    });
  }

  addPolicy(policy: PolicyStatement) {
    this.lambda.addToRolePolicy(policy);
  }
}
