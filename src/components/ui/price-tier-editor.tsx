import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export interface PriceTier {
  label: string;
  price: number;
}

interface PriceTierEditorProps extends Omit<React.ComponentPropsWithRef<"div">, "onChange" | "value"> {
  value: PriceTier[];
  onChange: (value: PriceTier[]) => void;
  disabled?: boolean;
}

export const PriceTierEditor = forwardRef<HTMLDivElement, PriceTierEditorProps>(
  ({ value, onChange, disabled = false, ...props }, ref) => {
    const handleAddTier = () => {
      // Only add a new tier if all existing tiers have valid data
      const allTiersValid = value.every(tier => 
        tier.label.trim() !== '' && tier.price >= 0
      );
      
      if (allTiersValid) {
        onChange([...value, { label: "", price: 0 }]);
      } else {
        // Focus the first invalid tier
        const invalidIndex = value.findIndex(tier => 
          tier.label.trim() === '' || tier.price < 0
        );
        
        if (invalidIndex >= 0) {
          const tierElement = document.querySelector(
            `[data-tier-index="${invalidIndex}"] input`
          ) as HTMLInputElement;
          if (tierElement) tierElement.focus();
        }
      }
    };

    const handleRemoveTier = (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    };

    const updateTierLabel = (index: number, label: string) => {
      const updatedTiers = [...value];
      updatedTiers[index] = { ...updatedTiers[index], label };
      onChange(updatedTiers);
    };

    const updateTierPrice = (index: number, priceStr: string) => {
      // Parse the price, defaulting to 0 if invalid
      const price = parseFloat(priceStr) || 0;
      const updatedTiers = [...value];
      updatedTiers[index] = { ...updatedTiers[index], price };
      onChange(updatedTiers);
    };

    // Function to check if a tier is valid (has both label and price)
    const isTierValid = (tier: PriceTier) => 
      tier.label.trim() !== '' && tier.price >= 0;

    // Function to check if the "Add Tier" button should be enabled
    const canAddTier = value.every(isTierValid);

    return (
      <div ref={ref} className="space-y-4" {...props}>
        {value.map((tier, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3"
            data-tier-index={index}
          >
            <div className="flex-1">
              <Input
                placeholder={`Tier ${index + 1} name (e.g. Presale, Regular, VIP)`}
                value={tier.label}
                onChange={(e) => updateTierLabel(index, e.target.value)}
                disabled={disabled}
                className={`w-full ${!tier.label.trim() ? 'border-red-300' : ''}`}
              />
            </div>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={tier.price === 0 ? "" : tier.price.toString()}
                onChange={(e) => updateTierPrice(index, e.target.value)}
                disabled={disabled}
                className={`pl-7 w-full ${tier.price < 0 ? 'border-red-300' : ''}`}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveTier(index)}
              disabled={disabled || value.length <= 1}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Remove tier</span>
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddTier}
          disabled={disabled || !canAddTier}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Price Tier
        </Button>
        
        {!canAddTier && (
          <p className="text-xs text-red-400 mt-1">
            Please complete the existing tier information before adding another.
          </p>
        )}
      </div>
    );
  }
); 