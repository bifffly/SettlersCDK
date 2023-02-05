import { Stack, StackProps } from 'aws-cdk-lib';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { join } from 'path';
import { getCRUDItemPolicy, getPutItemPolicy } from './iam-policies';

export class GameStateStack extends Stack {
  private readonly connectionsTable: Table;

  private readonly gameStateTable: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.connectionsTable = new Table(this, 'connections-table', {
      partitionKey: {
        name: 'connectionId',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    this.gameStateTable = new Table(this, 'game-state-table', {
      partitionKey: {
        name: 'gameId',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    const connectLambda = this.addLambda(
      'connect',
      {
        TABLE_NAME: this.connectionsTable.tableName,
      },
      [getPutItemPolicy(this.connectionsTable)]
    );

    const disconnectLambda = this.addLambda(
      'disconnect',
      {
        CONNECTIONS_TABLE_NAME: this.connectionsTable.tableName,
        GAME_STATE_TABLE_NAME: this.gameStateTable.tableName,
      },
      [getCRUDItemPolicy(this.connectionsTable), getCRUDItemPolicy(this.gameStateTable)]
    );

    const apiGateway = new WebSocketApi(this, 'game-state-api', {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration('connect-handler', connectLambda),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration('disconnect-handler', disconnectLambda),
      },
    });

    this.addLambdaBackedRoute(
      apiGateway,
      'new-game',
      {
        GAME_STATE_TABLE_NAME: this.gameStateTable.tableName,
        CONNECTIONS_TABLE_NAME: this.connectionsTable.tableName,
      },
      [getPutItemPolicy(this.gameStateTable), getCRUDItemPolicy(this.connectionsTable)]
    );

    this.addLambdaBackedRoute(
      apiGateway,
      'game-state',
      {
        GAME_STATE_TABLE_NAME: this.gameStateTable.tableName,
        CONNECTIONS_TABLE_NAME: this.connectionsTable.tableName,
      },
      [getCRUDItemPolicy(this.gameStateTable), getCRUDItemPolicy(this.connectionsTable)]
    );

    new WebSocketStage(this, 'prod-stage', {
      webSocketApi: apiGateway,
      stageName: 'prod',
      autoDeploy: true,
    });
  }

  private addLambda(routeKey: string, environment: any, policies: PolicyStatement[]) {
    const lambda = new NodejsFunction(this, `${routeKey}-function`, {
      entry: join(__dirname, `../handlers/${routeKey}-handler.ts`),
      runtime: Runtime.NODEJS_18_X,
      environment,
    });

    policies.forEach((policy: PolicyStatement) => {
      lambda.addToRolePolicy(policy);
    });

    return lambda;
  }

  private addLambdaBackedRoute(api: WebSocketApi, routeKey: string, environment: any, policies: PolicyStatement[]) {
    const lambda = this.addLambda(routeKey, environment, policies);

    api.addRoute(routeKey, {
      integration: new WebSocketLambdaIntegration(`${routeKey}-handler`, lambda),
    });
  }
}
