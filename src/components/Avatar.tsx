"use client";

import { getAvatarColor, getInitials } from "@/utils/avatarColors";

interface AvatarProps {
  name: string;
  id: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
  "2xl": "w-24 h-24 text-3xl",
};

export default function Avatar({
  name,
  id,
  imageUrl,
  size = "md",
  className = "",
}: AvatarProps) {
  const color = getAvatarColor(id);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold ${className}`}
      style={{
        backgroundColor: color.bg,
      }}
    >
      <span
        style={{
          color: color.text,
        }}
      >
        {getInitials(name)}
      </span>
    </div>
  );
}
