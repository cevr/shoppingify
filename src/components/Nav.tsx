import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Badge,
  Box,
  Flex,
  Icon,
  IconButton,
  Image,
  Stack,
  Tooltip,
} from "@chakra-ui/core";
import { MdList, MdReplay, MdAssessment, MdShoppingCart } from "react-icons/md";

import { useActiveList } from "@shared/index";

export let Nav = () => {
  let router = useRouter();
  let activeList = useActiveList();
  return (
    <>
      <Flex px="3" justifyContent="center">
        <Image rounded="full" src="/logo.svg" alt="Logo" />
      </Flex>

      <Stack spacing={5} shouldWrapChildren>
        <NavItem
          label="items"
          href="/items"
          active={router.asPath === "/items"}
          icon={MdList}
        />
        <NavItem
          label="history"
          href="/history"
          active={router.asPath === "/history"}
          icon={MdReplay}
        />
        <NavItem
          label="statistics"
          href="/statistics"
          active={router.asPath === "/statistics"}
          icon={MdAssessment}
        />
      </Stack>
      <Flex justifyContent="center" position="relative">
        <IconButton
          aria-label="active list"
          icon={<MdShoppingCart />}
          height="10"
          width="10"
          rounded="full"
          bg="orange.500"
          color="white"
          padding="2"
          _hover={{
            backgroundColor: "orange.300"
          }}
        />
        {activeList && activeList.items.length > 0 ? (
          <Badge colorScheme="red" position="absolute" top="0" right="4">
            {activeList.items.length}
          </Badge>
        ) : null}
      </Flex>
    </>
  );
};

interface NavItemProps {
  active?: boolean;
  icon: React.ElementType;
  href: string;
  label: string;
}

let NavItem: React.FC<NavItemProps> = ({ active, icon, href, label }) => {
  return (
    <Flex position="relative" justifyContent="center" height="12">
      {active ? (
        <Box
          bg="orange.500"
          width="6px"
          height="100%"
          position="absolute"
          borderRadius="0 4px 4px 0"
          left={0}
        />
      ) : null}
      <Link href={href}>
        <a>
          <Tooltip label={label} aria-label={label} hasArrow placement="right">
            <Flex height="100%" alignItems="center" justifyContent="center">
              <Icon as={icon} color="gray.600" height="5" width="5" />
            </Flex>
          </Tooltip>
        </a>
      </Link>
    </Flex>
  );
};
