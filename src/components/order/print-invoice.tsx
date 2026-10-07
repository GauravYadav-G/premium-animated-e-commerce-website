"use client";
export function PrintInvoice() {
  return <button type="button" onClick={() => window.print()} className="invoice-actions rounded-full bg-ink px-6 py-3 text-sm text-bone">Print / save as PDF</button>;
}
