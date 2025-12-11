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
};

const style = "py-[1px] px-[1px]";

export const socialMediaInfos: SocialMediaInfosType[] = [
  {
    link: "https://www.instagram.com/kiandadiversidade/",
    icon: <AiFillYoutube color="white" />,
    key: "youtube",
  },
  {
    link: "https://www.instagram.com/kiandadiversidade/",
    icon: <FaLinkedinIn color="white" />,
    key: "linkedin",
  },
  {
    link: "https://www.instagram.com/kiandadiversidade/",
    icon: <AiOutlineInstagram color="white" />,
    key: "instragram",
  },
  {
    link: "https://www.instagram.com/kiandadiversidade/",
    icon: <FaThreads color="white" />,
    key: "threads",
  },
  {
    link: "https://www.instagram.com/kiandadiversidade/",
    icon: <FaFacebookF color="white" />,
    key: "facebook",
  },
  {
    link: "https://www.instagram.com/kiandadiversidade/",
    icon: <AiOutlineWhatsApp color="white" />,
    key: "whatsapp",
  },
  {
    link: "https://www.instagram.com/kiandadiversidade/",
    icon: <AiOutlineTikTok color="white" />,
    key: "tiktok",
  },
  {
    link: "https://www.instagram.com/kiandadiversidade/",
    icon: <FaXTwitter color="white" />,
    key: "x",
  },
];
