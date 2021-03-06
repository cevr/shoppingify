import * as React from "react";
import { gql } from "graphql-request";
import { useQuery } from "react-query";
import { useRouter } from "next/router";

import { client } from "@lib/client";

export let userQuery = gql`
  query me {
    me {
      ...userFields
    }
  }
  fragment userFields on User {
    id
    username
    activeListId
  }
`;

export let useUser = () => {
  let router = useRouter();
  let query = useQuery("user", () => client.me());

  React.useEffect(() => {
    if (query.data && !query.data.me) {
      router.replace("/signin");
    }
  }, [query.data]);

  return query;
};
