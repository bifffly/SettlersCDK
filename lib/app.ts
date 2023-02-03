#!/usr/bin/env node
import 'source-map-support/register';
import { App, StackProps } from 'aws-cdk-lib';
import { GameStateStack } from './stacks/game-state-stack';

const app = new App();

const props: StackProps = {
  env: {
    account: '919611087808',
    region: 'us-east-1',
  },
};

new GameStateStack(app, 'GameStateStack', props);
