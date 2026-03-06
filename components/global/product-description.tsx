"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Clean description and split into words
  const words = description.trim().split(/\s+/);
  const isLong = words.length > 50;

  const displayDescription =
    isExpanded || !isLong ? description : words.slice(0, 50).join(" ") + "...";

  return (
    <div className="mt-10 flex flex-col gap-4">
      <Separator />
      <h2 className="text-lg font-bold text-foreground">Product Description</h2>
      <div className="relative">
        <p
          className={cn(
            "text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed transition-all duration-300",
            !isExpanded && isLong && "max-h-[120px] overflow-hidden",
          )}
        >
          {displayDescription}
        </p>
        {!isExpanded && isLong && (
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-primary hover:text-primary hover:bg-transparent p-0 flex items-center gap-1 font-bold transition-transform active:scale-95"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="size-4 animate-bounce" />
            </>
          ) : (
            <>
              Read More <ChevronDown className="size-4 animate-bounce" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
