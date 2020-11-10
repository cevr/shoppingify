import * as React from "react";
import Head from "next/head";
import { format } from "date-fns";
import { MdEventNote } from "react-icons/md";
import clsx from "clsx";

import { ListFieldsFragment, ListStatus } from "@generated/graphql";
import { useListsByMonth } from "@shared/index";
import { EmptyFallback, Paper } from "@components/index";

let History = () => {
  return (
    <>
      <Head>
        <title>Shoppingify | History</title>
      </Head>
      <h1 className="text-2xl mb-10">Shopping history</h1>
      <ShoppingListsByMonth />
    </>
  );
};

let ShoppingListsByMonth = () => {
  let lists = useListsByMonth();

  if (lists.length === 0) {
    return (
      <EmptyFallback>There's no history here... yet.</EmptyFallback>
    );
  }

  return (
    <>
      {lists?.map(([month, lists]) => (
        <div className="grid grid-cols-1 gap-4 mb-10" key={month}>
          <div className="text-md font-bold">{month}</div>
          {lists.map((list) => (
            <ShoppingListEntry key={list.id} list={list} />
          ))}
        </div>
      ))}
    </>
  );
};

interface ShoppingListEntryProps {
  list: ListFieldsFragment;
}

let ShoppingListEntry = ({ list }: ShoppingListEntryProps) => (
  <Paper className="flex flex-col lg:flex-row justify-between lg:items-center rounded-xl p-4">
    <div className="text-xl lg:text-md mb-3 md:mb-0">{list.name}</div>
    <div className="flex items-center justify-between lg:justify-start">
      <div className="flex text-gray-500 mr-6">
        <MdEventNote className="text-xl mr-2" />
        <span className="text-sm">
          {format(new Date(list.updatedAt), "iii d.MM.yyyy")}
        </span>
      </div>
      <div
        className={clsx("px-2 rounded-full lowercase border-2", {
          "border-brand-info text-brand-info":
            list.status === ListStatus.Completed,
          "border-red-500 text-red-500": list.status === ListStatus.Cancelled,
        })}
      >
        {list.status}
      </div>
    </div>
  </Paper>
);

export default History;
