import * as React from "react";
import { PopperProps } from "react-popper";
import { Popover } from "./Popover";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  placement?: PopperProps<any>["placement"];
}

export let Tooltip = ({ children, label, placement }: TooltipProps) => {
  let [visible, setVisible] = React.useState(false);
  let [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

  return (
    <>
      <span
        ref={setAnchor}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>

      <Popover anchor={anchor} open={visible} placement={placement}>
        <div className="py-1 px-2 text-xs bg-gray-900 opacity-75 rounded text-white ml-2">
          {label}
        </div>
      </Popover>
    </>
  );
};
