import { GraphQLClient } from "graphql-request";

import { getSdk } from "@generated/graphql";

let fetcher = new GraphQLClient("/api/graphql", {
  credentials: "same-origin",
});

export let client = getSdk(fetcher);
