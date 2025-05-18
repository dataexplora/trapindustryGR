import React, { useState, useRef, useEffect, forwardRef } from "react";
import { Check, ChevronsUpDown, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type OptionType = {
  label: string;
  value: string;
  imageUrl?: string;
};

interface MultiSelectProps extends React.ComponentPropsWithRef<"div"> {
  options: OptionType[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  onSearch?: (searchTerm: string) => Promise<void>;
  isSearching?: boolean;
  serverSideSearch?: boolean;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  ({
    options,
    selected,
    onChange,
    placeholder = "Select options",
    emptyMessage = "No options found.",
    className,
    disabled = false,
    onSearch,
    isSearching = false,
    serverSideSearch = false,
    ...props
  }, ref) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [searchTriggered, setSearchTriggered] = useState(false);
    const lastSearchRef = useRef<string>("");

    useEffect(() => {
      if (open && inputRef.current) {
        inputRef.current.focus();
      }
    }, [open]);

    // Debounce search query
    useEffect(() => {
      const timerId = setTimeout(() => {
        setDebouncedQuery(query);
      }, 300);
      
      return () => clearTimeout(timerId);
    }, [query]);

    // Effect for server-side search
    useEffect(() => {
      // Only trigger search if the debounced query is different from the last search
      // and it's at least 2 characters long
      if (serverSideSearch && 
          onSearch && 
          debouncedQuery.length >= 2 && 
          debouncedQuery !== lastSearchRef.current && 
          !searchTriggered) {
        
        // Mark that we're initiating a search to prevent duplicates
        setSearchTriggered(true);
        
        // Save the current search term
        lastSearchRef.current = debouncedQuery;
        
        // Execute the search
        onSearch(debouncedQuery).finally(() => {
          // Clear the flag when search is complete
          setSearchTriggered(false);
        });
      }
    }, [debouncedQuery, onSearch, serverSideSearch, searchTriggered]);

    // Reset search when dropdown closes
    useEffect(() => {
      if (!open) {
        // Reset query when the dropdown closes
        setQuery("");
        setDebouncedQuery("");
        lastSearchRef.current = "";
      }
    }, [open]);

    // Removed excessive logging
    useEffect(() => {
      // Only log when there are small numbers of items or debugging specific issues
      if (open && options.length > 0 && options.length < 5) {
        console.log(`MultiSelect: ${options.length} options available`);
      }
    }, [open, options.length, query]);

    const handleSelect = (value: string) => {
      if (selected.includes(value)) {
        onChange(selected.filter((item) => item !== value));
      } else {
        onChange([...selected, value]);
      }
    };

    const handleRemove = (value: string) => {
      onChange(selected.filter((item) => item !== value));
    };

    // Improved filtering logic to handle more options efficiently
    // When serverSideSearch is true, we rely on the options being already filtered by the server
    const filteredOptions = serverSideSearch 
      ? options
      : query
        ? options.filter((option) => {
            const searchTerm = query.toLowerCase();
            const label = option.label.toLowerCase();
            const value = option.value.toLowerCase();
            
            // Exact match (high priority)
            if (label === searchTerm || value === searchTerm) {
              return true;
            }
            
            // Starts with the query (medium priority)
            if (label.startsWith(searchTerm) || value.startsWith(searchTerm)) {
              return true;
            }
            
            // Contains the query (lower priority)
            return label.includes(searchTerm) || value.includes(searchTerm);
          })
        : options;

    const selectedOptions = options.filter((option) => 
      selected.includes(option.value)
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div ref={ref} {...props}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between hover:bg-background",
                disabled ? "opacity-50 cursor-not-allowed" : "",
                className
              )}
              disabled={disabled}
            >
              {selected.length > 0 ? (
                <div className="flex gap-1 flex-wrap">
                  {selectedOptions.slice(0, 2).map((option) => (
                    <Badge 
                      key={option.value} 
                      variant="secondary"
                      className="mr-1"
                    >
                      {option.label}
                    </Badge>
                  ))}
                  {selected.length > 2 && (
                    <Badge variant="secondary">+{selected.length - 2}</Badge>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 shadow-md border border-slate-200 dark:border-slate-700" align="start">
            <div className="flex flex-col w-full">
              {/* Search input */}
              <div className="flex items-center border-b p-2">
                <Search className="h-4 w-4 mr-2 opacity-50" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search options..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0"
                />
              </div>
              
              {/* Options list */}
              <div className="max-h-[300px] overflow-y-auto py-1">
                {/* Loading state */}
                {isSearching && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                )}
                
                {/* Empty state */}
                {!isSearching && filteredOptions.length === 0 && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    {serverSideSearch && query.length < 2 
                      ? "Type at least 2 characters to search" 
                      : emptyMessage}
                  </div>
                )}
                
                {/* Results */}
                {filteredOptions.length > 0 && !isSearching && (
                  <>
                    {/* Result count header */}
                    {serverSideSearch && query && (
                      <div className="px-2 py-1.5 text-xs text-slate-500 font-medium">
                        {filteredOptions.length} result{filteredOptions.length !== 1 ? 's' : ''} found
                        {filteredOptions.length >= 100 && 
                          " (showing top 100, type more to narrow down)"}
                      </div>
                    )}
                    
                    {/* Option items */}
                    <div className="flex flex-col">
                      {filteredOptions.slice(0, 100).map((option) => {
                        const isSelected = selected.includes(option.value);
                        return (
                          <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm cursor-pointer",
                              "hover:bg-slate-100 dark:hover:bg-slate-700",
                              isSelected ? "bg-slate-100 dark:bg-slate-800" : ""
                            )}
                          >
                            <div className="w-4 h-4 mr-2 flex items-center justify-center">
                              {isSelected && <Check className="h-4 w-4" />}
                            </div>
                            <span>{option.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              
              {/* Selected items */}
              {selected.length > 0 && (
                <div className="border-t p-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedOptions.map((option) => (
                      <Badge 
                        key={option.value} 
                        variant="secondary"
                        className="mr-1 py-1"
                      >
                        {option.label}
                        <button
                          className="ml-1 rounded-full outline-none"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(option.value);
                          }}
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {selected.length > 1 && (
                    <Button
                      variant="ghost"
                      className="mt-2 h-8 p-2 text-xs"
                      onClick={() => onChange([])}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </div>
      </Popover>
    );
  }
); 