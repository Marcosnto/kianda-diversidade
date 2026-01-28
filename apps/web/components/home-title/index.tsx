import Image from "next/image";
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
    <div className={cn(`mb-4 mt-4 ${hasDivider} ${borderColor} w-full`).trim()}>
      <span
        className={cn(
          `text-[18px] md:text-[24px] lg:text-[34px] flex  italic ${className}`,
          children ? "justify-between" : "justify-end"
        )}
      >
        {children}
        <span className="mt-[8px]">
          {iconType === "completeMoon" ? (
            <Image
              alt="half moon"
              src="/imgs/complete_moon.svg"
              width={48}
              height={48}
            />
          ) : (
            <span>
              <Image
                className="md:hidden"
                alt="half moon"
                src="/imgs/half_moon_mobile.svg"
                width={48}
                height={48}
              />
              <Image
                className="hidden md:block"
                alt="half moon"
                src="/imgs/half_moon.svg"
                width={48}
                height={48}
              />
            </span>
          )}
        </span>
      </span>
    </div>
  );
};

export default HomeTitle;
