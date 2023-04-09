// based from: https://github.com/upstash/sdk-qstash-ts
// under MIT license

import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { verify } from "jsonwebtoken";
import { subtle } from "crypto";

export type VerifySignaturConfig = {
  currentSigningKey: string;
  nextSigningKey: string;

  /**
   * The url of this api route, including the protocol.
   *
   * If you omit this, the url will be automatically determined by checking the `VERCEL_URL` env variable and assuming `https`
   */
  url?: string;

  /**
   * Number of seconds to tolerate when checking `nbf` and `exp` claims, to deal with small clock differences among different servers
   *
   * @default 0
   */
  clockTolerance?: number;
  noVerify?: boolean;
};

const getBody = async (req: NextApiRequest) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const body = Buffer.concat(chunks).toString("utf-8");
  return body;
};

const verifyWithKey = async ({
  token,
  signingKey,
  body,
  clockTolerance = 0,
}: {
  token: string;
  signingKey: string;
  body: string;
  clockTolerance?: VerifySignaturConfig["clockTolerance"];
}) => {
  const decoded = verify(token, signingKey, {
    issuer: "Upstash",
    clockTolerance,
  });
  if (typeof decoded === "string") {
    throw new Error(`typeof decoded  === "string"`);
  }

  const bodyHash = await subtle.digest(
    "SHA-256",
    typeof body === "string" ? new TextEncoder().encode(body) : body
  );

  // @ts-expect-error
  const bodyHashBase64Url = Buffer.from(bodyHash, "utf-8").toString(
    "base64url"
  );

  const padding = new RegExp(/=+$/);
  if (
    decoded.body.replace(padding, "") !== bodyHashBase64Url.replace(padding, "")
  ) {
    throw new Error(
      `body hash does not match, want: ${decoded.body}, got: ${bodyHashBase64Url}`
    );
  }

  return true;
};

export function verifySignature(
  handler: NextApiHandler,
  config: VerifySignaturConfig
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const body = await getBody(req);

    try {
      if (req.headers["content-type"] === "application/json") {
        req.body = JSON.parse(body);
      } else {
        req.body = body;
      }
    } catch {
      req.body = body;
    }

    if (config.noVerify) {
      return handler(req, res);
    }

    const signature = req.headers["upstash-signature"];
    if (!signature) {
      throw new Error("`Upstash-Signature` header is missing");
    }
    if (typeof signature !== "string") {
      throw new Error("`Upstash-Signature` header is not a string");
    }

    if (
      await verifyWithKey({
        signingKey: config.currentSigningKey,
        token: signature,
        body,
        // url: config.url,
        clockTolerance: config.clockTolerance,
      })
    ) {
      return handler(req, res);
    }
    if (
      await verifyWithKey({
        signingKey: config.nextSigningKey,
        token: signature,
        body,
        // url: config.url,
        clockTolerance: config.clockTolerance,
      })
    ) {
      return handler(req, res);
    }

    throw new Error("Unknown Error");
  };
}

export const verifySignatureWithSigningKey = (
  handler: NextApiHandler,
  config: Omit<
    VerifySignaturConfig,
    "currentSigningKey" | "nextSigningKey"
  > = {}
): NextApiHandler => {
  const currentSigningKey = process.env["QSTASH_CURRENT_SIGNING_KEY"];
  if (!currentSigningKey) {
    throw new Error(
      "currentSigningKey is required, either in the config or as env variable QSTASH_CURRENT_SIGNING_KEY"
    );
  }
  const nextSigningKey = process.env["QSTASH_NEXT_SIGNING_KEY"];
  if (!nextSigningKey) {
    throw new Error(
      "nextSigningKey is required, either in the config or as env variable QSTASH_NEXT_SIGNING_KEY"
    );
  }

  return verifySignature(handler, {
    clockTolerance: parseInt(process.env.QSTASH_CLOCK_TOLERANCE ?? "0", 10),
    currentSigningKey,
    nextSigningKey,
    ...config,
  });
};
