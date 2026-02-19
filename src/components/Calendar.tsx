import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { timezones, convertTimeToTimezone } from '../utils/timezones';

interface CalendarProps {
  onSelectDateTime: (date: Date, time: string, timezone: string) => void;
}

export default function Calendar({ onSelectDateTime }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState('UTC+1');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getAvailableTimesInUTC1 = (date: Date) => {
    const dayOfWeek = date.getDay();
    const times: string[] = [];

    if (dayOfWeek === 6) {
      for (let hour = 5; hour <= 23; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 23) {
          times.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
      times.push('23:30');
    } else if (dayOfWeek === 0) {
      for (let hour = 5; hour <= 22; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 22) {
          times.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
      times.push('22:30');
    } else if (dayOfWeek === 1) {
      times.push('17:30');
      for (let hour = 18; hour < 24; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    } else if (dayOfWeek === 5) {
      times.push('12:30');
      for (let hour = 13; hour < 24; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    } else {
      times.push('15:30');
      for (let hour = 16; hour < 24; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }

    return times;
  };

  useEffect(() => {
    if (selectedDate) {
      const utc1Times = getAvailableTimesInUTC1(selectedDate);
      const convertedTimes = utc1Times.map(time =>
        convertTimeToTimezone(time, 'UTC+1', selectedTimezone)
      ).sort();
      setAvailableTimes(convertedTimes);
    }
  }, [selectedDate, selectedTimezone]);

  const isDateAvailable = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const handleDateClick = (day: number) => {
    if (!isDateAvailable(day)) return;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    const utc1Times = getAvailableTimesInUTC1(date);
    const convertedTimes = utc1Times.map(time =>
      convertTimeToTimezone(time, 'UTC+1', selectedTimezone)
    ).sort();
    setAvailableTimes(convertedTimes);
  };

  const handleTimeClick = (time: string) => {
    if (selectedDate) {
      onSelectDateTime(selectedDate, time, selectedTimezone);
    }
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2 md:p-4"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isAvailable = isDateAvailable(day);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isSelected = selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === currentDate.getMonth() &&
                      selectedDate?.getFullYear() === currentDate.getFullYear();

    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        disabled={!isAvailable}
        className={`p-2 md:p-4 rounded-lg transition-all text-sm md:text-base ${
          isSelected
            ? 'bg-white text-black font-bold'
            : isAvailable
            ? 'text-white hover:bg-gray-800 cursor-pointer'
            : 'text-gray-600 cursor-not-allowed'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-4 md:mb-6">
        <label className="block text-gray-400 text-xs md:text-sm mb-2">Timezone</label>
        <select
          value={selectedTimezone}
          onChange={(e) => {
            setSelectedTimezone(e.target.value);
            if (selectedDate) {
              const utc1Times = getAvailableTimesInUTC1(selectedDate);
              const convertedTimes = utc1Times.map(time =>
                convertTimeToTimezone(time, 'UTC+1', e.target.value)
              ).sort();
              setAvailableTimes(convertedTimes);
            }
          }}
          className="w-full bg-gray-800 text-white px-3 md:px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white text-xs md:text-sm"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-2xl font-bold text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-1 md:p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 md:p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
        {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) => (
          <div key={day} className="text-center text-gray-400 text-xs md:text-sm font-semibold p-1 md:p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 md:mb-8">
        {days}
      </div>

      {selectedDate && (
        <div>
          <h4 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4">Available Times (in your timezone)</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 max-h-48 md:max-h-64 overflow-y-auto">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeClick(time)}
                className="px-2 md:px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-white hover:text-black transition-colors text-xs md:text-sm"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
