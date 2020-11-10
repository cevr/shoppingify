import * as React from "react";
import { usePopper, PopperProps } from "react-popper";
import { Portal } from "./Portal";

interface PopoverProps {
  children: React.ReactElement;
  placement?: PopperProps<any>["placement"];
  open?: boolean;
  anchor: HTMLElement | null;
}

export let Popover = ({ children, placement, open, anchor }: PopoverProps) => {
  let [popperElement, setPopperElement] = React.useState<HTMLElement | null>(
    null
  );
  let { styles, attributes } = usePopper(anchor, popperElement, {
    placement: placement ?? "right",
  });

  return open ? (
    <Portal>
      {React.cloneElement(children, {
        ref: setPopperElement,
        style: styles.popper,
        ...attributes.popper,
      })}
    </Portal>
  ) : null;
};
