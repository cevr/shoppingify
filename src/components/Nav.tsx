import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdList, MdReplay, MdAssessment, MdShoppingCart } from "react-icons/md";

import { useActiveList } from "@shared/index";
import { Tooltip } from "./Tooltip";

export let Nav = () => {
  let router = useRouter();
  let activeList = useActiveList();

  let itemsLeft = activeList?.items.filter((item) => !item.complete).length;
  return (
    <>
      <div className="flex px-2 justify-center">
        <img
          className="rounded-full h-auto w-full"
          src="/logo.svg"
          alt="Logo"
        />
      </div>

      <div>
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
      </div>
      <div className="flex justify-center relative p-2">
        <button className="rounded-full bg-brand-primary flex items-center justify-center h-12 w-12 text-white hover:bg-orange-300">
          <MdShoppingCart className="h-6 w-6" />
        </button>
        {itemsLeft ? (
          <span
            className="absolute text-xs p-1 rounded-md bg-red-600 text-white top-0 right-0"
            style={{
              padding: "2px 8px",
              right: "0.25rem",
            }}
          >
            {itemsLeft}
          </span>
        ) : null}
      </div>
    </>
  );
};

interface NavItemProps {
  active?: boolean;
  icon: React.FC<any>;
  href: string;
  label: string;
}

let NavItem: React.FC<NavItemProps> = ({ active, icon: Icon, href, label }) => {
  return (
    <div className="relative flex justify-center h-12">
      {active ? (
        <div
          className="bg-brand-primary flex-1 absolute left-0"
          style={{ width: "6px", borderRadius: "0 4px 4px 0" }}
        />
      ) : null}
      <Link href={href}>
        <a>
          <Tooltip
            // className="bg-gray-900 text-white p-2 rounded"
            label={label}
          >
            <div className="flex flex-1 items-center justify-center">
              <Icon className="text-gray-600 h-6 w-6 text-lg" />
            </div>
          </Tooltip>
        </a>
      </Link>
    </div>
  );
};
