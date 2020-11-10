import * as React from "react";

let breakpoints = [
  ["base", "(min-width: 0) and (max-width: 640px)"],
  ["sm", "(min-width: 640px) and (max-width: 768px)"],
  ["md", "(min-width: 768px) and (max-width: 1024px)"],
  ["lg", "(min-width: 1024px) and (max-width: 1280px)"],
  ["xl", "(min-width: 1280px)"],
] as const;

export let useBreakpoint = (defaultBreakpoint?: string) => {
  let [currentBreakpoint, setCurrentBreakpoint] = React.useState(() => {
    let breakpoint = breakpoints.find(
      ([breakpoint]) => breakpoint === defaultBreakpoint
    );

    return breakpoint?.[0] ?? breakpoints[0][0];
  });

  React.useEffect(() => {
    let listeners = breakpoints.map((breakpointTuple) => {
      let [breakpoint, query] = breakpointTuple;
      let mediaQuery = window.matchMedia(query);

      if (mediaQuery.matches) {
        setCurrentBreakpoint(breakpoint);
      }

      let handleChange = (event: MediaQueryListEvent) => {
        if (event.matches) {
          setCurrentBreakpoint(breakpoint);
        }
      };

      mediaQuery.addEventListener("change", handleChange);

      return { mediaQuery, handleChange };
    });

    return () => {
      listeners.forEach(({ mediaQuery, handleChange }) => {
        mediaQuery.removeEventListener("change", handleChange);
      });
    };
  }, []);

  return currentBreakpoint;
};
