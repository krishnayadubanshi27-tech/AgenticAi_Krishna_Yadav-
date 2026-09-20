import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ResourceItem } from '../types/learning';
import { ResourceCard } from './ResourceCard';

interface ResourceCarouselProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ElementType;
  resources: ResourceItem[];
  isAlertRow?: boolean;
}

export const ResourceCarousel: React.FC<ResourceCarouselProps> = ({
  title,
  subtitle,
  badge,
  icon: Icon,
  resources,
  isAlertRow = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const current = scrollRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll);
      return () => current.removeEventListener('scroll', checkScroll);
    }
  }, [resources]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  if (resources.length === 0) return null;

  return (
    <div className={`mb-10 relative group/carousel ${isAlertRow ? 'p-4 sm:p-6 rounded-3xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80' : ''}`}>
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {Icon && (
              <div className={`p-1.5 rounded-lg ${isAlertRow ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400'}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isAlertRow ? 'text-amber-950 dark:text-amber-200' : 'text-slate-900 dark:text-slate-100'}`}>
              {title}
            </h2>
            {badge && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isAlertRow 
                  ? 'bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700' 
                  : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
              }`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Arrow Controls (Desktop) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrolling Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar horizontal-scroll-container py-2 px-1"
      >
        {resources.map(res => (
          <ResourceCard key={res.id} resource={res} />
        ))}
      </div>
    </div>
  );
};
