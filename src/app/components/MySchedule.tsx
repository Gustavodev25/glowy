"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ScheduleItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Category {
  id: string;
  label: string;
  color: string;
  count: number;
}

export default function MySchedule() {
  const [scheduleExpanded, setScheduleExpanded] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { id: "1", label: "Schedule Meeting", checked: false },
    { id: "2", label: "Project Review", checked: false },
    { id: "3", label: "Online Meeting", checked: false },
    { id: "4", label: "Recess Break", checked: false },
    { id: "5", label: "Coffee Date", checked: false },
    { id: "6", label: "Other", checked: false },
  ]);

  const [categories] = useState<Category[]>([
    { id: "1", label: "Work", color: "#F97316", count: 18 },
    { id: "2", label: "Myself", color: "#6366F1", count: 12 },
    { id: "3", label: "Breaks", color: "#DC2626", count: 14 },
  ]);

  const toggleScheduleItem = (id: string) => {
    setScheduleItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <div className="w-64 border-r border-gray-200 bg-white px-4 py-4">
      {/* My Schedule Section */}
      <div className="mb-6">
        <button
          onClick={() => setScheduleExpanded(!scheduleExpanded)}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900 hover:text-gray-700"
        >
          <span>My Schedule</span>
          {scheduleExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {scheduleExpanded && (
          <div className="space-y-2">
            {scheduleItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleScheduleItem(item.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div>
        <button
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900 hover:text-gray-700"
        >
          <span>Categories</span>
          {categoriesExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {categoriesExpanded && (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {category.label}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
