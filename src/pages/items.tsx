import * as React from "react";
import Head from "next/head";
import { MdAdd, MdSearch } from "react-icons/md";
import Fuse from "fuse.js";
import debounce from "debounce-fn";

import { Paper } from "@components/index";
import {
  Item,
  makeItemsByCategory,
  useActiveList,
  useAddItem,
  useItems,
} from "@shared/index";
import { useRouter } from "next/router";
import { ItemFieldsFragment } from "@generated/graphql";

type FilteredItems = [month: string, items: ItemFieldsFragment[]];

let useFilteredItems = (): [
  filteredItems: FilteredItems[],
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
] => {
  let { data: itemsData } = useItems();
  let [filteredItems, setFilteredItems] = React.useState<ItemFieldsFragment[]>(
    itemsData?.items ?? []
  );
  let fuse = React.useMemo(
    () =>
      new Fuse(itemsData?.items ?? [], {
        keys: ["name"],
        includeScore: false,
      }),
    [itemsData?.items]
  );

  let searchItems = debounce(
    (search: string) => {
      let filteredItems = itemsData?.items ?? [];

      if (search) {
        filteredItems = fuse.search(search).map((result) => result.item);
      }

      setFilteredItems(filteredItems);
    },
    {
      wait: 500,
    }
  );

  let items = React.useMemo(() => makeItemsByCategory(filteredItems), [
    filteredItems,
  ]);

  let onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    let search = event.target.value;
    searchItems(search);
  };

  return [items, onSearch];
};

let Items = () => {
  let [items, onSearch] = useFilteredItems();
  return (
    <>
      <Head>
        <title>Shoppingify | Items</title>
      </Head>
      <div className="flex justify-between w-full items-start mb-10">
        <h1 className="text-2xl w-1/2">
          <span className="text-brand-primary">Shoppingify</span> allows you to
          take your shopping list wherever you go
        </h1>

        <Paper className="flex items-center px-3 border-2 rounded-lg md:w-1/4 focus-within:border-brand-primary">
          <MdSearch className="h-6 w-6 mr-3" />
          <input
            className="p-1 focus:outline-none"
            onChange={onSearch}
            placeholder="Search for items"
          />
        </Paper>
      </div>

      <CategorizedItems items={items} />
    </>
  );
};

export default Items;

interface CategorizedItemsProps {
  items: [category: string, items: Item[]][];
}

let CategorizedItems = ({ items }: CategorizedItemsProps) => {
  let router = useRouter();
  let activeList = useActiveList();
  let [addItem] = useAddItem();

  if (items.length === 0) {
    return <div>No items</div>;
  }

  return (
    <>
      {items.map(([category, items]) => (
        <div className="flex flex-col mb-4" key={category}>
          <div className="mb-2 text-lg capitalize">{category}</div>
          <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
            {items.map((item) => (
              <ItemEntry
                key={item.id}
                item={item}
                inShoppingList={Boolean(
                  activeList?.items.find((listItem) => listItem.id === item.id)
                )}
                onItemClick={() => {
                  router.push({
                    query: {
                      itemId: item.id,
                    },
                  });
                }}
                onAddItem={() => {
                  addItem({
                    itemId: item.id,
                    listId: activeList?.id,
                  });
                }}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};

interface ItemProps {
  onItemClick: () => void;
  onAddItem: () => void;
  item: Item;
  inShoppingList: boolean;
}

let ItemEntry = ({
  item,
  inShoppingList,
  onAddItem,
  onItemClick,
}: ItemProps) => (
  <li>
    <Paper
      onClick={onItemClick}
      className="flex justify-between items-start border border-transparent hover:border-brand-primary cursor-pointer"
    >
      <div>{item.name}</div>
      {!inShoppingList && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onAddItem();
          }}
          className="p-1 text-gray-500 text-xl focus:outline-none"
        >
          <MdAdd />
        </button>
      )}
    </Paper>
  </li>
);
