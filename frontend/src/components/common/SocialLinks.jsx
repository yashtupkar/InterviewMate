import React from 'react';

const socials = [
  { label: 'Instagram', icon: 'skill-icons:instagram.svg', url: 'https://www.instagram.com/placemateai/', size: 22 },
  { label: 'LinkedIn', icon: 'logos:linkedin-icon.svg', url: 'https://www.linkedin.com/in/placemateai-private-limited-092a143b8/', size: 22 },
  { label: 'X', icon: 'simple-icons:x.svg?color=white', url: 'https://x.com/PlaceMateAI', size: 20 },
  { label: 'WhatsApp', icon: 'logos:whatsapp-icon.svg', url: 'https://whatsapp.com/channel/0029VbDWsV8B4hdYG13kSP2T', size: 22 },
  { label: 'Email', icon: 'logos:google-gmail.svg', url: 'mailto:placemateai@gmail.com', size: 22 },
];

const SocialLinks = () => {
  return (
    <div className="flex flex-wrap gap-4">
      {socials.map((social) => (
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
