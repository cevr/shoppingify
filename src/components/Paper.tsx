export let Paper: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={`rounded p-3 shadow-sm bg-white ${className}`}>
    {children}
  </div>
);
