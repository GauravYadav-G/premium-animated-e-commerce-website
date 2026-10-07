export type RazorpayResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayOptions = { key: string; amount: number; currency: string; name: string; order_id: string; prefill: { name: string; email: string; contact: string }; theme: { color: string }; handler: (response: RazorpayResult) => void; modal: { ondismiss: () => void } };
type RazorpayInstance = { open: () => void; on: (event: "payment.failed", callback: () => void) => void };
declare global { interface Window { Razorpay?: new (options: RazorpayOptions) => RazorpayInstance } }
let loading: Promise<void> | undefined;
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.async = true;
    const timeout = window.setTimeout(() => { script.remove(); reject(new Error("Payment window could not load. Check your connection and retry.")); }, 20000);
    script.onload = () => { clearTimeout(timeout); if (window.Razorpay) resolve(); else reject(new Error("Payment window unavailable.")); };
    script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error("Payment window could not load. Please retry.")); };
    document.head.appendChild(script);
  }).catch(error => { loading = undefined; throw error; });
  return loading;
}
