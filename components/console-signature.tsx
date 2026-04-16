"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __dosSignatureLogged?: boolean;
  }
}

export function ConsoleSignature() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__dosSignatureLogged) return;

    window.__dosSignatureLogged = true;
    console.log(
      "%cDeveloped by @xzedm",
      "color:#b91c1c;font-weight:700;font-size:14px;padding:4px 8px;border:1px solid #fecaca;border-radius:6px;background:#fef2f2;"
    );
  }, []);

  return null;
}
