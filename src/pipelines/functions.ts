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
          required: true,
        },
        rootApiGatewayResourceId: {
          type: "string",
          required: true,
        },
        pullRequest: {
          type: "string",
          required: true,
        },
      },
    },
  };
}

export function setEphemeralGlobalEnvironmentVariables() {
  return {
    API_GATEWAY_ID: "${{ inputs.apiGatewayId }}",
    ROOT_API_GATEWAY_RESOURCE_ID: "${{ inputs.rootApiGatewayResourceId }}",
    PULL_REQUEST: "${{ inputs.pullRequest }}",
  };
}
