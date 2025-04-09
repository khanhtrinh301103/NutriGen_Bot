import React from "react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer py-10 border-t border-[#3a6442]">
      <div className="container grid grid-cols-3 gap-8">
        {/* Branding */}
        <div>
          <Link href="/" className="flex items-center">
            <img className="h-10 w-auto" src="/Logo.png" alt="NutriGen Bot" />
            <span className="ml-2 text-xl font-bold">NutriGen Bot</span>
          </Link>
          <p className="mt-2 text-sm text-gray-200">Your Daily Diet Assistant</p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase text-gray-200">Navigation</h3>
          <ul className="mt-4 space-y-3">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/recipes" className="hover:text-white">Recipes</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-sm font-semibold uppercase text-gray-200">Legal</h3>
          <ul className="mt-4 space-y-3">
            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-200">
        &copy; {currentYear} NutriGen Bot. All rights reserved and this website is only for educational purposes.
      </div>
    </footer>
  );
};

export default Footer;
