import * as React from "react";
import Head from "next/head";
import { MdAdd, MdSearch } from "react-icons/md";
import Fuse from "fuse.js";
import debounce from "debounce-fn";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { QueryCache } from "react-query";
import { dehydrate } from "react-query/hydration";

import { EmptyFallback, Paper } from "@components/index";
import {
  Item,
  makeItemsByCategory,
  useActiveList,
  useAddItem,
  useItems,
} from "@shared/index";
import { ItemFieldsFragment } from "@generated/graphql";
import { serverClient } from "@lib/client";

type FilteredItems = [month: string, items: ItemFieldsFragment[]];

let useFilteredItems = (): [
  filteredItems: FilteredItems[],
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void
] => {
  let { data: itemsData } = useItems();
  let [search, setSearch] = React.useState("");
  let [filteredItems, setFilteredItems] = React.useState<ItemFieldsFragment[]>(
    []
  );

  React.useEffect(() => {
    filterItems(search);
  }, [itemsData?.items, search]);

  let fuse = React.useMemo(
    () =>
      new Fuse(itemsData?.items ?? [], {
        keys: ["name"],
        includeScore: false,
      }),
    [itemsData?.items]
  );

  let filterItems = (searchInput: string) => {
    let filteredItems = itemsData?.items ?? [];

    if (searchInput) {
      filteredItems = fuse.search(searchInput).map((result) => result.item);
    }

    setFilteredItems(filteredItems);
  };

  let searchItems = debounce(
    (search: string) => {
      setSearch(search);
      filterItems(search);
    },
    {
      wait: 500,
    }
  );

  let onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    let search = event.target.value;
    searchItems(search);
  };

  let items = React.useMemo(() => makeItemsByCategory(filteredItems), [
    filteredItems,
  ]);

  return [items, onSearch];
};

let Items = () => {
  let [items, onSearch] = useFilteredItems();
  return (
    <>
      <Head>
        <title>Shoppingify | Items</title>
      </Head>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full items-start mb-10">
        <h1 className="text-xl md:text-2xl">
          <span className="text-brand-primary">Shoppingify</span> allows you to
          take your shopping list wherever you go
        </h1>

        <Paper
          className="place-self-start w-full flex items-center px-3 border-2 rounded-lg focus-within:border-brand-primary"
          style={{ minWidth: 250, maxWidth: 450 }}
        >
          <MdSearch className="h-6 w-6 mr-3" style={{ minWidth: "1.5rem" }} />
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
    return <EmptyFallback>There's no items here... yet.</EmptyFallback>;
  }

  return (
    <>
      {items.map(([category, items]) => (
        <div className="flex flex-col mb-4" key={category}>
          <div className="mb-2 text-lg capitalize">{category}</div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
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

export let getServerSideProps: GetServerSideProps = async ({ req }) => {
  let queryCache = new QueryCache();
  let client = serverClient(req);

  await queryCache.prefetchQuery("user", () => client.me());
  await queryCache.prefetchQuery("items", () => client.items());

  return {
    props: {
      dehydratedState: dehydrate(queryCache),
    },
  };
};
