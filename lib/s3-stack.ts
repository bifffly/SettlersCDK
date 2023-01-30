import {
  Stack,
  StackProps
} from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class S3Stack extends Stack {
  readonly gameStateBucket: Bucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.gameStateBucket = new Bucket(this, 'game-state-handler-bucket');
  }
}