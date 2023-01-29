import {
  Stack,
  StackProps
} from 'aws-cdk-lib';
import {
  Code,
  Function,
  Runtime
} from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { S3Stack } from "./s3-stack";
import {Bucket} from "aws-cdk-lib/aws-s3";

export interface LambdaStackProps extends StackProps {
  bucket: Bucket;
}

export class LambdaStack extends Stack {
  readonly lambda: Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.lambda = new Function(this, 'game-state-function', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: Code.fromBucket(props.bucket, ''),
    });
  }
}