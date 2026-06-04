import { format } from "date-fns";
import { enGB, enUS, de, fr, es } from "date-fns/locale";
import {
  Linkedin,
  Github,
  Twitter,
  Briefcase,
  Link as LinkIcon,
} from "lucide-react";

const locales = {
  "English (UK)": enGB,
  "English (US)": enUS,
  German: de,
  French: fr,
  Spanish: es,
};

/**
 * Formats a date string based on the user's preference.
 * Supports: DD/MM/YYYY, MM/YYYY, YYYY, Month YYYY (e.g., JAN 2025)
 */
export const formatResumeDate = (
  dateStr,
  dateFormat = "DD/MM/YYYY",
  language = "English (UK)",
) => {
  if (!dateStr || dateStr.toLowerCase() === "present") return dateStr;

  try {
    // Try to parse the date string (assume YYYY-MM-DD or MM/YYYY or YYYY)
    let date;
    if (dateStr.length === 4) {
      date = new Date(dateStr, 0, 1);
    } else if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 2) {
        date = new Date(parts[1], parts[0] - 1, 1);
      } else {
        date = new Date(dateStr);
      }
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return dateStr;

    const map = {
      "DD/MM/YYYY": "dd/MM/yyyy",
      "MM/DD/YYYY": "MM/dd/yyyy",
      "YYYY-MM-DD": "yyyy-MM-dd",
      "MM/YYYY": "MM/yyyy",
      YYYY: "yyyy",
      "Month YYYY": "MMM yyyy",
    };

    const locale = locales[language] || enGB;
    const formatted = format(date, map[dateFormat] || "dd/MM/yyyy", { locale });
    return formatted.toUpperCase();
  } catch (error) {
    return dateStr;
  }
};

/**
 * Parses and formats a description list based on preference.
 */
export const formatDescriptionList = (text, listStyle = "bullet") => {
  if (!text || listStyle === "none") return text;

  const char = listStyle === "bullet" ? "•" : listStyle === "hyphen" ? "-" : "";
  if (!char) return text;

  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      // Check if it already starts with a common bullet character
      const bulletChars = ["-", "*", "•", "·"];
      let content = trimmed;

      const startsWithBullet = bulletChars.some((c) => trimmed.startsWith(c));
      if (startsWithBullet) {
        content = trimmed.substring(1).trim();
      }

      return `${char} ${content}`;
    })
    .filter(Boolean)
    .join("\n");
};

export const getFontFamily = (fontName) => {
  const mapping = {
    // Sans
    Inter: "Inter, sans-serif",
    Roboto: "Roboto, sans-serif",
    Outfit: "Outfit, sans-serif",
    "Space Grotesk": '"Space Grotesk", sans-serif',

    // Serif
    Lora: "Lora, serif",
    "Source Serif Pro": '"Source Serif 4", serif',
    "Zilla Slab": '"Zilla Slab", serif',
    "PT Serif": '"PT Serif", serif',
    Literata: "Literata, serif",
    "EB Garamond": '"EB Garamond", serif',
    "Latin Modern": '"Source Serif 4", serif',
    Aleo: "Aleo, serif",
    "Crimson Pro": '"Crimson Pro", serif',
    "Cormorant Garamond": '"Cormorant Garamond", serif',
    Vollkorn: "Vollkorn, serif",
    Amiri: "Amiri, serif",
    "Crimson Text": '"Crimson Text", serif',
    Alegreya: "Alegreya, serif",
    "Playfair Display": '"Playfair Display", serif',

    // Mono
    Mono: "monospace",
    "Roboto Mono": '"Roboto Mono", monospace',
    Inconsolata: "Inconsolata, monospace",
  };

  return mapping[fontName] || mapping["Inter"];
};

/**
 * Returns an icon component for a given link label and URL.
 */
export const getLinkIcon = (label, url) => {
  const text = (label + url).toLowerCase();
  if (text.includes("linkedin")) return <Linkedin size={14} />;
  if (text.includes("github")) return <Github size={14} />;
  if (text.includes("twitter")) return <Twitter size={14} />;
  if (text.includes("portfolio")) return <Briefcase size={14} />;
  return <LinkIcon size={14} />;
};

