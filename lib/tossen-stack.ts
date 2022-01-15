import * as cdk from '@aws-cdk/core';
import * as dynamo from '@aws-cdk/aws-dynamodb'
import {AttributeType} from '@aws-cdk/aws-dynamodb'
import * as apigw from '@aws-cdk/aws-apigateway';
import {LambdaIntegration} from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";

export interface TossenProps extends cdk.StackProps{
  environment: 'dev' | 'tst' | 'prd';
}

export class TossenStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: TossenProps) {
    super(scope, id, props);

    const serviceName = props.environment == 'prd' ? 'tossen' : `tossen-${props.environment}`;

    const tossenTable = new dynamo.Table(this, `${serviceName}-tossen-table`, {
      tableName: `${serviceName}-tournaments`,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
    });

    const tournamentTable = new dynamo.Table(this, `${serviceName}-tournament-table`, {
      tableName: `${serviceName}-tournaments-table`,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'type',
        type: AttributeType.STRING
      }
    });

    const sendMailQueueUrl = ssm.StringParameter.valueForStringParameter(this, `/com/benkhard/${props.environment}/mail-service/send-mail-queue-url`);

    const environment = {
      TOURNAMENT_TABLE: tossenTable.tableName,
      TOURNAMENTS_TABLE: tournamentTable.tableName,
      SEND_MAIL_QUEUE_URL: sendMailQueueUrl,
    };

    const createTournamentHandler = new NodejsFunction(this, `${serviceName}-create-tournament`, {
      functionName: `${serviceName}-create-tournament`,
      handler: 'handler',
      entry: 'src/create-tournament-handler.ts',
      environment,
    });
    tournamentTable.grantReadWriteData(createTournamentHandler);
    tossenTable.grantReadWriteData(createTournamentHandler);

    const sqsPolicy = new iam.PolicyStatement({
      actions: ['sqs:sendMessage'],
      resources: ['*']
    });
    createTournamentHandler.addToRolePolicy(sqsPolicy);

    const getTournamentHandler = new NodejsFunction(this, `${serviceName}-get-tournament`, {
      functionName: `${serviceName}-get-tournament`,
      handler: 'handler',
      entry: 'src/get-tournament-handler.ts',
      environment,
    });
    tournamentTable.grantReadData(getTournamentHandler);

    const postSubscriptionHandler = new NodejsFunction(this, `${serviceName}-post-subscription`, {
      functionName: `${serviceName}-post-subscription`,
      handler: 'handler',
      entry: 'src/post-subscription-handler.ts',
      environment,
    });
    tournamentTable.grantReadWriteData(postSubscriptionHandler);
    postSubscriptionHandler.addToRolePolicy(sqsPolicy);

    function

    const getSubscriptionsHandler = new NodejsFunction(this, `${serviceName}-get-subscriptions`, {
      functionName: `${serviceName}-get-subscriptions`,
      handler: 'handler',
      entry: 'src/get-subscriptions-handler.ts',
      environment
    });
    tournamentTable.grantReadData(getSubscriptionsHandler);

    const deleteSubscriptionsHandler = new NodejsFunction(this, `${serviceName}-delete-subscription`, {
      functionName: `${serviceName}-delete-subscription`,
      handler: 'handler',
      entry: 'src/delete-subscription-handler.ts',
      environment
    });
    tournamentTable.grantReadWriteData(deleteSubscriptionsHandler);

    const postScheduleHandler = new NodejsFunction(this, `${serviceName}-post-schedule`, {
      functionName: `${serviceName}-post-schedule`,
      handler: 'handler',
      entry: 'src/post-schedule-handler.ts',
      environment,
    });
    tournamentTable.grantReadWriteData(postScheduleHandler);

    const gateway = new apigw.RestApi(this, `${serviceName}`, {
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowHeaders: [...apigw.Cors.DEFAULT_HEADERS, 'token']
      },
    });

    const tournament = gateway.root.addResource('tournament');

    const tournamentId = tournament.addResource('{id}');
    tournamentId.addMethod('GET', new LambdaIntegration(getTournamentHandler));

    const schedule = tournamentId.addResource('schedule');
    schedule.addMethod('POST', new LambdaIntegration(postScheduleHandler));

    const subscriptions = tournamentId.addResource('subscriptions')
    subscriptions.addMethod('POST', new LambdaIntegration(postSubscriptionHandler));
    subscriptions.addMethod('GET', new LambdaIntegration(getSubscriptionsHandler));

    const subscriptionId = subscriptions.addResource('{subscriptionId}');
    subscriptionId.addMethod('DELETE', new LambdaIntegration(deleteSubscriptionsHandler));

    const tournaments = gateway.root.addResource('tournaments');
    tournaments.addMethod('POST', new LambdaIntegration(createTournamentHandler));
  }
}
