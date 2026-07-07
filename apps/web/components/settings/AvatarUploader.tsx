"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

export function AvatarUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Libère l'URL objet précédente pour éviter une fuite mémoire.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  return (
    <div className="flex items-center gap-4">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu local d'un fichier choisi, pas une ressource distante
        <img
          src={previewUrl}
          alt="Aperçu de ta photo de profil"
          className="h-14 w-14 rounded-full object-cover"
        />
      ) : (
        <span
          className="grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)]/20 text-sm font-medium text-[var(--accent)]"
          aria-hidden="true"
        >
          RA
        </span>
      )}
      <div>
        <Button type="button" variant="soft" size="sm" onClick={() => inputRef.current?.click()}>
          Changer la photo
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Choisir une nouvelle photo de profil"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
