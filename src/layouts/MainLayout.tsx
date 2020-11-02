import * as React from "react";
import { Box, Flex } from "@chakra-ui/core";

import { Nav, Contextual } from "@components/index";

let MainLayout: React.FC = ({ children }) => (
  <Flex height="100vh" width="100vw">
    <Flex
      as="nav"
      height="100%"
      width={24}
      py="8"
      flexDir="column"
      justifyContent="space-between"
    >
      <Nav />
    </Flex>
    <Box height="100%" width="100%" bg="gray.100" py="10" px={16}>
      {children}
    </Box>
    <Box height="100%" width="390px">
      <Contextual />
    </Box>
  </Flex>
);

export default MainLayout;
