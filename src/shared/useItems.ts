import { gql } from "graphql-request";
import useSWR from "swr";

import { client } from "@lib/client";

export let itemsQuery = gql`
  query items {
    items {
      id
      name
    }
  }
`;

export let useItems = () => useSWR("/api/items", () => client.items());
