type HomeTitleProps = {
  children?: React.ReactNode;
  iconType?: "completeMoon" | "halfMoon";
  italic?: boolean;
  showDivider?: boolean;
  borderColor?: string;
  className?: string;
};

const HomeTitle = ({ children }: HomeTitleProps) => {
  return (
    <div>
      <span className="mt-[6px] text-[18px] md:text-[24px] lg:text-[34px]">
        {children}
      </span>
    </div>
  );
};

export default HomeTitle;
