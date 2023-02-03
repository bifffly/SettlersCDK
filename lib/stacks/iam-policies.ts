import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export function getPutItemPolicy(table: Table) {
  return new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['dynamodb:PutItem'],
    resources: [table.tableArn],
  });
}

export function getDeleteItemPolicy(table: Table) {
  return new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['dynamodb:DeleteItem'],
    resources: [table.tableArn],
  });
}

export function getCRUDItemPolicy(table: Table) {
  return new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem'],
    resources: [table.tableArn],
  });
}
