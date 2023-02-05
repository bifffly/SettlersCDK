import { Construct } from 'constructs';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaBackedRoute } from './lambda-backed-route';

export interface BuiltInRouteProps {
  handlerAlias: string;
  runtime: Runtime;
  environment: any;
}

export interface LambdaBackedWebSocketApiProps {
  connectHandlerProps?: BuiltInRouteProps;
  defaultHandlerProps?: BuiltInRouteProps;
  disconnectHandlerProps?: BuiltInRouteProps;
  handlerBasePath: string;
}

export class LambdaBackedWebSocketApi extends Construct {
  private readonly apiGateway: WebSocketApi;

  readonly connectHandler?: NodejsFunction;

  readonly defaultHandler?: NodejsFunction;

  readonly disconnectHandler?: NodejsFunction;

  private readonly handlerBasePath: string;

  constructor(scope: Construct, id: string, props: LambdaBackedWebSocketApiProps) {
    super(scope, id);

    this.handlerBasePath = props.handlerBasePath;

    this.connectHandler = props.connectHandlerProps
      ? this.addBuiltInRouteHandler(props.connectHandlerProps)
      : undefined;
    this.defaultHandler = props.defaultHandlerProps
      ? this.addBuiltInRouteHandler(props.defaultHandlerProps)
      : undefined;
    this.disconnectHandler = props.disconnectHandlerProps
      ? this.addBuiltInRouteHandler(props.disconnectHandlerProps)
      : undefined;

    this.apiGateway = new WebSocketApi(this, 'web-socket-api', {
      connectRouteOptions: props.connectHandlerProps
        ? {
          integration: new WebSocketLambdaIntegration('connect-handler', this.connectHandler!),
        }
        : undefined,
      defaultRouteOptions: props.defaultHandlerProps
        ? {
          integration: new WebSocketLambdaIntegration('default-handler', this.defaultHandler!),
        }
        : undefined,
      disconnectRouteOptions: props.disconnectHandlerProps
        ? {
          integration: new WebSocketLambdaIntegration('disconnect-handler', this.disconnectHandler!),
        }
        : undefined,
    });
  }

  addBuiltInRouteHandler(props: BuiltInRouteProps) {
    return new NodejsFunction(this, `${props.handlerAlias}-handler`, {
      entry: join(__dirname, `${this.handlerBasePath}/${props.handlerAlias}-handler.ts`),
      runtime: props.runtime,
      environment: props.environment,
    });
  }

  addLambdaBackedRoute(routeKey: string, runtime: Runtime, environment: any) {
    return new LambdaBackedRoute(this, `${routeKey}-lambda-route`, {
      apiGateway: this.apiGateway,
      routeKey,
      handlerBasePath: this.handlerBasePath,
      runtime,
      environment,
    });
  }

  addStage(stageName: string) {
    return new WebSocketStage(this, `${stageName}-stage`, {
      webSocketApi: this.apiGateway,
      stageName,
      autoDeploy: true,
    });
  }
}
