import { List, ListItem } from "@generated/graphql";
import * as React from "react";
import { gql } from "graphql-request";
import {
  MdAdd,
  MdCheck,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdDelete,
  MdEdit,
  MdRemove,
} from "react-icons/md";
import clsx from "clsx";

import { ContextualLayout } from "@layouts/ContextualLayout";
import { useActiveList, makeCategorizedItemMap } from "@shared/index";
import { client } from "@lib/client";
import { useMutation } from "react-query";
import { queryCache } from "@lib/cache";
import { useForm } from "react-hook-form";

export let removeItemMutation = gql`
  mutation removeItem($listId: Int, $itemId: Int!) {
    updateList(id: $listId, delete: [$itemId]) {
      id
    }
  }
`;

export let incrementListItemCountMutation = gql`
  mutation incrementListItemCount($listId: Int!, $itemId: Int!) {
    incrementListItemCount(listId: $listId, itemId: $itemId) {
      itemId
      listId
    }
  }
`;

export let decrementListItemCountMutation = gql`
  mutation decrementListItemCount($listId: Int!, $itemId: Int!) {
    decrementListItemCount(listId: $listId, itemId: $itemId) {
      itemId
      listId
    }
  }
`;

export let setListItemCompleteMutation = gql`
  mutation setListItemComplete(
    $listId: Int!
    $itemId: Int!
    $complete: Boolean!
  ) {
    setListItemComplete(listId: $listId, itemId: $itemId, complete: $complete) {
      itemId
      listId
    }
  }
`;

export let setShoppingListNameMutation = gql`
  mutation setShoppingListName($id: Int!, $name: String!) {
    updateList(id: $id, name: $name) {
      id
    }
  }
`;

interface ShoppingListProps {
  onAddItem?: () => void;
}

export let ShoppingList = ({ onAddItem }: ShoppingListProps) => {
  let activeList = useActiveList();
  let [status, setStatus] = React.useState<"idle" | "editing">("idle");
  return (
    <ContextualLayout
      primary={
        <div className="bg-brand-secondary h-full flex flex-col">
          <div className="relative flex justify-end rounded-3xl p-6 px-10 bg-brand-accent m-6 mb-10">
            <img
              className="absolute ml-5 left-0 top-0"
              style={{
                height: 150,
                top: "-1.5rem",
              }}
              height="150px"
              src="/bottle.svg"
              alt="Bottle"
            />
            <div className="flex flex-col items-start w-1/2 mr-5">
              <p className="text-white mb-2">Didnt find what you need ?</p>
              <button
                onClick={onAddItem}
                className="rounded-md bg-white text-black px-6 py-2"
              >
                Add Item
              </button>
            </div>
          </div>

          <ShoppingListDetails
            list={activeList}
            onEdit={() => {
              setStatus("editing");
            }}
          />
        </div>
      }
      secondary={
        status === "editing" ? (
          <ShoppingListActions
            id={activeList?.id!}
            onFinish={() => {
              setStatus("idle");
            }}
          />
        ) : (
          <ShoppingListNameInput id={activeList?.id!} />
        )
      }
    />
  );
};

export let completeShoppingListMutation = gql`
  mutation completeShoppingList($id: Int!) {
    completeList(id: $id) {
      id
    }
  }
`;

export let cancelShoppingListMutation = gql`
  mutation cancelShoppingList($id: Int!) {
    cancelList(id: $id) {
      id
    }
  }
`;

interface ShoppingListActionsProps {
  id: number;
  onFinish: () => void;
}

let ShoppingListActions = ({ id, onFinish }: ShoppingListActionsProps) => {
  let [complete] = useMutation(client.completeShoppingList, {
    onSuccess: () => {
      queryCache.invalidateQueries("lists");
      onFinish();
    },
  });
  let [cancel] = useMutation(client.cancelShoppingList, {
    onSuccess: () => {
      queryCache.invalidateQueries("lists");
      onFinish();
    },
  });
  return (
    <>
      <button
        className="px-6 py-4 rounded-lg mr-2"
        onClick={() => {
          cancel({
            id,
          });
        }}
      >
        cancel
      </button>
      <button
        type="submit"
        form="item-form"
        className="px-6 py-4 rounded-lg bg-brand-info text-white"
        onClick={() => {
          complete({
            id,
          });
        }}
      >
        Complete
      </button>
    </>
  );
};

interface ShoppingListNameInputProps {
  id?: number;
}

