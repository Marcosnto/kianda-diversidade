import { cn } from "@workspace/ui/lib/utils";

type HomeTitleProps = {
  children?: React.ReactNode;
  iconType?: "completeMoon" | "halfMoon";
  italic?: boolean;
  showDivider?: boolean;
  borderColor?: string;
  className?: string;
};

const HomeTitle = ({ children, className }: HomeTitleProps) => {
  return (
    <div>
      <span
        className={cn(
          `mt-[6px] text-[18px] md:text-[24px] lg:text-[34px]) ${className}`
        )}
      >
        {children}
      </span>
    </div>
  );
};

export default HomeTitle;
