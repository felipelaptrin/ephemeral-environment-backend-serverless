import * as cdk from "aws-cdk-lib";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface WorkloadStackProps extends cdk.StackProps {
  apiGatewayId: string;
  rootApiGatewayResourceId: string;
  pullRequest: string;
}

export class EphemeralStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WorkloadStackProps) {
    super(scope, id, props);

    const gateway = apiGateway.RestApi.fromRestApiAttributes(this, "ApiGateway", {
      restApiId: props.apiGatewayId,
      rootResourceId: props.rootApiGatewayResourceId,
    });

    const lambdaFunction = lambda.Function.fromFunctionName(this, "BackendLambdaFunction", "backend");
    const lambdaFunctionVersion = lambda.Version.fromVersionAttributes(this, "BackendLambdaFunctionVersion", {
      lambda: lambdaFunction,
      version: props.pullRequest,
    });

    const lambdaIntegration = new apiGateway.LambdaIntegration(lambdaFunctionVersion);

    const pullRequestResource = gateway.root.addResource(props.pullRequest);
    pullRequestResource.addMethod("ANY", lambdaIntegration);
    pullRequestResource.addProxy({
      anyMethod: true,
      defaultIntegration: lambdaIntegration,
    });

    const deployment = new apiGateway.Deployment(this, "ApiGatewayDeployment", {
      api: gateway,
      stageName: "api",
    });
    deployment.node.addDependency(pullRequestResource);
  }
}
