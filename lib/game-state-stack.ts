import { Stack, StackProps } from 'aws-cdk-lib';
import { WebSocketApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'path';
import { CfnIntegration, CfnModel, CfnRoute } from 'aws-cdk-lib/aws-apigatewayv2';
import { JsonSchemaType, JsonSchemaVersion } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

export class GameStateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Table(this, 'game-state-table', {
      partitionKey: {
        name: 'game-state-id',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    const lambda = new Function(this, 'game-state-function', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'game-state-handler.handler',
      code: Code.fromAsset(join(__dirname, '../src')),
    });

    const apiGateway = new WebSocketApi(this, 'game-state-api');

    const schema = {
      schema: JsonSchemaVersion.DRAFT4,
      title: 'gamestate',
      type: JsonSchemaType.OBJECT,
      properties: {
        gameId: { type: JsonSchemaType.STRING },
      },
    };

    this.addRoute(apiGateway, 'gamestate', schema);

    new CfnIntegration(this, 'gamestate-api-integration', {
      apiId: apiGateway.apiId,
      integrationType: 'AWS',
      integrationUri: `arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/${lambda.functionArn}/invocations`,
    });
  }

  private addRoute(api: WebSocketApi, name: string, schema: any) {
    const model = new CfnModel(this, `${name}-request-model`, {
      apiId: api.apiId,
      name: `${name}-request-model`,
      schema,
    });

    new CfnRoute(this, `${name}-route`, {
      apiId: api.apiId,
      routeKey: name,
      requestModels: { [name]: model.name },
    });
  }
}
