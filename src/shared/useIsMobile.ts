import { useBreakpoint } from "./useBreakpoint";

export let useIsMobile = () => {
  let breakpoint = useBreakpoint();

  return ["base", "sm"].includes(breakpoint);
};
