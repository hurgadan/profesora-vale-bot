import * as process from "node:process";

import * as dotenv from "dotenv";

dotenv.config({ quiet: true });

export function getEnv(envName: string, strict = true): string {
  const raw = process.env[envName];
  if (raw === undefined) {
    if (strict) {
      throw new Error(`Environment ${envName} is undefined.`);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return;
  }

  return String(raw).trim();
}

export function getEnvNumber(envName: string, strict = true): number {
  return Number(getEnv(envName, strict));
}

export function getEnvBoolean(envName: string, strict = true): boolean {
  return getEnv(envName, strict) === "true";
}
