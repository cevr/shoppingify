import * as React from "react";
import { useRouter } from "next/router";

import { Nav, Contextual } from "@components/index";
import { useIsMobile } from "@shared/index";

export let MainLayout: React.FC = ({ children }) => {
  let [contextualActive, setContextualActive] = React.useState(false);
  let router = useRouter();
  let isMobile = useIsMobile();

  React.useEffect(() => {
    if (router.query.itemId) {
      setContextualActive(true);
    }
  }, [router.query]);

  return (
    <div className="h-full w-full flex">
      <nav className="lg:w-24 py-8 flex flex-col justify-between">
        <Nav
          onCartClick={() => setContextualActive((active) => !active)}
          onItemClick={() => setContextualActive(false)}
        />
      </nav>
      {!isMobile ? (
        <>
          <div className="w-full flex flex-col justify-between bg-gray-100 overflow-y-auto">
            <main className="p-6 lg:py-10 lg:px-16 h-full">{children}</main>
            <Footer />
          </div>
          <aside style={{ minWidth: 360 }}>
            <Contextual />
          </aside>
        </>
      ) : contextualActive ? (
        <aside className="w-full">
          <Contextual />
        </aside>
      ) : (
        <div className="w-full flex flex-col justify-between bg-gray-100 overflow-y-auto">
          <main className="p-6 lg:py-10 lg:px-16 h-full">{children}</main>
          <Footer />
        </div>
      )}
    </div>
  );
};

let Footer = () => (
  <footer className="grid place-items-center">cvr @ DevChallenges.io</footer>
);
