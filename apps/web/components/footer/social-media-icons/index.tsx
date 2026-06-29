import Link from "next/link";
import React from "react";
import { JSXElementConstructor, ReactElement } from "react";

export default function SocialMediaIcon({
  link,
  icon,
  label,
}: {
  link: string;
  label: string;
  icon: ReactElement<
    { className?: string },
    string | JSXElementConstructor<{ className?: string }>
  >;
}) {
  return (
    <Link
      aria-label={`Acessar ${label}`}
      href={link}
      rel="noreferrer"
      target="_blank"
    >
      <span className="flex h-[29.24px] w-[29.24px] items-center justify-center gap-2 rounded-sm bg-k-olive-deep md:h-[56.41px] md:w-[56.41px] lg:h-[75px] lg:w-[75px]">
        {React.cloneElement(icon, {
          className: "h-[20px] w-[20px] md:h-[35px] md:w-[35px]",
        })}
      </span>
    </Link>
  );
}
