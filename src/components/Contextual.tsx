import * as React from "react";
import { Box, Flex, HStack } from "@chakra-ui/core";

export let Contextual = () => {
  let [status, setStatus] = React.useState<"list" | "addingItem">("list");

  return (
    <>
      {status === "list" && <ShoppingList />}
      {status === "addingItem" && <ItemForm />}
    </>
  );
};

let ShoppingList = () => {
  return (
    <Box bg="orange.100" height="100%" width="100%" padding="6">
      <HStack></HStack>
    </Box>
  );
};

let ItemForm = () => {
  return (
    <Box>
      <HStack></HStack>
    </Box>
  );
};
