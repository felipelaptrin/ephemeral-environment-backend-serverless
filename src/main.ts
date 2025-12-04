import * as cdk from "aws-cdk-lib";
import { ShellStep } from "aws-cdk-lib/pipelines";
import { AwsCredentials, GitHubWorkflow, JsonPatch } from "cdk-pipelines-github";

import { devConfig } from "./config";
import { Accounts } from "./config/types";
import {
  installNodeJs,
  setEphemeralGlobalEnvironmentVariables,
  setEphemeralWorkflowTriggers,
} from "./pipelines/functions";
import { AssetsPipelineStage, EphemeralPipelineStage, WorkloadPipelineStage } from "./pipelines/stages";

const app = new cdk.App();

// ------------------
// Main Pipeline
// ------------------
const pipeline = new GitHubWorkflow(app, "Pipeline", {
  synth: new ShellStep("Build", {
    commands: ["yarn install", "yarn build", "yarn synth"],
  }),
  awsCreds: AwsCredentials.fromOpenIdConnect({
    gitHubActionRoleArn: `arn:aws:iam::${Accounts.Development}:role/GitHubActions`, // This Role already exists in my account
  }),
  workflowName: "iac-deploy",
  workflowPath: "./.github/workflows/iac-deploy.yaml",
});

const devAssetsStage = new AssetsPipelineStage(app, "DevAssetsStage", { env: devConfig.env });
const devWorkloadStage = new WorkloadPipelineStage(app, "DevWorkloadStage", devConfig, { env: devConfig.env });

pipeline.addStage(devAssetsStage);
pipeline.addStage(devWorkloadStage);

const deployWorkflow = pipeline.workflowFile;
deployWorkflow.patch(JsonPatch.replace("/jobs/Build-Build/steps/0/uses", "actions/checkout@v6"));
deployWorkflow.patch(JsonPatch.add("/on/push/paths", ["src/**"]));
deployWorkflow.patch(JsonPatch.add("/jobs/Build-Build/steps/1", installNodeJs()));

// ------------------
// Ephemeral Environment Pipeline
// ------------------
const ephemeralPipeline = new GitHubWorkflow(app, "EphemeralPipeline", {
  synth: new ShellStep("Build", {
    commands: ["yarn install", "yarn build", "yarn synth"],
  }),
  awsCreds: AwsCredentials.fromOpenIdConnect({
    gitHubActionRoleArn: `arn:aws:iam::${Accounts.Development}:role/GitHubActions`, // This Role already exists in my account
  }),
  workflowPath: "./.github/workflows/iac-ephemeral-deploy.yaml",
  workflowName: "iac-ephemeral-deploy",
});

const ephemeralStage = new EphemeralPipelineStage(app, "EphemeralStage", { env: devConfig.env });

ephemeralPipeline.addStage(ephemeralStage);

const ephemeralDeployWorkflow = ephemeralPipeline.workflowFile;
ephemeralDeployWorkflow.patch(JsonPatch.replace("/jobs/Build-Build/steps/0/uses", "actions/checkout@v6"));
ephemeralDeployWorkflow.patch(JsonPatch.add("/jobs/Build-Build/steps/1", installNodeJs()));
ephemeralDeployWorkflow.patch(JsonPatch.add("/on", setEphemeralWorkflowTriggers()));
ephemeralDeployWorkflow.patch(JsonPatch.add("/env", setEphemeralGlobalEnvironmentVariables()));

app.synth();
