import * as React from "react";

import { Nav, Contextual } from "@components/index";

export let MainLayout: React.FC = ({ children }) => (
  <div className="h-full w-full flex">
    <nav className="w-40 sm:w-24 py-8 flex flex-col justify-between">
      <Nav />
    </nav>
    <main className="w-full bg-gray-100 p-6 md:py-10 md:px-16">{children}</main>
    <aside style={{ minWidth: 360 }}>
      <Contextual />
    </aside>
  </div>
);
