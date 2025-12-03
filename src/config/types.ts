import * as cdk from "aws-cdk-lib";

export enum Accounts {
  Development = "937168356724",
}

export type Environment = "dev" | "prod";

export type Config = {
  env: {
    account: Accounts;
    region: string;
  };
  environmentName: Environment;
  domain: string;
  backend: {
    ecrRepoArn: string;
    memory: number;
    timeout: cdk.Duration;
    subdomain: string;
  };
};
