import React from "react";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { TimeSelect } from "./time-select";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";

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

export function CustomDateTimePicker({
  value,
  onChange,
  disabled = false,
  label = "Select Date & Time",
  placeholder = "Select date and time",
  minDate,
  className,
  showLabel = false,
}: CustomDateTimePickerProps) {
  const hour = value ? value.getHours() : 18;
  const minute = value ? value.getMinutes() : 0;
  
  const handleDateChange = (date: Date) => {
    // Keep the existing time values
    const newDate = set(date, {
      hours: hour,
      minutes: minute,
      seconds: 0,
      milliseconds: 0
    });
    onChange(newDate);
  };
  
  const handleHourChange = (newHour: number) => {
    if (!value) {
      // If no date yet, use today's date with the selected time
      const today = new Date();
      const newDate = set(today, {
        hours: newHour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0
      });
      onChange(newDate);
    } else {
      // Update existing date with new time
      const newDate = set(value, {
        hours: newHour
      });
      onChange(newDate);
    }
  };
  
  const handleMinuteChange = (newMinute: number) => {
    if (!value) {
      // If no date yet, use today's date with the selected time
      const today = new Date();
      const newDate = set(today, {
        hours: hour,
        minutes: newMinute,
        seconds: 0,
        milliseconds: 0
      });
      onChange(newDate);
    } else {
      // Update existing date with new time
      const newDate = set(value, {
        minutes: newMinute
      });
      onChange(newDate);
    }
  };
  
  return (
    <div className={cn("w-full", className)}>
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
                {format(value, "EEE, MMMM d, yyyy")}
                <span className="text-indigo-400 ml-2">
                  {format(value, "h:mm a")}
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
} 