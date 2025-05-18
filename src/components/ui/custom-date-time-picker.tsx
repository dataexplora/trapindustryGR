import React, { forwardRef, Ref } from "react";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { TimeSelect } from "./time-select";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomDateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  className?: string;
  showLabel?: boolean;
}

export const CustomDateTimePicker = forwardRef(({
  value,
  onChange,
  disabled = false,
  label = "Select Date & Time",
  placeholder = "Select date and time",
  minDate,
  className,
  showLabel = false,
}: CustomDateTimePickerProps, ref: Ref<HTMLDivElement>) => {
  const hour = value ? value.getHours() : 18;
  const minute = value ? value.getMinutes() : 0;
  
  const handleDateChange = (date: Date) => {
    // Keep the existing time values
    const newDate = new Date(date);
    newDate.setHours(hour, minute, 0, 0);
    onChange(newDate);
  };
  
  const handleHourChange = (newHour: number) => {
    if (!value) {
      // If no date yet, use today's date with the selected time
      const today = new Date();
      today.setHours(newHour, minute, 0, 0);
      onChange(today);
    } else {
      // Update existing date with new time
      const newDate = new Date(value);
      newDate.setHours(newHour);
      onChange(newDate);
    }
  };
  
  const handleMinuteChange = (newMinute: number) => {
    if (!value) {
      // If no date yet, use today's date with the selected time
      const today = new Date();
      today.setHours(hour, newMinute, 0, 0);
      onChange(today);
    } else {
      // Update existing date with new time
      const newDate = new Date(value);
      newDate.setMinutes(newMinute);
      onChange(newDate);
    }
  };

  // Direct time formatting without libraries
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  };

  // Direct date formatting without libraries
  const formatDate = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  
  return (
    <div className={cn("w-full", className)} ref={ref}>
      {showLabel && label && (
        <p className="text-sm font-medium mb-1.5 text-white">{label}</p>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full pl-3 text-left font-normal justify-start h-10 bg-slate-800/70 border border-indigo-500/30 hover:border-indigo-500/80 transition-colors ${!value && "text-slate-400"}`}
            disabled={disabled}
          >
            {value ? (
              <>
                {formatDate(value)}
                <span className="text-indigo-400 ml-2">
                  {formatTime(value)}
                </span>
              </>
            ) : (
              <span>{placeholder}</span>
            )}
            <Calendar className="ml-auto h-4 w-4 text-indigo-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-slate-900 border-2 border-indigo-500/50 shadow-2xl" 
          align="start"
          sideOffset={4}
        >
          <div className="p-3 border-b border-slate-800 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="space-y-2">
              <h4 className="font-bold text-base text-white">Event Time</h4>
              <div className="flex items-center gap-1 bg-slate-800/60 backdrop-blur-sm border border-indigo-500/30 rounded-md p-2 shadow-lg">
                <Clock className="h-5 w-5 text-indigo-300 mr-2" />
                <TimeSelect
                  value={{ hour, minute }}
                  setHour={handleHourChange}
                  setMinute={handleMinuteChange}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
          
          <CustomDatePicker
            selectedDate={value}
            onDateChange={handleDateChange}
            disabled={disabled}
            minDate={minDate}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}); 