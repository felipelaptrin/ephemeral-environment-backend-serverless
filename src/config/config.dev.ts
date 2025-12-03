import * as cdk from "aws-cdk-lib";

import { Accounts, Config } from "./types";

export const config: Config = {
  env: {
    account: Accounts.Development,
    region: "us-east-1",
  },
  environmentName: "dev",
  domain: "demosfelipetrindade.lat",
  backend: {
    ecrRepoArn: `arn:aws:ecr:us-east-1:${Accounts.Development}:repository/backend`,
    memory: 512,
    timeout: cdk.Duration.seconds(10),
    subdomain: "api",
  },
};
