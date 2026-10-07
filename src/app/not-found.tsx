import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1500px] flex-col items-center justify-center gap-6 px-5 text-center md:px-10">
      <p className="label-xs text-mist">Error 404</p>
      <h1 className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.9]">
        This rail is empty
      </h1>
      <p className="max-w-md text-[15px] leading-relaxed text-ink-soft">
        The piece you were looking for has either sold through or never existed. The rest of the
        collection is waiting.
      </p>
      <Link
        href="/shop"
        className="btn-sweep btn-sweep-light mt-2 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-bone transition-colors duration-500 hover:text-ink"
      >
        <span className="label-xs">Back to the collection</span>
      </Link>
    </div>
  );
}
