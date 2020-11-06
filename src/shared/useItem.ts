import { gql } from "graphql-request";
import { useQuery } from "react-query";

import { client } from "@lib/client";

export let itemQuery = gql`
  query item($id: Int!) {
    item(id: $id) {
      id
      name
      image
      note
      category {
        name
      }
    }
  }
`;

export let useItem = (id: string) =>
  useQuery(`item-${id}`, () =>
    client.item({
      id: Number(id),
    })
  );
