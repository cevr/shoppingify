import { fieldAuthorizePlugin, makeSchema } from "@nexus/schema";
import path from "path";

import * as types from "./types";

let folderPath = path.join(process.cwd(), "src", "schema");

export let schema = makeSchema({
  types,
  plugins: [fieldAuthorizePlugin()],
  outputs: {
    typegen: path.join(folderPath, "nexus-typegen.ts"),
    schema: path.join(folderPath, "schema.graphql"),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: path.join(folderPath, "context.ts"),
        alias: "Types",
      },
    ],
    contextType: "Types.Context",
  },
});
