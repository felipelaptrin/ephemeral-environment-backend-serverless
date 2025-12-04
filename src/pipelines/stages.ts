import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { Config } from "../config/types";
import { AssetsStack } from "../stack/assets";
import { EphemeralStack } from "../stack/ephemeral";
import { WorkloadStack } from "../stack/workload";

export class AssetsPipelineStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new AssetsStack(this, "AssetsStageStack");
  }
}

export class WorkloadPipelineStage extends cdk.Stage {
  constructor(scope: Construct, id: string, configProps: Config, props?: cdk.StageProps) {
    super(scope, id, props);

    new WorkloadStack(this, "StageStack", { config: configProps });
  }
}

export class EphemeralPipelineStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const pullRequest = process.env["PULL_REQUEST"] ?? "";
    const apiGatewayId = process.env["API_GATEWAY_ID"]!;
    const rootApiGatewayResourceId = process.env["ROOT_API_GATEWAY_RESOURCE_ID"]!;

    new EphemeralStack(this, `EphemeralEnvironment`, {
      pullRequest,
      rootApiGatewayResourceId,
      apiGatewayId,
    });
  }
}
