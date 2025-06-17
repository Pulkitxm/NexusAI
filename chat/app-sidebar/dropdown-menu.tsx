"use client";

import { useEffect, useRef } from "react";

import type { LucideIcon } from "lucide-react";

interface DropdownItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  onClose: () => void;
  className?: string;
}

export function DropdownMenu({ items, onClose, className = "" }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className={`min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
            item.destructive ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
