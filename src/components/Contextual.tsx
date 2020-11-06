import * as React from "react";
import { useRouter } from "next/router";

import { ItemForm } from "./ItemForm";
import { ShoppingList } from "./ShoppingList";
import { ItemDetails } from "./ItemDetails";

type Contextuals = "list" | "item" | "itemForm";

export let Contextual = () => {
  let router = useRouter();
  let [context, setContext] = React.useState<Contextuals>("list");

  React.useEffect(() => {
    if (router.query.itemId) {
      setContext("item");
    }
  }, [router.query.itemId]);

  return (
    <>
      {context === "list" && (
        <ShoppingList onAddItem={() => setContext("itemForm")} />
      )}
      {context === "itemForm" && (
        <ItemForm onComplete={() => setContext("list")} />
      )}
      {context === "item" && (
        <ItemDetails
          itemId={router.query.itemId as string}
          onComplete={() => {
            router.push({
              query: undefined,
            });
            setContext("list");
          }}
        />
      )}
    </>
  );
};
