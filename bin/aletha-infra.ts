#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib'
import { VpcStack } from '../lib/vpc-stack';
import { DbStack } from '../lib/db-stack';

/**
 * Configuration
 */
const { CDK_DEFAULT_ACCOUNT } = process.env;
const envCA = { region: 'ca-central-1', account: CDK_DEFAULT_ACCOUNT };

const app = new cdk.App();
const vpc = new VpcStack(app, 'vpc', { env: envCA });

new DbStack(app, 'db', {
  env: envCA,
  vpc: vpc.vpc,
  rdsSecretName: 'mainRdsSecret',
  writerClass: ec2.InstanceClass.T3,
  writerSize: ec2.InstanceSize.MEDIUM,
  readerClass: ec2.InstanceClass.T3,
  readerSize: ec2.InstanceSize.MEDIUM
})