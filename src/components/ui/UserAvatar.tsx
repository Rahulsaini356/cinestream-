"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  iconClassName?: string;
}

export default function UserAvatar({
  src,
  alt = "",
  className = "w-full h-full object-cover",
  iconClassName = "w-1/2 h-1/2 text-zinc-400",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError || typeof src !== "string" || src.trim() === "") {
    return <User className={iconClassName} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
