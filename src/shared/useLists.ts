import { gql } from "graphql-request";
import { useQuery } from "react-query";

import { client } from "@lib/client";

export let listsQuery = gql`
  query lists {
    lists {
      ...listFields
    }
  }

  fragment listFields on List {
    id
    name
    createdAt
    updatedAt
    status
    items {
      ...listItemFields
    }
  }

  fragment listItemFields on ListItem {
    id: itemId
    name
    count
    complete
    category {
      id
      name
    }
  }
`;

export let useLists = () => useQuery("lists", () => client.lists());
