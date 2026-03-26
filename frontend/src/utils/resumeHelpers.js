import { format } from 'date-fns';
import { enGB, enUS, de, fr, es } from 'date-fns/locale';

const locales = {
    'English (UK)': enGB,
    'English (US)': enUS,
    'German': de,
    'French': fr,
    'Spanish': es
};

/**
 * Formats a date string based on the user's preference.
 * Supports: DD/MM/YYYY, MM/YYYY, YYYY, Month YYYY (e.g., JAN 2025)
 */
export const formatResumeDate = (dateStr, dateFormat = 'DD/MM/YYYY', language = 'English (UK)') => {
    if (!dateStr || dateStr.toLowerCase() === 'present') return dateStr;
    
    try {
        // Try to parse the date string (assume YYYY-MM-DD or MM/YYYY or YYYY)
        let date;
        if (dateStr.length === 4) {
            date = new Date(dateStr, 0, 1);
        } else if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
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
            'DD/MM/YYYY': 'dd/MM/yyyy',
            'MM/DD/YYYY': 'MM/dd/yyyy',
            'YYYY-MM-DD': 'yyyy-MM-dd',
            'MM/YYYY': 'MM/yyyy',
            'YYYY': 'yyyy',
            'Month YYYY': 'MMM yyyy'
        };

        const locale = locales[language] || enGB;
        const formatted = format(date, map[dateFormat] || 'dd/MM/yyyy', { locale });
        return formatted.toUpperCase();
    } catch (error) {
        return dateStr;
    }
};

/**
 * Parses and formats a description list based on preference.
 */
export const formatDescriptionList = (text, listStyle = 'bullet') => {
    if (!text || listStyle === 'none') return text;
    
    const char = listStyle === 'bullet' ? '•' : listStyle === 'hyphen' ? '-' : '';
    if (!char) return text;

    return text.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
        // Check if it already starts with a common bullet character
        const bulletChars = ['-', '*', '•', '·'];
        let content = trimmed;
        
        const startsWithBullet = bulletChars.some(c => trimmed.startsWith(c));
        if (startsWithBullet) {
            content = trimmed.substring(1).trim();
        }
        
        return `${char} ${content}`;
    }).filter(Boolean).join('\n');
};

/**
 * Returns the CSS font-family string for a given font name.
 */
export const getFontFamily = (fontName) => {
    const mapping = {
        // Sans
        'Inter': 'Inter, sans-serif',
        'Roboto': 'Roboto, sans-serif',
        'Outfit': 'Outfit, sans-serif',
        'Space Grotesk': '"Space Grotesk", sans-serif',
        
        // Serif
        'Lora': 'Lora, serif',
        'Source Serif Pro': '"Source Serif 4", serif',
        'Zilla Slab': '"Zilla Slab", serif',
        'PT Serif': '"PT Serif", serif',
        'Literata': 'Literata, serif',
        'EB Garamond': '"EB Garamond", serif',
        'Latin Modern': '"Source Serif 4", serif',
        'Aleo': 'Aleo, serif',
        'Crimson Pro': '"Crimson Pro", serif',
        'Cormorant Garamond': '"Cormorant Garamond", serif',
        'Vollkorn': 'Vollkorn, serif',
        'Amiri': 'Amiri, serif',
        'Crimson Text': '"Crimson Text", serif',
        'Alegreya': 'Alegreya, serif',
        'Playfair Display': '"Playfair Display", serif',
        
        // Mono
        'Mono': 'monospace',
        'Roboto Mono': '"Roboto Mono", monospace',
        'Inconsolata': 'Inconsolata, monospace'
    };

    return mapping[fontName] || mapping['Inter'];
};
