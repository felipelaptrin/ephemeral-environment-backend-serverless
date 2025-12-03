import * as cdk from "aws-cdk-lib";
import { ShellStep } from "aws-cdk-lib/pipelines";
import { AwsCredentials, GitHubWorkflow, JsonPatch } from "cdk-pipelines-github";
import { Construct } from "constructs";

import { devConfig } from "./config";
import { Accounts, Config } from "./config/types";
import { AssetsStack } from "./stack/assets";
import { WorkloadStack } from "./stack/workload";

const app = new cdk.App();

const pipeline = new GitHubWorkflow(app, "Pipeline", {
  synth: new ShellStep("Build", {
    commands: ["yarn install", "yarn build"],
  }),
  awsCreds: AwsCredentials.fromOpenIdConnect({
    gitHubActionRoleArn: `arn:aws:iam::${Accounts.Development}:role/GitHubActions`, // This Role already exists in my account
  }),
});

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

const devAssetsStage = new AssetsPipelineStage(app, "DevAssetsStage", { env: devConfig.env });
const devWorkloadStage = new WorkloadPipelineStage(app, "DevWorkloadStage", devConfig, { env: devConfig.env });

pipeline.addStage(devAssetsStage);
pipeline.addStage(devWorkloadStage);

const deployWorkflow = pipeline.workflowFile;

deployWorkflow.patch(JsonPatch.replace("/jobs/Build-Build/steps/0/uses", "actions/checkout@v6"));
deployWorkflow.patch(
  JsonPatch.add("/jobs/Build-Build/steps/1", {
    uses: "actions/setup-node@v6",
    with: {
      "node-version": "22.14.0",
      cache: "yarn",
    },
  }),
);

app.synth();
