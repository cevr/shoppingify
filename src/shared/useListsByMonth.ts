import * as React from "react";
import { format } from "date-fns";

import { ListFieldsFragment, ListStatus } from "@generated/graphql";
import { useLists } from "./useLists";

export type ListsByMonthTuple = [month: string, lists: ListFieldsFragment[]];

let makeListsByMonth = (
  lists: ListFieldsFragment[] = [],
  formatString = "MMMM yyyy"
) =>
  Object.entries(
    lists
      ?.filter((list) => list.status !== ListStatus.Active)
      .reduce((lists, list) => {
        let date = format(new Date(list.updatedAt), formatString);
        if (lists[date]) {
          lists[date].push(list);
        } else {
          lists[date] = [list];
        }
        return lists;
      }, {} as Record<string, ListFieldsFragment[]>) ?? {}
  );

export let useListsByMonth = (formatString?: string): ListsByMonthTuple[] => {
  let { data: listsData } = useLists();
  return React.useMemo(() => makeListsByMonth(listsData?.lists, formatString), [
    listsData?.lists,
  ]);
};
