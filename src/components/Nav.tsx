import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdList, MdReplay, MdAssessment, MdShoppingCart } from "react-icons/md";

import { useActiveList } from "@shared/index";
import { Tooltip } from "./Tooltip";

interface NavProps {
  onItemClick: () => void;
  onCartClick: () => void;
}

export let Nav = ({ onCartClick, onItemClick }: NavProps) => {
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

      <div className="grid grid-cols-1 gap-4">
        <NavItem
          onClick={onItemClick}
          label="items"
          href="/items"
          active={router.pathname === "/items"}
          icon={MdList}
        />
        <NavItem
          onClick={onItemClick}
          label="history"
          href="/history"
          active={router.pathname === "/history"}
          icon={MdReplay}
        />
        <NavItem
          onClick={onItemClick}
          label="statistics"
          href="/statistics"
          active={router.pathname === "/statistics"}
          icon={MdAssessment}
        />
      </div>
      <div onClick={onCartClick} className="flex justify-center relative p-2">
        <button className="rounded-full bg-brand-primary flex items-center justify-center h-12 w-12 text-white hover:bg-orange-300">
          <MdShoppingCart className="h-6 w-6" />
        </button>
        {itemsLeft ? (
          <span
            className="absolute text-xs p-1 rounded-md bg-red-600 text-white top-0 right-0"
            style={{
              padding: "2px 8px",
              right: "0.5rem",
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
  onClick: () => void;
}

let NavItem: React.FC<NavItemProps> = ({
  active,
  icon: Icon,
  href,
  label,
  onClick,
}) => {
  return (
    <div className="relative flex justify-center items-center h-12">
      {active ? (
        <div
          className="bg-brand-primary flex-1 absolute left-0 h-full"
          style={{ width: "6px", borderRadius: "0 4px 4px 0" }}
        />
      ) : null}
      <Link href={href}>
        <a onClick={onClick}>
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
