import * as cdk from "aws-cdk-lib";
import "jest-cdk-snapshot";

import { devConfig } from "../src/config";
import { AssetsStack } from "../src/stack/assets";
import { WorkloadStack } from "../src/stack/workload";

// Test for Workfload stack
test("snapshot for WorkloadStack: matches previous state", () => {
  const app = new cdk.App();
  const stack = new WorkloadStack(app, "MyWorkloadStack", { env: devConfig.env, config: devConfig });

  expect(stack).toMatchCdkSnapshot({
    ignoreAssets: true,
    ignoreCurrentVersion: true,
    ignoreMetadata: true,
  });
});

// Test for Assets stack
test("snapshot for AssetsStack: matches previous state", () => {
  const app = new cdk.App();
  const stack = new AssetsStack(app, "MyAssetsStack", { env: devConfig.env });

  expect(stack).toMatchCdkSnapshot({
    ignoreAssets: true,
    ignoreCurrentVersion: true,
    ignoreMetadata: true,
  });
});
