import { ItemFieldsFragment, ListItemFieldsFragment } from "@generated/graphql";

export type Item = ItemFieldsFragment | ListItemFieldsFragment;

export let makeItemsByCategory = (items?: Item[]) =>
  Object.entries(
    items?.reduce((items, item) => {
      if (item.category) {
        if (items[item.category.name]) {
          items[item.category.name].push(item);
        } else {
          items[item.category.name] = [item];
        }
      } else {
        if (items.Uncategorized) {
          items.Uncategorized.push(item);
        } else {
          items.Uncategorized = [item];
        }
      }
      return items;
    }, {} as Record<string, Item[]>) ?? {}
  );
