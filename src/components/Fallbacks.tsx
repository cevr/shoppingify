let FallbackLayout: React.FC = ({ children }) => (
  <div className="grid place-items-center text-xl">{children}</div>
);

export let ErrorFallback: React.FC = ({ children }) => (
  <FallbackLayout>
    {children ?? "Oops, something went wrong here!"}
  </FallbackLayout>
);

export let EmptyFallback: React.FC = ({ children }) => (
  <FallbackLayout>{children ?? "There's nothing here... yet."}</FallbackLayout>
);
