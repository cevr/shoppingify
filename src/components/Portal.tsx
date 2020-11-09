import * as React from "react";
import * as ReactDOM from "react-dom";

export let Portal: React.FC = ({ children }) => {
  const ref = React.useRef<null | HTMLElement>();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    ref.current = document.getElementById("__next");
    setMounted(true);
  }, []);

  return mounted ? ReactDOM.createPortal(children, ref.current!) : null;
};
