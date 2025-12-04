import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { Config } from "../config/types";
import { AssetsStack } from "../stack/assets";
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
