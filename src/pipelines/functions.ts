export function installNodeJs() {
  return {
    name: "Use NodeJS v22",
    uses: "actions/setup-node@v6",
    with: {
      "node-version": "22.14.0",
      cache: "yarn",
    },
  };
}

export function setEphemeralWorkflowTriggers() {
  return {
    workflow_call: {
      inputs: {
        apiGatewayId: {
          type: "string",
          require: true,
        },
        rootApiGatewayResourceId: {
          type: "string",
          require: true,
        },
        pullRequest: {
          type: "string",
          require: true,
        },
      },
    },
  };
}

export function setEphemeralGlobalEnvironmentVariables() {
  return {
    apiGatewayId: "${{ inputs.apiGatewayId }}",
    rootApiGatewayResourceId: "${{ inputs.rootApiGatewayResourceId }}",
    pullRequest: "${{ inputs.pullRequest }}",
  };
}
