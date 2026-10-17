import React from "react";
import { artUrl, imageUrl } from "./catalog";
export default function Artwork({ title, kind = "poster", priority = false }) {
  const src = imageUrl(title, kind);
  return (
    <span
      className={`artwork artwork-${kind}`}
      style={{ backgroundImage: `url(${artUrl(title)})` }}
    >
      {src && (
        <img
          key={src}
          className="tmdb-image"
          src={src}
          alt=""
          aria-hidden="true"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          onLoad={(e) => {
            e.currentTarget.dataset.loaded = "true";
          }}
          onError={(e) => {
            e.currentTarget.hidden = true;
          }}
        />
      )}
    </span>
  );
}
