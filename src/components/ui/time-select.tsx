import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface TimeSelectProps {
  className?: string;
  setHour: (hour: number) => void;
  setMinute: (minute: number) => void;
  value?: {
    hour?: number;
    minute?: number;
  };
  disabled?: boolean;
  onTimeChange?: (hour: number, minute: number) => void;
}

export function TimeSelect({
  className,
  setHour,
  setMinute,
  value,
  disabled = false,
  onTimeChange,
}: TimeSelectProps) {
  const [selectedHour, setSelectedHour] = useState<number>(value?.hour ?? 18); // Default to 6 PM
  const [selectedMinute, setSelectedMinute] = useState<number>(value?.minute ?? 0);
  const [period, setPeriod] = useState<"AM" | "PM">(
    value?.hour !== undefined ? (value.hour >= 12 ? "PM" : "AM") : "PM"
  );

  // Update local state when props change
  useEffect(() => {
    if (value?.hour !== undefined) {
      setSelectedHour(value.hour);
      setPeriod(value.hour >= 12 ? "PM" : "AM");
    }
    if (value?.minute !== undefined) {
      setSelectedMinute(value.minute);
    }
  }, [value?.hour, value?.minute]);

  // Generate hours for dropdown (12-hour format)
  const hours = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);
  
  // Generate minutes for dropdown (increments of 5)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleHourChange = (hour: string) => {
    // Convert 12-hour format to 24-hour format
    let numHour = parseInt(hour, 10);
    if (period === "PM" && numHour < 12) {
      numHour += 12;
    } else if (period === "AM" && numHour === 12) {
      numHour = 0;
    }
    
    setSelectedHour(numHour);
    setHour(numHour);
    if (onTimeChange) onTimeChange(numHour, selectedMinute);
  };

  const handleMinuteChange = (minute: string) => {
    const numMinute = parseInt(minute, 10);
    setSelectedMinute(numMinute);
    setMinute(numMinute);
    if (onTimeChange) onTimeChange(selectedHour, numMinute);
  };

  const handlePeriodChange = (newPeriod: string) => {
    const newP = newPeriod as "AM" | "PM";
    setPeriod(newP);
    
    let numHour = selectedHour;
    // Convert between AM/PM
    if (newP === "PM" && selectedHour < 12) {
      numHour += 12;
    } else if (newP === "AM" && selectedHour >= 12) {
      numHour -= 12;
    }
    
    setSelectedHour(numHour);
    setHour(numHour);
    if (onTimeChange) onTimeChange(numHour, selectedMinute);
  };

  // Convert selected hour to 12-hour format for display
  const displayHour = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-grow">
        <Select
          disabled={disabled}
          value={displayHour.toString()}
          onValueChange={handleHourChange}
        >
          <SelectTrigger className="w-full h-10 py-2 px-3 bg-indigo-900 font-bold text-white border-2 border-indigo-600 hover:bg-indigo-700 shadow-md">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent className="max-h-[220px] bg-slate-800 border-2 border-indigo-500">
            {hours.map(hour => (
              <SelectItem 
                key={hour} 
                value={hour.toString()} 
                className="text-white py-2 hover:bg-indigo-600 font-bold"
              >
                {hour}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <span className="text-2xl font-bold text-center text-white px-1">:</span>
      
      <div className="relative flex-grow">
        <Select
          disabled={disabled}
          value={selectedMinute.toString()}
          onValueChange={handleMinuteChange}
        >
          <SelectTrigger className="w-full h-10 py-2 px-3 bg-indigo-900 font-bold text-white border-2 border-indigo-600 hover:bg-indigo-700 shadow-md">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent className="max-h-[220px] bg-slate-800 border-2 border-indigo-500">
            {minutes.map(minute => (
              <SelectItem 
                key={minute} 
                value={minute.toString()} 
                className="text-white py-2 hover:bg-indigo-600 font-bold"
              >
                {minute.toString().padStart(2, '0')}
              </SelectItem>
            ))}
            {![0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].includes(selectedMinute) && (
              <SelectItem 
                value={selectedMinute.toString()} 
                className="text-white py-2 hover:bg-indigo-600 font-bold"
              >
                {selectedMinute.toString().padStart(2, '0')}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative flex-grow">
        <Select
          disabled={disabled}
          value={period}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-full h-10 py-2 px-3 bg-indigo-900 font-bold text-white border-2 border-indigo-600 hover:bg-indigo-700 shadow-md">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-2 border-indigo-500">
            <SelectItem value="AM" className="text-white py-2 hover:bg-indigo-600 font-bold">AM</SelectItem>
            <SelectItem value="PM" className="text-white py-2 hover:bg-indigo-600 font-bold">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 