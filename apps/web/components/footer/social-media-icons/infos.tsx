import {
  AiOutlineInstagram,
  AiFillYoutube,
  AiOutlineWhatsApp,
  AiOutlineTikTok,
} from "react-icons/ai";
import { FaThreads, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";

type SocialMediaInfosType = {
  link: string;
  icon: React.ReactNode;
  key: string;
  label: string;
};

type SocialLinks = {
  youtube?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  threads?: string | null;
  facebook?: string | null;
  whatsapp?: string | null;
  tiktok?: string | null;
  x?: string | null;
};

export function getSocialMediaInfos(
  links: SocialLinks | null,
): SocialMediaInfosType[] {
  const socialMediaInfos: Array<SocialMediaInfosType | null> = [
    links?.youtube
      ? {
          link: links.youtube,
          icon: <AiFillYoutube color="white" />,
          key: "youtube",
          label: "YouTube",
        }
      : null,
    links?.linkedin
      ? {
          link: links.linkedin,
          icon: <FaLinkedinIn color="white" />,
          key: "linkedin",
          label: "LinkedIn",
        }
      : null,
    links?.instagram
      ? {
          link: links.instagram,
          icon: <AiOutlineInstagram color="white" />,
          key: "instagram",
          label: "Instagram",
        }
      : null,
    links?.threads
      ? {
          link: links.threads,
          icon: <FaThreads color="white" />,
          key: "threads",
          label: "Threads",
        }
      : null,
    links?.facebook
      ? {
          link: links.facebook,
          icon: <FaFacebookF color="white" />,
          key: "facebook",
          label: "Facebook",
        }
      : null,
    links?.whatsapp
      ? {
          link: links.whatsapp,
          icon: <AiOutlineWhatsApp color="white" />,
          key: "whatsapp",
          label: "WhatsApp",
        }
      : null,
    links?.tiktok
      ? {
          link: links.tiktok,
          icon: <AiOutlineTikTok color="white" />,
          key: "tiktok",
          label: "TikTok",
        }
      : null,
    links?.x
      ? {
          link: links.x,
          icon: <FaXTwitter color="white" />,
          key: "x",
          label: "X",
        }
      : null,
  ];

  return socialMediaInfos.filter(
    (item): item is SocialMediaInfosType => item !== null,
  );
}
