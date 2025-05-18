import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { add, format, isSameDay, isSameMonth, isToday, set, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, getDay, parse, startOfDay } from "date-fns";

interface CustomDatePickerProps {
  selectedDate?: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  disabled?: boolean;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CustomDatePicker({ selectedDate, onDateChange, minDate, disabled }: CustomDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Create calendar days grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const today = startOfDay(new Date());
  const minDateTime = minDate ? startOfDay(minDate).getTime() : null;
  
  const rows = [];
  let days = [];
  let day = startDate;
  
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isDisabled = (
        disabled || 
        (minDateTime !== null && day.getTime() < minDateTime)
      );
      
      days.push(
        <button
          key={day.toString()}
          className={`
            w-10 h-10 flex items-center justify-center font-medium text-sm rounded-md m-0.5
            ${isCurrentMonth ? "text-white" : "text-gray-500 opacity-40"}
            ${isToday(day) ? "bg-gradient-to-br from-purple-700 to-indigo-700 border-2 border-indigo-300 shadow-md" : ""}
            ${isSelected ? "bg-gradient-to-r from-indigo-600 to-purple-600 border border-white shadow-lg" : ""}
            ${isDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-700 hover:text-white transition-colors duration-200 cursor-pointer"}
          `}
          onClick={() => !isDisabled && onDateChange(cloneDay)}
          disabled={isDisabled}
        >
          {format(day, "d")}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toString()} className="flex w-full">
        {days}
      </div>
    );
    days = [];
  }
  
  const prevMonth = () => {
    setCurrentMonth(add(currentMonth, { months: -1 }));
  };
  
  const nextMonth = () => {
    setCurrentMonth(add(currentMonth, { months: 1 }));
  };
  
  return (
    <div className="border-2 border-indigo-500/50 rounded-lg overflow-hidden shadow-xl">
      {/* Header with month and navigation */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
        <div 
          onClick={prevMonth}
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
        >
          <div style={{
            width: '0',
            height: '0',
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: '14px solid white',
            marginRight: '3px'
          }}></div>
        </div>
        <h2 className="text-xl font-bold text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div 
          onClick={nextMonth}
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'}
        >
          <div style={{
            width: '0',
            height: '0',
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderLeft: '14px solid white',
            marginLeft: '3px'
          }}></div>
        </div>
      </div>
      
      {/* Days header */}
      <div className="bg-slate-800 p-2 flex">
        {DAYS.map(day => (
          <div 
            key={day} 
            className="w-10 h-8 flex items-center justify-center text-indigo-300 font-bold text-xs"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="bg-slate-900 p-1">
        {rows}
      </div>
    </div>
  );
}