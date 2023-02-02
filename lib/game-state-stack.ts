import { Stack, StackProps } from 'aws-cdk-lib';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class GameStateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'game-state-table', {
      partitionKey: {
        name: 'game-state-id',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    const connectLambda = new NodejsFunction(this, 'connect-function', {
      entry: 'src/connect-handler.ts',
      runtime: Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const disconnectLambda = new NodejsFunction(this, 'disconnect-function', {
      entry: 'src/disconnect-handler.ts',
      runtime: Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const apiGateway = new WebSocketApi(this, 'game-state-api', {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration('connect-handler', connectLambda),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration('disconnect-handler', disconnectLambda),
      },
    });

    new WebSocketStage(this, 'prod-stage', {
      webSocketApi: apiGateway,
      stageName: 'prod',
      autoDeploy: true,
    });
  }
}
