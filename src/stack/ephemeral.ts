import * as cdk from "aws-cdk-lib";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface WorkloadStackProps extends cdk.StackProps {
  apiGatewayId: string;
  rootApiGatewayResourceId: string;
  pullRequest: string;
}

export class EphemeralStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WorkloadStackProps) {
    super(scope, id, props);

    apiGateway.RestApi.fromRestApiAttributes(this, "ApiGateway", {
      restApiId: props.apiGatewayId,
      rootResourceId: props.rootApiGatewayResourceId,
    });
    new Bucket(this, "Bucket", {
      bucketName: `my-bucket-${props.apiGatewayId}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
