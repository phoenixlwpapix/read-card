import literata from '@fontsource/literata/files/literata-latin-400-normal.woff2?url';
import literataBold from '@fontsource/literata/files/literata-latin-600-normal.woff2?url';
import sourceSerif4 from '@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff2?url';
import sourceSerif4Bold from '@fontsource/source-serif-4/files/source-serif-4-latin-600-normal.woff2?url';
import lora from '@fontsource/lora/files/lora-latin-400-normal.woff2?url';
import loraBold from '@fontsource/lora/files/lora-latin-600-normal.woff2?url';
import manrope from '@fontsource/manrope/files/manrope-latin-400-normal.woff2?url';
import manropeBold from '@fontsource/manrope/files/manrope-latin-600-normal.woff2?url';
import fraunces from '@fontsource/fraunces/files/fraunces-latin-600-normal.woff2?url';

let cached: Promise<string> | null = null;

export function exportFonts(): Promise<string> {
  cached ??= Promise.all([
    { name: 'Literata', weight: 400, url: literata },
    { name: 'Literata', weight: 600, url: literataBold },
    { name: 'Source Serif 4', weight: 400, url: sourceSerif4 },
    { name: 'Source Serif 4', weight: 600, url: sourceSerif4Bold },
    { name: 'Lora', weight: 400, url: lora },
    { name: 'Lora', weight: 600, url: loraBold },
    { name: 'Manrope', weight: 400, url: manrope },
    { name: 'Manrope', weight: 600, url: manropeBold },
    { name: 'Fraunces', weight: 600, url: fraunces },
  ].map(async ({ name, weight, url }) => {
    try {
      const response = await fetch(url);
      if (!response.ok) return '';
      const blob = await response.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(`@font-face { font-family: '${name}'; font-weight: ${weight}; src: url(${reader.result}) format('woff2'); }`);
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  })).then((faces) => faces.filter(Boolean).join('\n'));

  return cached;
}
