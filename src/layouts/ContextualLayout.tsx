interface ContextualLayoutProps {
  secondary: React.ReactNode;
  primary: React.ReactNode;
}

export let ContextualLayout = ({
  secondary,
  primary,
}: ContextualLayoutProps) => {
  return (
    <div className="grid grid-rows-2 h-full">
      <div className="row-span-full">{primary}</div>
      <div className="row-span-1 p-8 flex justify-center items-center">
        {secondary}
      </div>
    </div>
  );
};
