import { gql } from "graphql-request";
import { useQuery } from "react-query";

import { client } from "@lib/client";

export let listsQuery = gql`
  query lists {
    lists {
      id
      name
      items {
        id: itemId
        name
        count
        complete
        category {
          id
          name
        }
      }
    }
  }
`;

export let useLists = () => useQuery("lists", () => client.lists());
