import * as cdk from "aws-cdk-lib";
import { ShellStep } from "aws-cdk-lib/pipelines";
import { AwsCredentials, GitHubWorkflow, JsonPatch } from "cdk-pipelines-github";

import { devConfig } from "./config";
import { Accounts } from "./config/types";
import { AssetsPipelineStage, WorkloadPipelineStage } from "./pipelines/pipelines";

// import { EphemeralStack } from "./stack/ephemeral";

const app = new cdk.App();

const pipeline = new GitHubWorkflow(app, "Pipeline", {
  synth: new ShellStep("Build", {
    commands: ["yarn install", "yarn build", "yarn synth"],
  }),
  awsCreds: AwsCredentials.fromOpenIdConnect({
    gitHubActionRoleArn: `arn:aws:iam::${Accounts.Development}:role/GitHubActions`, // This Role already exists in my account
  }),
});

const devAssetsStage = new AssetsPipelineStage(app, "DevAssetsStage", { env: devConfig.env });
const devWorkloadStage = new WorkloadPipelineStage(app, "DevWorkloadStage", devConfig, { env: devConfig.env });

pipeline.addStage(devAssetsStage);
pipeline.addStage(devWorkloadStage);

const deployWorkflow = pipeline.workflowFile;

// Use latest checkout action
deployWorkflow.patch(JsonPatch.replace("/jobs/Build-Build/steps/0/uses", "actions/checkout@v6"));
// Trigger only when src folder is modified
deployWorkflow.patch(JsonPatch.add("/on/push/paths", ["src/**"]));
deployWorkflow.patch(
  JsonPatch.add("/jobs/Build-Build/steps/1", {
    name: "Use NodeJS v22",
    uses: "actions/setup-node@v6",
    with: {
      "node-version": "22.14.0",
      cache: "yarn",
    },
  }),
);

// // Ephemeral Environment
// const pullRequest = process.env["PULL_REQUEST"] ?? "";
// const apiGatewayId = process.env["API_GATEWAY_ID"]!;
// const rootApiGatewayResourceId = process.env["ROOT_API_GATEWAY_RESOURCE_ID"]!;

// new EphemeralStack(app, `EphemeralEnvironment${pullRequest}`, {
//   pullRequest,
//   rootApiGatewayResourceId,
//   apiGatewayId,
// });

app.synth();