/**
 * Extracts unique keywords from a resume object (such as names, skills, projects, and experiences).
 * @param {Object} resume The resume object from ResumeContext
 * @returns {Array<string>} An array of unique keyword strings
 */
export const getKeywordsFromResume = (resume) => {
  if (!resume) return [];
  const words = [];
  
  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "about", "above", "after", "along", 
    "amid", "among", "as", "at", "by", "for", "from", "in", "into", "like", 
    "minus", "near", "of", "off", "on", "onto", "out", "over", "past", "since", 
    "through", "to", "under", "until", "up", "with", "within", "without", 
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", 
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", 
    "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", 
    "theirs", "themselves", "what", "which", "who", "whom", "this", "that", 
    "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", 
    "have", "has", "had", "having", "do", "does", "did", "doing", "would", 
    "should", "could", "ought", "i'm", "you're", "he's", "she's", "it's", 
    "we're", "they're", "i've", "you've", "we've", "they've", "i'd", "you'd", 
    "he'd", "she'd", "we'd", "they'd", "i'll", "you'll", "he'll", "she'll", 
    "we'll", "they'll", "isn't", "aren't", "wasn't", "weren't", "hasn't", 
    "haven't", "hadn't", "doesn't", "don't", "didn't", "won't", "wouldn't", 
    "shan't", "shouldn't", "can't", "cannot", "couldn't", "mustn't", "let's", 
    "that's", "who's", "what's", "here's", "there's", "when's", "where's", 
    "why's", "how's"
  ]);

  const addText = (text) => {
    if (!text || typeof text !== "string") return;
    // Match words and technical terms like C++, C#, .NET, Node.js, React
    const matches = text.match(/[A-Za-z0-9+#.-]+/g);
    if (matches) {
      matches.forEach((word) => {
        let cleanWord = word.trim();
        // Remove trailing punctuation
        cleanWord = cleanWord.replace(/[.,;:!?)]+$/, "").replace(/^[.(]+/, "");
        const lower = cleanWord.toLowerCase();
        if (cleanWord.length > 2 && !STOP_WORDS.has(lower)) {
          words.push(cleanWord);
        }
      });
    }
  };

  // 1. Personal Info
  if (resume.personalInfo) {
    addText(resume.personalInfo.fullName);
    addText(resume.personalInfo.firstName);
    addText(resume.personalInfo.lastName);
    addText(resume.personalInfo.jobTitle);
    addText(resume.personalInfo.location);
  }

  // 2. Profiles
  if (Array.isArray(resume.profiles)) {
    resume.profiles.forEach((p) => {
      if (p.visible !== false) addText(p.content);
    });
  }

  // 3. Experience
  if (Array.isArray(resume.experience)) {
    resume.experience.forEach((e) => {
      if (e.visible !== false) {
        addText(e.title);
        addText(e.company);
        addText(e.location);
        addText(e.description);
      }
    });
  }

  // 4. Education
  if (Array.isArray(resume.education)) {
    resume.education.forEach((edu) => {
      if (edu.visible !== false) {
        addText(edu.institution);
        addText(edu.degree);
        addText(edu.field);
        addText(edu.location);
      }
    });
  }

  // 5. Skills
  if (Array.isArray(resume.skills)) {
    resume.skills.forEach((s) => {
      if (s.visible !== false) {
        addText(s.category);
        addText(s.subSkills);
      }
    });
  }

  // 6. Projects
  if (Array.isArray(resume.projects)) {
    resume.projects.forEach((proj) => {
      if (proj.visible !== false) {
        addText(proj.title);
        addText(proj.description);
      }
    });
  }

  // 7. Certifications
  if (Array.isArray(resume.certifications)) {
    resume.certifications.forEach((c) => {
      if (c.visible !== false) {
        addText(c.name);
        addText(c.issuer);
      }
    });
  }

  // Get unique keywords, limit to 80 to prevent hitting API query length limits
  return Array.from(new Set(words)).slice(0, 80);
};
