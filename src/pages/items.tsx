import * as React from "react";
import Head from "next/head";
import { MdAdd, MdSearch } from "react-icons/md";

import { Paper } from "@components/index";
import {
  makeCategorizedItemMap,
  useActiveList,
  useAddItem,
  useItems,
} from "@shared/index";
import { useRouter } from "next/router";

let Items = () => {
  let [search, setSearch] = React.useState("");

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

        <Paper className="flex items-center px-3">
          <MdSearch className="h-6 w-6 mr-3" />
          <input
            className="p-1"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for items"
          />
        </Paper>
      </div>

      <CategorizedItems />
    </>
  );
};

export default Items;

let CategorizedItems = () => {
  let router = useRouter();
  let { data: itemsData } = useItems();
  let activeList = useActiveList();
  let [addItem] = useAddItem();

  let categorizedItems = React.useMemo(
    () => makeCategorizedItemMap(itemsData?.items),
    [itemsData]
  );

  if (categorizedItems.length === 0) {
    return <div>No items</div>;
  }

  return (
    <>
      {categorizedItems.map(([category, items]) => (
        <div className="flex flex-col mb-4" key={category}>
          <div className="mb-2 text-lg capitalize">{category}</div>
          <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
            {items.map((item) => (
              <li key={item.id}>
                <Paper
                  onClick={() => {
                    router.push({
                      query: {
                        itemId: item.id,
                      },
                    });
                  }}
                  className="flex justify-between items-start border border-transparent hover:border-brand-primary cursor-pointer"
                >
                  <div>{item.name}</div>
                  {!activeList?.items.find(
                    (listItem) => listItem.id === item.id
                  ) && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        addItem({
                          itemId: item.id,
                          listId: activeList?.id,
                        });
                      }}
                      className="p-1 text-gray-500 text-xl focus:outline-none"
                    >
                      <MdAdd />
                    </button>
                  )}
                </Paper>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};
