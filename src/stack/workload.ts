import * as cdk from "aws-cdk-lib";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import { PublicHostedZone } from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

import { Config } from "../config/types";
import { buildAppUrl } from "../helpers/url-builder";

export interface WorkloadStackProps extends cdk.StackProps {
  config: Config;
}

export class WorkloadStack extends cdk.Stack {
  config: Config;

  constructor(scope: Construct, id: string, props: WorkloadStackProps) {
    super(scope, id, props);
    this.config = props.config;

    const publicHostedZone = PublicHostedZone.fromLookup(this, "PublicHostedZone", {
      domainName: props.config.domain,
    });
    this.setBackend(publicHostedZone);
  }

  setBackend(publicHostedZone: route53.IPublicHostedZone): void {
    const repository = ecr.Repository.fromRepositoryArn(this, "BackendRepository", this.config.backend.ecrRepoArn);

    const backendEndpoint = buildAppUrl(this.config.backend.subdomain, this.config.domain, this.config.environmentName);

    const backend = new lambda.DockerImageFunction(this, "BackendLambda", {
      description: "Serves as Simple Backend",
      code: lambda.DockerImageCode.fromEcr(repository, {
        tagOrDigest: "latest",
      }),
      functionName: "backend",
      architecture: lambda.Architecture.ARM_64,
      memorySize: this.config.backend.memory,
      timeout: this.config.backend.timeout,
    });
    const backendAlias = new lambda.Alias(this, "BackendLambdaAlias", {
      aliasName: this.config.environmentName,
      version: backend.currentVersion,
    });

    const backendCertificate = new acm.Certificate(this, "BackendCertificate", {
      domainName: this.config.domain,
      subjectAlternativeNames: [backendEndpoint.fqdn],
      validation: acm.CertificateValidation.fromDns(publicHostedZone),
    });

    const gateway = new apiGateway.LambdaRestApi(this, "RestApiGateway", {
      restApiName: "backend",
      handler: backendAlias,
      disableExecuteApiEndpoint: false, //Reference: https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-disable-default-endpoint.html
      proxy: true,
      deployOptions: {
        stageName: "api",
      },
      domainName: {
        domainName: backendEndpoint.fqdn,
        certificate: backendCertificate,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apiGateway.Cors.ALL_ORIGINS,
        allowMethods: apiGateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"],
      },
    });
    this.exportValue(gateway.restApiId, { name: "BackendApiGatewayId" });

    new route53.ARecord(this, "ApiGatewayDomainRecord", {
      zone: publicHostedZone,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(gateway)),
      recordName: backendEndpoint.subdomain,
    });
  }
}
