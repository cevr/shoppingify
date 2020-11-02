import { gql } from "graphql-request";
import useSWR from "swr";

import { client } from "@lib/client";

export let userQuery = gql`
  query me {
    me {
      id
      username
      activeListId
    }
  }
`;

export let useUser = () => useSWR("/api/me", () => client.me());
