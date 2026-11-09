import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getJwtSecret } from "./auth.utils.js";

describe("JWT secret configuration", () => {
  it("rejects the example placeholder in production", () => {
    const previousSecret = process.env.JWT_SECRET;
    const previousEnvironment = process.env.NODE_ENV;
    process.env.JWT_SECRET = "replace-with-a-random-secret-at-least-32-characters-long";
    process.env.NODE_ENV = "production";

    try {
      assert.throws(() => getJwtSecret(), /non-placeholder random value/);
    } finally {
      if (previousSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = previousSecret;
      if (previousEnvironment === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousEnvironment;
    }
  });
});