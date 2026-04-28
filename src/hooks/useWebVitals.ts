/**
 * Hook para monitoramento de Core Web Vitals
 * 
 * @see https://web.dev/articles/vitals
 */
import { useEffect, useCallback } from 'react';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: any[];
  navigationType: string;
}

// Thresholds do Google
const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
};

export const useWebVitals = (onReport?: (metric: Metric) => void) => {
  const reportMetric = useCallback((metric: Metric) => {
    // Log para debugging
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });

    // Envia para analytics se configurado
    if (onReport) {
      onReport(metric);
    }

    // Envia para Google Analytics se existir
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.rating,
        non_interaction: true,
      });
    }
  }, [onReport]);

  useEffect(() => {
    // Importação dinâmica da biblioteca web-vitals
    let cancelled = false;

    const initVitals = async () => {
      try {
        const { onLCP, onINP, onCLS } = await import('web-vitals');

        if (cancelled) return;

        // Monitor LCP (Largest Contentful Paint)
        onLCP((metric) => {
          const rating = metric.value <= thresholds.LCP.good 
            ? 'good' 
            : metric.value <= thresholds.LCP.poor 
              ? 'needs-improvement' 
              : 'poor';
          
          reportMetric({ ...metric, rating });
        });

        // Monitor INP (Interaction to Next Paint)
        onINP((metric) => {
          const rating = metric.value <= thresholds.INP.good 
            ? 'good' 
            : metric.value <= thresholds.INP.poor 
              ? 'needs-improvement' 
              : 'poor';
          
          reportMetric({ ...metric, rating });
        });

        // Monitor CLS (Cumulative Layout Shift)
        onCLS((metric) => {
          const rating = metric.value <= thresholds.CLS.good 
            ? 'good' 
            : metric.value <= thresholds.CLS.poor 
              ? 'needs-improvement' 
              : 'poor';
          
          reportMetric({ ...metric, rating });
        });
      } catch (error) {
        console.warn('[Web Vitals] Não foi possível carregar web-vitals:', error);
      }
    };

    initVitals();

    return () => {
      cancelled = true;
    };
  }, [reportMetric]);

  return null;
};

// Função utilitária para identificar elementos LCP
export const identifyLCPElement = () => {
  if (typeof window === 'undefined' || !PerformanceObserver) return null;

  new PerformanceObserver((list) => {
    const entries = list.getEntries() as any[];
    const lastEntry = entries[entries.length - 1];
    console.log('[LCP Element]', {
      element: lastEntry.element,
      tagName: lastEntry.element?.tagName,
      id: lastEntry.element?.id,
      className: lastEntry.element?.className,
      time: lastEntry.startTime,
      size: lastEntry.size,
    });
  }).observe({ type: 'largest-contentful-paint', buffered: true } as any);
};

// Função utilitária para debug de CLS
export const trackLayoutShifts = () => {
  if (typeof window === 'undefined' || !PerformanceObserver) return;

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as any[]) {
      if (!entry.hadRecentInput) {
        console.log('[CLS] Layout shift:', {
          value: entry.value,
          sources: entry.sources?.map((source: any) => ({
            node: source.node?.tagName,
            previousRect: source.previousRect,
            currentRect: source.currentRect,
          })),
        });
      }
    }
  }).observe({ type: 'layout-shift', buffered: true } as any);
};
