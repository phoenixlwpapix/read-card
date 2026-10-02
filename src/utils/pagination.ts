import { useState, useEffect } from 'react';
import type { CardConfig } from '../types';

/**
 * Smart pagination hook for 3:4 reading card (900 x 1200px)
 * Measures actual rendered paragraph heights within the 3:4 container
 */
export function usePagination(config: CardConfig) {
  const [pages, setPages] = useState<string[][]>([[]]);

  useEffect(() => {
    let cancelled = false;

    const calculatePages = () => {
      const paragraphs = config.articleContent
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (!paragraphs.length) {
        if (!cancelled) setPages([[]]);
        return;
      }

      // Estimate available height in 900x1200 card with header/footer removed
      // Card height: 1200px
      // Top padding: 42px, Bottom padding: 36px (total 78px)
      // Header: title row + article title (~105px)
      // Footer: 0 (removed)
      const hasTitle = Boolean(config.articleTitle.trim());
      const headerEstimate = (hasTitle ? 123 : 68) + (config.author ? 24 : 0);
      const footerEstimate = 0;
      const verticalPadding = 78;
      let availableHeight = 1200 - headerEstimate - footerEstimate - verticalPadding;

      if (config.showImage && config.imageUrl) {
        if (config.imagePosition === 'top-banner') {
          availableHeight -= (config.bannerHeight || 220) + 24; // Banner height + margin
        }
      }

      // Create a hidden measurement container matching the card's exact dimensions
      const measure = document.createElement('div');
      measure.style.position = 'absolute';
      measure.style.left = '-9999px';
      measure.style.top = '0';
      measure.style.visibility = 'hidden';
      measure.style.width = '808px'; // 900 - 46*2
      measure.style.fontSize = `${config.fontSize}px`;
      measure.style.lineHeight = String(config.lineHeight);
      const getFontStack = (fam: typeof config.fontFamily) => {
        switch (fam) {
          case 'literata':
            return "'Literata', 'Songti SC', 'Source Han Serif SC', SimSun, Georgia, serif";
          case 'source-serif':
            return "'Source Serif 4', 'Songti SC', 'Source Han Serif SC', SimSun, Georgia, serif";
          case 'lora':
            return "'Lora', 'Songti SC', 'Source Han Serif SC', SimSun, Georgia, serif";
          case 'manrope':
          default:
            return "'Manrope', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif";
        }
      };
      measure.style.fontFamily = getFontStack(config.fontFamily);
      measure.style.letterSpacing = config.fontFamily === 'manrope' ? '0.015em' : '0.028em';
      measure.style.fontWeight = config.isBold ? '600' : '400';
      measure.style.wordBreak = 'break-word';

      document.body.appendChild(measure);

      const fits = (pList: string[], isFirstPage: boolean) => {
        measure.replaceChildren();

        if (
          isFirstPage &&
          config.showImage &&
          config.imageUrl &&
          config.imagePosition === 'float-right'
        ) {
          const imgMock = document.createElement('div');
          imgMock.style.float = 'right';
          imgMock.style.width = '270px';
          imgMock.style.height = '270px';
          imgMock.style.margin = '0 0 20px 28px';
          measure.appendChild(imgMock);
        }

        for (const text of pList) {
          const p = document.createElement('p');
          p.textContent = text
            .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1');
          p.style.margin = '0 0 16px 0';
          measure.appendChild(p);
        }

        return measure.getBoundingClientRect().height <= availableHeight;
      };

      const result: string[][] = [];
      let currentPage: string[] = [];

      for (const text of paragraphs) {
        const isFirst = result.length === 0;
        if (fits([...currentPage, text], isFirst)) {
          currentPage.push(text);
          continue;
        }

        // Try breaking long paragraph by sentence
        const segmenter =
          typeof Intl !== 'undefined' && 'Segmenter' in Intl
            ? new Intl.Segmenter('en', { granularity: 'sentence' })
            : null;

        const sentences = segmenter
          ? [...segmenter.segment(text)].map((s) => s.segment.trim()).filter(Boolean)
          : text.split(/(?<=[.!?。！？])\s+/).map((s) => s.trim()).filter(Boolean);

        let subCandidate = '';
        for (const sentence of sentences) {
          const isPageFirst = result.length === 0;
          const candidate = subCandidate ? `${subCandidate} ${sentence}` : sentence;
          if (fits([...currentPage, candidate], isPageFirst)) {
            subCandidate = candidate;
          } else {
            if (subCandidate) currentPage.push(subCandidate);
            if (currentPage.length) result.push(currentPage);
            currentPage = [];
            subCandidate = sentence;
          }
        }
        if (subCandidate) currentPage.push(subCandidate);
      }

      if (currentPage.length) result.push(currentPage);
      measure.remove();

      if (!cancelled) {
        setPages(result.length ? result : [[]]);
      }
    };

    void document.fonts.ready.then(calculatePages);

    return () => {
      cancelled = true;
    };
  }, [
    config.articleContent,
    config.fontSize,
    config.lineHeight,
    config.fontFamily,
    config.showAvatar,
    config.author,
    config.showImage,
    config.imageUrl,
    config.imagePosition,
    config.isBold,
    config.articleTitle,
    config.bannerHeight,
  ]);

  return pages;
}
