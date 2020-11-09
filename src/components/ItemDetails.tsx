import clsx from "clsx";
import { gql } from "graphql-request";
import { useMutation } from "react-query";

import { ContextualLayout } from "@layouts/ContextualLayout";
import { useActiveList, useAddItem, useItem } from "@shared/index";
import { client } from "@lib/client";
import { queryCache } from "@lib/cache";

export let deleteItemMutation = gql`
  mutation deleteItem($id: Int!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

interface ItemDetailsProps {
  onComplete?: () => void;
  itemId: string;
}

export let ItemDetails = ({ itemId, onComplete }: ItemDetailsProps) => {
  let activeList = useActiveList();
  let [addItem] = useAddItem();
  let [deleteItem] = useMutation(client.deleteItem, {
    onSuccess: () => {
      queryCache.invalidateQueries("items");
      queryCache.invalidateQueries("lists");
    },
  });
  let { data: itemData } = useItem(itemId);

  let item = itemData?.item;

  if (!item) {
    return null;
  }

  let itemInActiveList = Boolean(
    activeList?.items.find((listItem) => listItem.id === item?.id)
  );

  return (
    <ContextualLayout
      primary={
        <div className="p-8">
          <button
            onClick={onComplete}
            className="mb-6 text-brand-primary hover:text-orange-300"
          >
            ← back
          </button>
          {item.image && (
            <img
              className="rounded-lg w-auto mx-auto h-64 mb-10"
              src={item.image}
            />
          )}
          <ItemProperty isName label="name" value={item.name} />
          <ItemProperty
            label="category"
            value={item.category?.name ?? "Uncategorized"}
          />
          {item.note && <ItemProperty label="note" value={item.note} />}
        </div>
      }
      secondary={
        <>
          <button
            onClick={() => {
              deleteItem({
                id: item?.id!,
              });
              onComplete?.();
            }}
            className="px-6 py-4 rounded-lg mr-2"
          >
            delete
          </button>
          <button
            disabled={itemInActiveList}
            type="submit"
            form="item-form"
            className={clsx("px-6 py-4 rounded-lg ", {
              "bg-brand-primary text-white": !itemInActiveList,
              "bg-gray-300": itemInActiveList,
            })}
            onClick={() => {
              addItem({ itemId: item?.id! });
              onComplete?.();
            }}
          >
            Add to list
          </button>
        </>
      }
    />
  );
};

interface ItemPropertyProps {
  label: string;
  value: string;
  isName?: boolean;
}

let ItemProperty = ({ label, value, isName }: ItemPropertyProps) => (
  <div className="mb-8">
    <div className="text-sm text-gray-500 mb-2">{label}</div>
    <div
      className={clsx("text-gray-900", {
        "text-lg": !isName,
        "text-2xl": isName,
      })}
    >
      {value}
    </div>
  </div>
);
