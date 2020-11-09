import { gql } from "graphql-request";
import { useQuery } from "react-query";

import { client } from "@lib/client";

export let itemsQuery = gql`
  query items {
    items {
      ...itemFields
    }
  }
  fragment itemFields on Item {
    id
    name
    category {
      id
      name
    }
  }
`;

export let useItems = () => useQuery("items", () => client.items());
