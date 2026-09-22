import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export interface TimeInput12HourProps {
  id?: string;
  value?: string;
  onChange: (formattedValue: string) => void;
  required?: boolean;
  className?: string;
}

export const TimeInput12Hour: React.FC<TimeInput12HourProps> = ({
  id = 'input-time-12h',
  value = '',
  onChange,
  className = '',
}) => {
  // Helper to parse incoming string like "11:00 AM", "14:00", or "11:00"
  const parseIncomingTime = (str: string) => {
    if (!str) return { time: '11:00', period: 'AM' as const, hour: '11', minute: '00' };

    const trimmed = str.trim();
    const hasPm = /pm/i.test(trimmed);
    const hasAm = /am/i.test(trimmed);
    const cleanNumbers = trimmed.replace(/[^\d:]/g, '');
    const parts = cleanNumbers.split(':');

    let hourNum = parseInt(parts[0] || '11', 10);
    const minNum = parts[1] || '00';

    let detectedPeriod: 'AM' | 'PM' = 'AM';
    if (hasPm) {
      detectedPeriod = 'PM';
    } else if (hasAm) {
      detectedPeriod = 'AM';
    } else if (hourNum >= 12) {
      detectedPeriod = 'PM';
      if (hourNum > 12) hourNum -= 12;
    } else if (hourNum === 0) {
      hourNum = 12;
      detectedPeriod = 'AM';
    }

    const hourStr = String(hourNum || 12).padStart(2, '0');
    const minStr = String(minNum).padStart(2, '0').slice(0, 2);

    return {
      time: `${hourStr}:${minStr}`,
      period: detectedPeriod,
      hour: hourStr,
      minute: minStr,
    };
  };

  const initial = parseIncomingTime(value || '11:00 AM');
  const [timeDigits, setTimeDigits] = useState(initial.time);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);

  // Sync internal state if prop changes externally
  useEffect(() => {
    if (value) {
      const parsed = parseIncomingTime(value);
      setTimeDigits(parsed.time);
      setPeriod(parsed.period);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
    }
  }, [value]);

  const emitChange = (timeStr: string, p: 'AM' | 'PM') => {
    const formatted = `${timeStr} ${p}`;
    onChange(formatted);
  };

  const handleInputChange = (raw: string) => {
    let newPeriod = period;
    if (/pm/i.test(raw)) newPeriod = 'PM';
    else if (/am/i.test(raw)) newPeriod = 'AM';

    // Keep numbers and colon
    let clean = raw.replace(/[^\d:]/g, '');

    // Auto-insert colon if user typed 4 digits without colon (e.g. "1100")
    if (/^\d{3,4}$/.test(clean)) {
      if (clean.length === 3) {
        clean = `${clean.slice(0, 1)}:${clean.slice(1)}`;
      } else {
        clean = `${clean.slice(0, 2)}:${clean.slice(2)}`;
      }
    }

    setTimeDigits(clean);
    setPeriod(newPeriod);

    // Update hour / minute dropdowns if valid
    const parts = clean.split(':');
    if (parts[0]) {
      const h = parseInt(parts[0], 10);
      if (h >= 1 && h <= 12) setSelectedHour(String(h).padStart(2, '0'));
    }
    if (parts[1]) {
      setSelectedMinute(parts[1].slice(0, 2).padStart(2, '0'));
    }

    emitChange(clean || '11:00', newPeriod);
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    emitChange(timeDigits || `${selectedHour}:${selectedMinute}`, newPeriod);
  };

  const handleHourSelect = (newHour: string) => {
    setSelectedHour(newHour);
    const newTime = `${newHour}:${selectedMinute}`;
    setTimeDigits(newTime);
    emitChange(newTime, period);
  };

  const handleMinuteSelect = (newMinute: string) => {
    setSelectedMinute(newMinute);
    const newTime = `${selectedHour}:${newMinute}`;
    setTimeDigits(newTime);
    emitChange(newTime, period);
  };

  const applyPreset = (h: string, m: string, p: 'AM' | 'PM') => {
    setSelectedHour(h);
    setSelectedMinute(m);
    const newTime = `${h}:${m}`;
    setTimeDigits(newTime);
    setPeriod(p);
    emitChange(newTime, p);
  };

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary Input Row: Type or View Time + Segmented AM / PM Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            placeholder="11:00"
            value={timeDigits}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full text-sm py-2.5 pl-9 pr-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white font-medium text-slate-900 shadow-2xs"
          />
          <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* AM / PM Segmented Option Selector */}
        <div
          id={`${id}-ampm-group`}
          className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 shrink-0"
        >
          <button
            type="button"
            id={`${id}-btn-am`}
            onClick={() => handlePeriodChange('AM')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              period === 'AM'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            id={`${id}-btn-pm`}
            onClick={() => handlePeriodChange('PM')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              period === 'PM'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Secondary Choose Row: Dropdown Selectors & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Quick Dropdown Picker for Hour & Minute */}
        <div className="flex items-center gap-1 text-slate-600">
          <span className="text-[11px] text-slate-400">Choose:</span>
          <select
            id={`${id}-select-hour`}
            value={selectedHour}
            onChange={(e) => handleHourSelect(e.target.value)}
            aria-label="Hour"
            className="py-1 px-1.5 text-xs bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-blue-500"
          >
            {hoursList.map((h) => (
              <option key={h} value={h}>
                {parseInt(h, 10)}
              </option>
            ))}
          </select>
          <span className="text-slate-400 font-bold">:</span>
          <select
            id={`${id}-select-minute`}
            value={selectedMinute}
            onChange={(e) => handleMinuteSelect(e.target.value)}
            aria-label="Minute"
            className="py-1 px-1.5 text-xs bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-1 focus:ring-blue-500"
          >
            {minutesList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            id={`${id}-select-period`}
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value as 'AM' | 'PM')}
            aria-label="AM or PM"
            className="py-1 px-1.5 text-xs bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-1 focus:ring-blue-500 ml-0.5"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset('09', '00', 'AM')}
            className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors"
          >
            9:00 AM
          </button>
          <button
            type="button"
            onClick={() => applyPreset('11', '00', 'AM')}
            className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors"
          >
            11:00 AM
          </button>
          <button
            type="button"
            onClick={() => applyPreset('02', '30', 'PM')}
            className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors"
          >
            2:30 PM
          </button>
          <button
            type="button"
            onClick={() => applyPreset('06', '00', 'PM')}
            className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors"
          >
            6:00 PM
          </button>
        </div>
      </div>
    </div>
  );
};
