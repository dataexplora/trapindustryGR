import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeSelect } from "./time-select";

interface TimePickerInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  setHour: (hour: number) => void;
  setMinute: (minute: number) => void;
  value?: {
    hour?: number;
    minute?: number;
  };
  disabled?: boolean;
}

export const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  ({ className, setHour, setMinute, value, disabled, ...props }, ref) => {
    // TimePickerInput now uses the TimeSelect component for a more user-friendly interface
    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        <div className="flex items-center bg-slate-800 border-2 border-indigo-500 rounded-lg p-2 shadow-xl">
          <Clock className="h-5 w-5 text-indigo-300 mr-2" />
          <TimeSelect
            value={value}
            setHour={setHour}
            setMinute={setMinute}
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>
    );
  }
);

TimePickerInput.displayName = "TimePickerInput"; 