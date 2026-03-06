import { getOidcClient } from "@/app/lib/auth/oidcClient";

type KeycloakRoleRepresentation = {
  id: string;
  name: string;
};

const KEYCLOAK_ADMIN_ROLE_BASE_PATH = "admin/realms" as const;

function ensureTrailingSlashInPath(url: URL): URL {
  const normalizedUrl = new URL(url.toString());

  if (!normalizedUrl.pathname.endsWith("/")) {
    normalizedUrl.pathname = `${normalizedUrl.pathname}/`;
  }

  return normalizedUrl;
}

function resolveRealmFromIssuer(issuerUrl: string): string | null {
  const configuredRealm = process.env.KEYCLOAK_REALM;

  if (configuredRealm) {
    return configuredRealm;
  }

  const parsedIssuerUrl = new URL(issuerUrl);
  const pathSegments = parsedIssuerUrl.pathname.split("/").filter((segment) => segment.length > 0);

  if (pathSegments.length < 2 || pathSegments[0] !== "realms") {
    return null;
  }

  return pathSegments[1] ?? null;
}

function resolveTokenEndpointFromIssuer(issuerUrl: string): string {
  const parsedIssuerUrl = ensureTrailingSlashInPath(new URL(issuerUrl));
  return new URL("protocol/openid-connect/token", parsedIssuerUrl).toString();
}

async function getKeycloakAdminAccessToken(): Promise<string> {
  const adminClientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID;
  const adminClientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET;
  const issuerUrl = process.env.KEYCLOAK_ISSUER;

  if (!adminClientId || !adminClientSecret || !issuerUrl) {
    throw new Error("Missing required env vars for Keycloak admin configuration.");
  }

  const response = await fetch(resolveTokenEndpointFromIssuer(issuerUrl), {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: adminClientId,
      client_secret: adminClientSecret,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to obtain Keycloak admin access token.");
  }

  const payload = (await response.json()) as { access_token?: unknown };

  if (typeof payload.access_token !== "string" || payload.access_token.length === 0) {
    throw new Error("Keycloak admin token response is missing access_token.");
  }

  return payload.access_token;
}

async function getAdminBaseUrlAndRealm(): Promise<{ adminBaseUrl: string; realm: string; accessToken: string }> {
  const { issuer } = await getOidcClient();

  if (!issuer.issuer) {
    throw new Error("OIDC discovery missing issuer.");
  }

  const realm = resolveRealmFromIssuer(issuer.issuer);

  if (!realm) {
    throw new Error("Unable to resolve Keycloak realm from issuer URL.");
  }

  const parsedIssuerUrl = new URL(issuer.issuer);
  const adminBaseUrl = `${parsedIssuerUrl.origin}/${KEYCLOAK_ADMIN_ROLE_BASE_PATH}/${encodeURIComponent(realm)}`;
  const accessToken = await getKeycloakAdminAccessToken();

  return {
    adminBaseUrl,
    realm,
    accessToken,
  };
}

async function getRealmRoleByName(roleName: string): Promise<KeycloakRoleRepresentation | null> {
  const { adminBaseUrl, accessToken } = await getAdminBaseUrlAndRealm();
  const roleResponse = await fetch(`${adminBaseUrl}/roles/${encodeURIComponent(roleName)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!roleResponse.ok) {
    return null;
  }

  const rolePayload = (await roleResponse.json()) as { id?: unknown; name?: unknown };

  if (typeof rolePayload.id !== "string" || typeof rolePayload.name !== "string") {
    return null;
  }

  return {
    id: rolePayload.id,
    name: rolePayload.name,
  };
}

export async function assignRealmRoleToUser(userId: string, roleName: string): Promise<boolean> {
  const role = await getRealmRoleByName(roleName);

  if (!role) {
    return false;
  }

  const { adminBaseUrl, accessToken } = await getAdminBaseUrlAndRealm();
  const assignResponse = await fetch(`${adminBaseUrl}/users/${encodeURIComponent(userId)}/role-mappings/realm`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify([role]),
    cache: "no-store",
  });

  return assignResponse.ok;
}

export async function deleteKeycloakUser(userId: string): Promise<boolean> {
  const { adminBaseUrl, accessToken } = await getAdminBaseUrlAndRealm();
  const deleteResponse = await fetch(`${adminBaseUrl}/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  return deleteResponse.ok;
}
