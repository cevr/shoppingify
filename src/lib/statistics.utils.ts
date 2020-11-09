import * as React from "react";

import { ListFieldsFragment } from "@generated/graphql";
import { ListsByMonthTuple, useLists, useListsByMonth } from "@shared/index";

export type TopStatisticTuple = [label: string, count: number];
export type MonthlyTopStatisticTuple = [
  month: string,
  topStatistics: TopStatisticTuple[]
];

export let makePieChartData = ([item, value]: [string, number]) => ({
  id: item,
  label: item,
  value,
});

let reduceTopItems = (
  topItems: Record<string, number>,
  list: ListFieldsFragment
) => {
  list.items.forEach((item) => {
    let key = item.name;
    topItems[key] = topItems[key] ? ++topItems[key] : 1;
  });
  return topItems;
};

let reduceTopCategories = (
  topCategories: Record<string, number>,
  list: ListFieldsFragment
) => {
  list.items.forEach((item) => {
    if (item.category) {
      let key = item.category.name;
      topCategories[key] = topCategories[key] ? ++topCategories[key] : 1;
    }
  });
  return topCategories;
};

let deriveTopItems = (lists?: ListFieldsFragment[]): TopStatisticTuple[] => {
  let topCategories =
    lists?.reduce(reduceTopItems, {} as Record<string, number>) ?? {};

  let entries = Object.entries(topCategories).sort(
    ([, countA], [, countB]) => countB - countA
  );

  return entries;
};

let deriveTopCategories = (
  lists?: ListFieldsFragment[]
): TopStatisticTuple[] => {
  let topCategories =
    lists?.reduce(reduceTopCategories, {} as Record<string, number>) ?? {};

  let entries = Object.entries(topCategories).sort(
    ([, countA], [, countB]) => countB - countA
  );

  return entries;
};

let deriveTopItemsByMonth = (
  listsByMonth: ListsByMonthTuple[]
): MonthlyTopStatisticTuple[] =>
  listsByMonth?.map(([month, lists]) => [month, deriveTopItems(lists)]);

let deriveTopCategoriesByMonth = (
  listsByMonth: ListsByMonthTuple[]
): MonthlyTopStatisticTuple[] =>
  listsByMonth.map(([month, lists]) => [month, deriveTopCategories(lists)]);

export let useTopItems = () => {
  let { data: listsData } = useLists();
  return React.useMemo(() => deriveTopItems(listsData?.lists), [
    listsData?.lists,
  ]);
};

export let useTopCategories = () => {
  let { data: listsData } = useLists();
  return React.useMemo(() => deriveTopCategories(listsData?.lists), [
    listsData?.lists,
  ]);
};

export let useTopItemsByMonth = () => {
  let listsByMonth = useListsByMonth();
  return React.useMemo(() => deriveTopItemsByMonth(listsByMonth), [
    listsByMonth,
  ]);
};

export let useTopCategoriesByMonth = () => {
  let listsByMonth = useListsByMonth();
  return React.useMemo(() => deriveTopCategoriesByMonth(listsByMonth), [
    listsByMonth,
  ]);
};
