import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex flex-col gap-8 px-5 py-10 text-center border-t border-primary/20 mt-16 bg-black">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <Link className="text-sm font-normal leading-normal text-white/60 hover:text-primary transition-colors" href="/about">
          About Us
        </Link>
        <Link className="text-sm font-normal leading-normal text-white/60 hover:text-primary transition-colors" href="/contact">
          Contact
        </Link>
        <Link className="text-sm font-normal leading-normal text-white/60 hover:text-primary transition-colors" href="/privacy">
          Privacy Policy
        </Link>
        <Link className="text-sm font-normal leading-normal text-white/60 hover:text-primary transition-colors" href="/terms">
          Terms of Service
        </Link>
      </div>
      <p className="text-sm font-normal leading-normal text-white/60">
        © 2024 Cipher Suite Inc. All rights reserved.
      </p>
    </footer>
  );
}
