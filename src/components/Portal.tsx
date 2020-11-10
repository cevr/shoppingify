import * as React from "react";
import * as ReactDOM from "react-dom";

export let Portal: React.FC = ({ children }) => {
  let ref = React.useRef<null | HTMLElement>();
  let [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    ref.current = document.getElementById("__next");
    setMounted(true);
  }, []);

  return mounted ? ReactDOM.createPortal(children, ref.current!) : null;
};
