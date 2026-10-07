"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function NewsletterEmailField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  // Email extensions modify server-rendered inputs before React can hydrate them.
  // Use the same non-input placeholder on the server and first hydration pass.
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  if (!hydrated) return <span aria-hidden="true" className="block h-[23px] w-full" />;
  return <input aria-label="Email address for newsletter" name="newsletterEmail" type="email" autoComplete="email" required value={value} onChange={event => onChange(event.target.value)} placeholder="your@email.com" className="w-full bg-transparent text-[15px] text-bone placeholder:text-bone/30 focus:outline-none" />;
}
