import { gql } from "graphql-request";
import useSWR from "swr";

import { client } from "@lib/client";

export let listsQuery = gql`
  query lists {
    lists {
      id
      name
      items {
        id: itemId
        name
      }
    }
  }
`;

export let useLists = () => useSWR("/api/lists", () => client.lists());
