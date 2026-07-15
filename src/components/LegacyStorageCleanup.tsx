"use client";

import { useEffect } from "react";

export default function LegacyStorageCleanup() {
  useEffect(() => {
    Object.keys(window.localStorage)
      .filter((chave) => chave.startsWith("ph10:"))
      .forEach((chave) => window.localStorage.removeItem(chave));
  }, []);

  return null;
}
