import { makeSchema } from "@nexus/schema";
import { fieldAuthorizePlugin } from "@nexus/schema/dist/core";
import path from "path";

import * as types from "./types";

let srcPath = path.join(process.cwd(), "src");

export let schema = makeSchema({
  types,
  plugins: [fieldAuthorizePlugin()],
  outputs: {
    typegen: path.join(srcPath, "generated", "nexus-typegen.ts"),
    schema: path.join(srcPath, "schema", "schema.graphql"),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: path.join(srcPath, "schema", "context.ts"),
        alias: "Types",
      },
    ],
    contextType: "Types.Context",
  },
});
