import React, { useState } from "react";
import { Film } from "lucide-react";
import { photoUrl, fallbackPhotoUrl } from "./catalog";
export default function Artwork({ title, kind = "poster", priority = false }) {
  const primary = photoUrl(title, kind);
  const fallback = fallbackPhotoUrl(title);
  const [failed, setFailed] = useState([]);
  const src = [primary, fallback].find((url) => url && !failed.includes(url));
  const available = Boolean(src);
  return (
    <span
      className={`artwork artwork-${kind} ${available ? "" : "unavailable"}`}
    >
      {available ? (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          onError={() => setFailed((urls) => [...urls, src])}
        />
      ) : (
        <span className="missing-art">
          <Film size={26} />
          <span>{title.name}</span>
        </span>
      )}
    </span>
  );
}
