import { GraphQLClient } from "graphql-request";

import { getSdk } from "@generated/graphql";

export let client = getSdk(
  new GraphQLClient("/api/graphql", {
    credentials: "same-origin",
  })
);
