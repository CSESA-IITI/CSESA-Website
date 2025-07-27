import { Github, Linkedin, Instagram } from 'lucide-react';

// Define a type for your social links for better type safety
export interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

// Create the main configuration object
export const siteConfig = {
  name: "CSESA",
  url: "https://csesa-iiti.github.io/CSESA-Website/",
  email: "csesa@iiti.ac.in",
  github: "https://github.com/CSESA-IITI",
  linkedin: "https://linkedin.com/company/csesa-iit-indore",
  instagram: "https://www.instagram.com/csesa_iiti/",
};

// Create an array of social links for easy mapping in components
export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: siteConfig.github,
    icon: <Github />,
  },
  {
    name: "LinkedIn",
    url: siteConfig.linkedin,
    icon: <Linkedin />,
  },
  {
    name: "Instagram",
    url: siteConfig.instagram,
    icon: <Instagram />,
  },
];