let ShoppingListNameInput = ({ id }: ShoppingListNameInputProps) => {
  let { register, handleSubmit, reset } = useForm<{ name: string }>();
  let [editName] = useMutation(client.setShoppingListName, {
    onSuccess: () => {
      queryCache.invalidateQueries("lists");
      reset({
        name: "",
      });
    },
  });

  let onSubmit = handleSubmit(({ name }) => {
    editName({
      id: id!,
      name,
    });
  });

  let noActiveList = !id;

  return (
    <div className="flex">
      <input
        disabled={noActiveList}
        ref={register({ required: true })}
        name="name"
        className={clsx("focus:outline-none p-4 w-full border-2 rounded-xl", {
          "border-brand-primary": !noActiveList,
          "border-gray-500 cursor-not-allowed": noActiveList,
        })}
        placeholder="Enter a name"
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />
      <button
        disabled={noActiveList}
        onClick={onSubmit}
        className={clsx("p-4 rounded-xl text-white", {
          "bg-brand-primary": !noActiveList,
          "bg-gray-500 cursor-not-allowed": noActiveList,
        })}
        style={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        Save
      </button>
    </div>
  );
};

let EmptyShoppingList = () => {
  return (
    <div className="relative flex items-center justify-center h-full">
      <p className="text-xl font-bold">No items</p>
      <img className="absolute" src="/person-shopping.svg" style={{
        bottom: -12
      }} />
    </div>
  );
};

interface ShoppingListDetailsProps {
  list: ReturnType<typeof useActiveList>;
  onEdit: () => void;
}

let ShoppingListDetails = ({ list, onEdit }: ShoppingListDetailsProps) => {
  let [isEditing, setIsEditing] = React.useState(false);
  let categorizedItems = React.useMemo(
    () => makeCategorizedItemMap(list?.items),
    [list]
  );
  let [increment] = useMutation(client.incrementListItemCount, {
    onSuccess: () => {
      queryCache.invalidateQueries("lists");
      queryCache.invalidateQueries("items");
    },
  });
  let [decrement] = useMutation(client.decrementListItemCount, {
    onSuccess: () => {
      queryCache.invalidateQueries("lists");
      queryCache.invalidateQueries("items");
    },
  });
  let [remove] = useMutation(client.removeItem, {
    onSuccess: () => {
      queryCache.invalidateQueries("lists");
      queryCache.invalidateQueries("items");
    },
  });
  let [setComplete] = useMutation(client.setListItemComplete, {
    onSuccess: () => {
      queryCache.invalidateQueries("lists");
      queryCache.invalidateQueries("items");
    },
  });

  if (!list || list?.items.length === 0) {
    return <EmptyShoppingList />;
  }

  return (
    <div className="flex flex-col overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-xl font-bold">{list?.name}</h2>
        <button
          className="focus:outline-none text-xl"
          onClick={() => {
            setIsEditing(true);
            onEdit();
          }}
        >
          <MdEdit />
        </button>
      </div>
      {categorizedItems.map(([category, items]) => (
        <div className="flex flex-col mb-6" key={category}>
          <h3 className="text-md text-gray-600 mb-5">{category}</h3>
          {items.map((item) => (
            <ShoppingListItem
              key={item.id}
              isEditing={isEditing}
              item={item}
              listId={list?.id!}
              onIncrement={(id) => {
                increment({
                  itemId: id,
                  listId: list?.id!,
                });
              }}
              onDecrement={(id) => {
                decrement({
                  itemId: id,
                  listId: list?.id!,
                });
              }}
              onRemove={(id) => {
                remove({
                  itemId: id,
                  listId: list?.id!,
                });
              }}
              onToggle={(id, complete) => {
                setComplete({
                  itemId: id,
                  listId: list?.id!,
                  complete,
                });
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface ShoppingListItemProps {
  item: ListItem;
  listId: number;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
  onToggle: (id: number, complete: boolean) => void;
  isEditing: boolean;
}

let ShoppingListItem = ({
  item,
  onDecrement,
  onIncrement,
  onRemove,
  onToggle,
  isEditing,
}: ShoppingListItemProps) => {
  let [isModifying, setIsModifying] = React.useState(false);
  let decrementIsDisabled = item.count < 1;
  return (
    <div className="flex justify-between items-center mb-5">
      <div
        className={clsx("flex items-center", {
          "w-1/4": isModifying,
        })}
      >
        {isEditing ? (
          <Checkbox
            checked={item.complete}
            onClick={() => onToggle(item.id, !item.complete)}
          />
        ) : null}
        <div
          className={clsx("text-lg truncate", {
            "line-through": item.complete,
          })}
        >
          {item.name}
        </div>
      </div>
      {isModifying ? (
        <div className="rounded-lg overflow-hidden flex bg-white">
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 rounded-lg text-xl bg-brand-primary text-white"
          >
            <MdDelete />
          </button>
          <div className="flex p-1">
            <button
              disabled={decrementIsDisabled}
              onClick={() => onDecrement(item.id)}
              className={clsx("p-2 text-xl", {
                "text-brand-primary": !decrementIsDisabled,
                "text-gray-500": decrementIsDisabled,
              })}
            >
              <MdRemove />
            </button>
            <ItemCount
              onClick={() => {
                setIsModifying((editing) => !editing);
              }}
              count={item.count}
            />
            <button
              onClick={() => onIncrement(item.id)}
              className="p-2 text-xl text-brand-primary"
            >
              <MdAdd />
            </button>
          </div>
        </div>
      ) : (
        <ItemCount
          count={item.count}
          onClick={() => {
            setIsModifying((editing) => !editing);
          }}
        />
      )}
    </div>
  );
};

interface ItemCountProps {
  count: number;
  onClick: () => void;
}

let ItemCount = ({ count, ...props }: ItemCountProps) => {
  return (
    <button
      className="focus:outline-none border-2 text-sm border-brand-primary text-brand-primary px-4 py-1 rounded-full"
      {...props}
    >
      {count} pcs
    </button>
  );
};

interface CheckboxProps {
  checked?: boolean;
  onClick?: () => void;
}

let Checkbox = ({ checked, onClick }: CheckboxProps) => {
  return (
    <button
      onClick={onClick}
      className="focus:outline-none text-2xl text-brand-primary mr-2"
    >
      {checked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
    </button>
  );
};
