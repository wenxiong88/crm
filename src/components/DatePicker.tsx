import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addYears,
  subYears,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parse,
  isValid,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LanguageContext } from '../contexts/LanguageContext';

interface DatePickerProps {
  value: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  className?: string;
}

export default function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const { language } = useContext(LanguageContext);
  const locale = language === 'zh' ? zhCN : undefined;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const d = parse(value, 'yyyy-MM-dd', new Date());
      return isValid(d) ? d : new Date();
    }
    return new Date();
  });
  const [slideDirection, setSlideDirection] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 380;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < dropdownHeight && rect.top > dropdownHeight
      ? rect.top + window.scrollY - dropdownHeight - 4
      : rect.bottom + window.scrollY + 4;
    setDropdownPos({ top, left: rect.left + window.scrollX });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (value) {
      const d = parse(value, 'yyyy-MM-dd', new Date());
      if (isValid(d)) setCurrentMonth(d);
    }
  }, [value]);

  const weekDays = language === 'zh'
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const navigateMonth = (dir: number) => {
    setSlideDirection(dir);
    setCurrentMonth(prev => dir > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const navigateYear = (dir: number) => {
    setSlideDirection(dir);
    setCurrentMonth(prev => dir > 0 ? addYears(prev, 1) : subYears(prev, 1));
  };

  const selectDate = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
    setViewMode('days');
  };

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
    setCurrentMonth(newDate);
    setViewMode('days');
  };

  const selectYear = (year: number) => {
    const newDate = new Date(year, currentMonth.getMonth(), 1);
    setCurrentMonth(newDate);
    setViewMode('months');
  };

  const goToToday = () => {
    const today = new Date();
    onChange(format(today, 'yyyy-MM-dd'));
    setCurrentMonth(today);
    setIsOpen(false);
    setViewMode('days');
  };

  const clearDate = () => {
    onChange('');
    setIsOpen(false);
    setViewMode('days');
  };

  const displayValue = selectedDate && isValid(selectedDate)
    ? format(selectedDate, 'dd MMM yyyy', { locale })
    : '';

  const months = language === 'zh'
    ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const currentYear = currentMonth.getFullYear();
  const yearRangeStart = currentYear - 6;
  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

  const calendarDropdown = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
          className="fixed z-[9999] w-[300px] bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          {/* Gradient top bar */}
          <div className="h-1 btn-gradient" />

          {/* Header */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => viewMode === 'years' ? navigateYear(-12) : viewMode === 'months' ? navigateYear(-1) : navigateMonth(-1)}
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>

            <button
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => setViewMode(prev => prev === 'days' ? 'months' : prev === 'months' ? 'years' : 'days')}
            >
              {viewMode === 'years'
                ? `${yearRangeStart} - ${yearRangeStart + 11}`
                : viewMode === 'months'
                  ? currentYear
                  : format(currentMonth, language === 'zh' ? 'yyyy年 MM月' : 'MMMM yyyy', { locale })
              }
            </button>

            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => viewMode === 'years' ? navigateYear(12) : viewMode === 'months' ? navigateYear(1) : navigateMonth(1)}
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>

          {/* Day View */}
          {viewMode === 'days' && (
            <div className="px-3 pb-2">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-1">
                {weekDays.map(day => (
                  <div key={day} className="h-8 flex items-center justify-center text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <motion.div
                key={currentMonth.toISOString()}
                initial={{ opacity: 0, x: slideDirection * 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-7"
              >
                {calendarDays.map((day, i) => {
                  const inMonth = isSameMonth(day, currentMonth);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const today = isToday(day);

                  return (
                    <button
                      key={i}
                      className={`
                        relative w-full aspect-square flex items-center justify-center text-sm rounded-xl transition-all duration-150
                        ${!inMonth ? 'text-gray-300 dark:text-gray-700' : 'text-gray-700 dark:text-gray-300'}
                        ${selected
                          ? 'btn-gradient text-white font-semibold shadow-sm'
                          : inMonth
                            ? 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                        }
                        ${today && !selected ? 'font-bold text-[var(--primary-color)]' : ''}
                      `}
                      onClick={() => selectDate(day)}
                    >
                      {format(day, 'd')}
                      {today && !selected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--primary-color)]" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* Month View */}
          {viewMode === 'months' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="px-3 pb-2 grid grid-cols-3 gap-1"
            >
              {months.map((month, i) => {
                const isCurrentMonth = currentMonth.getMonth() === i;
                return (
                  <button
                    key={month}
                    className={`
                      py-3 rounded-xl text-sm font-medium transition-all duration-150
                      ${isCurrentMonth
                        ? 'btn-gradient text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }
                    `}
                    onClick={() => selectMonth(i)}
                  >
                    {month}
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Year View */}
          {viewMode === 'years' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="px-3 pb-2 grid grid-cols-3 gap-1"
            >
              {years.map(year => {
                const isCurrentYear = currentMonth.getFullYear() === year;
                return (
                  <button
                    key={year}
                    className={`
                      py-3 rounded-xl text-sm font-medium transition-all duration-150
                      ${isCurrentYear
                        ? 'btn-gradient text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }
                    `}
                    onClick={() => selectYear(year)}
                  >
                    {year}
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Footer */}
          <div className="px-3 pb-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/50 pt-2 mt-1">
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--primary-color)] hover:bg-[var(--glow-color)] transition-colors"
              onClick={goToToday}
            >
              {language === 'zh' ? '今天' : 'Today'}
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              onClick={clearDate}
            >
              {language === 'zh' ? '清除' : 'Clear'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div
        ref={triggerRef}
        tabIndex={0}
        role="button"
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white dark:bg-gray-900/50 text-sm input-themed cursor-pointer group focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <i className="fa-regular fa-calendar text-gray-400 dark:text-gray-500 group-hover:text-[var(--primary-color)] transition-colors" />
        <span className={displayValue ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
          {displayValue || (language === 'zh' ? '请选择日期' : 'Select date')}
        </span>
        {value && (
          <button
            className="ml-auto w-5 h-5 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={(e) => { e.stopPropagation(); clearDate(); }}
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        )}
        <i className={`fa-solid fa-chevron-down text-[10px] text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${value ? '' : 'ml-auto'}`} />
      </div>

      {/* Portal dropdown */}
      {createPortal(calendarDropdown, document.body)}
    </div>
  );
}
