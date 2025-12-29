import { cn } from "@workspace/ui/lib/utils";

type HomeTitleProps = {
  children?: React.ReactNode;
  iconType?: "completeMoon" | "halfMoon";
  italic?: boolean;
  showDivider?: boolean;
  borderColor?: string;
  className?: string;
};

const HomeTitle = ({
  children,
  className,
  iconType,
  showDivider = true,
  borderColor = "border-black",
}: HomeTitleProps) => {
  const hasDivider = showDivider
    ? "border-black border-t-[1px] md:border-t-[1.5px] lg:border-t-[3px]"
    : "border-none";

  return (
    <div className={cn(`mb-4 mt-4 ${hasDivider} ${borderColor}`).trim()}>
      <span
        className={cn(
          `text-[18px] md:text-[24px] lg:text-[34px] flex  italic ${className}`,
          children ? "justify-between" : "justify-end"
        )}
      >
        {children}
        <span className="mt-[8px]">
          {iconType === "completeMoon" ? (
            <img alt="half moon" src="/imgs/complete_moon.svg" />
          ) : (
            <span>
              <img
                className="md:hidden"
                alt="half moon"
                src="/imgs/half_moon_mobile.svg"
              />
              <img
                className="hidden md:block"
                alt="half moon"
                src="/imgs/half_moon.svg"
              />
            </span>
          )}
        </span>
      </span>
    </div>
  );
};

export default HomeTitle;
