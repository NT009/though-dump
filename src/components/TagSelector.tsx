"use client";

import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";

interface TagSelectorProps {
  tags: string[];
  availableTags?: { _id: string; name: string }[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ tags, availableTags = [], onChange }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tagName: string) => {
    const formattedTag = tagName.trim().toLowerCase();
    if (formattedTag && !tags.includes(formattedTag)) {
      onChange([...tags, formattedTag]);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  // Filter available tags
  const filteredTags = availableTags
    .filter((t) => !tags.includes(t.name.toLowerCase()))
    .filter((t) => t.name.toLowerCase().includes(inputValue.trim().toLowerCase()));

  const hasExactMatch = availableTags.some(
    (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  return (
    <div className="w-full flex flex-col gap-3" ref={containerRef}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
            #{tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="+ Search or add tag (Enter)"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full h-12 bg-transparent border-dashed rounded-xl shadow-none focus-visible:ring-1"
        />
        
        {/* Simple Dropdown List */}
        {isOpen && (inputValue.trim() !== "" || availableTags.length > 0) && (
          <div className="absolute top-full left-0 mt-2 w-full z-50 bg-popover text-popover-foreground border rounded-xl shadow-lg max-h-60 overflow-y-auto p-1 flex flex-col">
            
            {/* Create new tag option */}
            {inputValue.trim() !== "" && !hasExactMatch && (
              <button
                type="button"
                onClick={() => addTag(inputValue)}
                className="w-full text-left px-3 py-2 text-sm text-primary font-medium hover:bg-muted rounded-md transition-colors"
              >
                + Create "{inputValue}"
              </button>
            )}

            {/* List existing tags */}
            {filteredTags.map((tag) => (
              <button
                type="button"
                key={tag._id}
                onClick={() => addTag(tag.name)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors flex items-center"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    tags.includes(tag.name.toLowerCase()) ? "opacity-100" : "opacity-0"
                  )}
                />
                {tag.name}
              </button>
            ))}

            {/* Empty state */}
            {inputValue.trim() === "" && filteredTags.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No tags found. Type to create one.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
