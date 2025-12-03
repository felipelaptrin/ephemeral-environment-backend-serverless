import { Environment } from "../config/types";

/**
 * Builds the full URL for an app based on its name, domain, and environment.
 *
 * Rules:
 * - If environment === "prod", do NOT include "prod" in the URL.
 * - Otherwise include the environment as a subdomain layer.
 *
 * Examples:
 *   buildAppUrl("frontend", "example.com", "dev")  -> {"fqdn": "frontend.dev.example.com", "subdomain": "frontend.dev"}
 *   buildAppUrl("backend", "example.com", "prod") -> {"fqdn": "frontend.example.com", "subdomain": "frontend"}
 */
export function buildAppUrl(
  appName: string,
  domain: string,
  environment: Environment,
): {
  fqdn: string;
  subdomain: string;
} {
  if (environment.toLowerCase() === "prod") {
    return {
      fqdn: `${appName}.${domain}`,
      subdomain: `${appName}`,
    };
  }
  return {
    fqdn: `${appName}.${environment}.${domain}`,
    subdomain: `${appName}.${environment}`,
  };
}
