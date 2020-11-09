import { useMutation } from "react-query";
import { gql } from "graphql-request";

import { client } from "@lib/client";
import { queryCache } from "@lib/cache";

export let addItemMutation = gql`
  mutation addItem($listId: Int, $itemId: Int!) {
    addItem(listId: $listId, itemId: $itemId) {
      id
    }
  }
`;

export let useAddItem = () =>
  useMutation(client.addItem, {
    onSuccess: () => {
      queryCache.invalidateQueries("items");
      queryCache.invalidateQueries("lists");
      queryCache.invalidateQueries("user");
    },
  });
