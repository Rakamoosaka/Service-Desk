import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020202] text-white">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <p className="font-satoshi text-[1.15rem] font-medium tracking-[-0.03em] text-white/92 sm:text-[1.45rem]">
            Page Not Found
          </p>

          <div className="relative mt-3 sm:mt-5">
            <p className="font-satoshi bg-[linear-gradient(0deg,#0d0d0d_0%,#3d3d3d_100%)] bg-clip-text text-[clamp(6.75rem,24vw,13rem)] leading-none font-medium tracking-[0.02em] text-transparent select-none sm:text-[clamp(7.5rem,22vw,14rem)]">
              404
            </p>
          </div>

          <p className="mt-1 max-w-xl px-6 font-sans text-[0.98rem] leading-6 text-white/56 sm:text-[1.08rem] sm:leading-7">
            We can’t find the page you’re looking for.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-[#17d9f4] px-8 font-sans text-[0.95rem] font-medium text-[#171717] shadow-[0_12px_32px_rgba(23,217,244,0.22)] transition duration-150 ease-out hover:-translate-y-0.5 hover:brightness-110"
          >
            <span className="text-[#171717]">Back to Home</span>
            <ArrowUpRight
              aria-hidden="true"
              className="ml-3 size-[1.05rem] shrink-0 text-[#171717]"
              strokeWidth={2.6}
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
