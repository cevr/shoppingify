import { Box, BoxProps } from "@chakra-ui/core";

export let Paper = (props: BoxProps) => (
  <Box
    padding="2"
    rounded="2"
    boxShadow="0px 2px 12px rgba(0, 0, 0, 0.05);"
    {...props}
  />
);
