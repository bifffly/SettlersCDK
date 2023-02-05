import { Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { getCRUDItemPolicy, getPutItemPolicy } from './iam-policies';
import { LambdaBackedWebSocketApi } from '../constructs/lambda-backed-web-socket-api';

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

    const lambdaEnvironment = {
      GAME_STATE_TABLE_NAME: this.gameStateTable.tableName,
      CONNECTIONS_TABLE_NAME: this.connectionsTable.tableName,
    };

    const builtInProps = {
      runtime: Runtime.NODEJS_18_X,
      environment: lambdaEnvironment,
    };

    const apiGateway = new LambdaBackedWebSocketApi(this, 'game-state-api', {
      connectHandlerProps: { ...builtInProps, handlerAlias: 'connect' },
      disconnectHandlerProps: { ...builtInProps, handlerAlias: 'disconnect' },
      handlerBasePath: '../handlers',
    });

    apiGateway.connectHandler!.addToRolePolicy(getPutItemPolicy(this.connectionsTable));

    apiGateway.disconnectHandler!.addToRolePolicy(getCRUDItemPolicy(this.connectionsTable));
    apiGateway.disconnectHandler!.addToRolePolicy(getCRUDItemPolicy(this.gameStateTable));

    const newGameRoute = apiGateway.addLambdaBackedRoute('new-game', Runtime.NODEJS_18_X, lambdaEnvironment);
    newGameRoute.addPolicy(getCRUDItemPolicy(this.connectionsTable));
    newGameRoute.addPolicy(getPutItemPolicy(this.gameStateTable));

    const joinGameRoute = apiGateway.addLambdaBackedRoute('join-game', Runtime.NODEJS_18_X, lambdaEnvironment);
    joinGameRoute.addPolicy(getCRUDItemPolicy(this.connectionsTable));
    joinGameRoute.addPolicy(getCRUDItemPolicy(this.gameStateTable));

    apiGateway.addStage('prod');
  }
}
