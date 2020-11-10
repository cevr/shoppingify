import { GraphQLClient } from "graphql-request";
import type { IncomingMessage } from "http";

import { getSdk } from "@generated/graphql";

export let client = getSdk(
  new GraphQLClient("/api/graphql", {
    credentials: "same-origin",
  })
);

let absoluteUrl = (req: IncomingMessage) => {
  let host = req.headers.host as string;
  let protocol = /^localhost(:\d+)?$/.test(host) ? "http:" : "https:";

  if (
    req &&
    req.headers["x-forwarded-host"] &&
    typeof req.headers["x-forwarded-host"] === "string"
  ) {
    host = req.headers["x-forwarded-host"];
  }

  if (
    req &&
    req.headers["x-forwarded-proto"] &&
    typeof req.headers["x-forwarded-proto"] === "string"
  ) {
    protocol = `${req.headers["x-forwarded-proto"]}:`;
  }

  return protocol + "//" + host;
};

export let serverClient = (req: IncomingMessage) =>
  getSdk(new GraphQLClient(`${absoluteUrl(req)}/api/graphql`, req as any));
