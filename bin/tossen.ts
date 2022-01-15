#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TossenStack } from '../lib/tossen-stack';

const app = new cdk.App();
new TossenStack(app, 'TossenStack', {
    environment: "dev",
});
