import React from 'react';
import { COMPANY_DETAILS } from '../../constants/company';

const SocialLinks = () => {
  return (
    <div className="flex flex-wrap gap-4">
      {COMPANY_DETAILS.socials.map((social) => (
        <a
          key={social.label}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-900 text-custom-muted transition-all duration-500 hover:translate-y-[-5px] hover:border-custom-accent hover:text-custom-accent hover:shadow-[0_10px_20px_rgba(0,0,0,0.3),0_0_15px_rgba(122,242,152,0.2)]"
          aria-label={social.label}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-custom-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img
            src={`https://api.iconify.design/${social.icon}`}
            alt={social.label}
            width={social.size - 2}
            height={social.size - 2}
            className="relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[8deg] brightness-110"
          />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
