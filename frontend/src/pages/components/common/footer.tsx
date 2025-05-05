import React from "react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  console.log('Rendering Footer component');

  return (
    <footer className="primary-bg text-gray-200 py-10 px-6 md:px-20 mt-[30px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-base">
        {/* Branding */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-3">
            <img className="h-10 w-auto" src="/Logo.png" alt="NutriGen Bot" />
            <span className="text-2xl font-bold">NutriGen Bot</span>
          </Link>
          <p className="text-base opacity-80">Your Daily Diet Assistant</p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-base font-semibold uppercase mb-4">Navigation</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="flex items-center gap-2 transition-all duration-300 hover:opacity-100 opacity-80 hover:translate-x-1">🏠 Home</Link></li>
            <li><Link href="/recipes" className="flex items-center gap-2 transition-all duration-300 hover:opacity-100 opacity-80 hover:translate-x-1">🍽️ Recipes</Link></li>
            <li><Link href="/blog" className="flex items-center gap-2 transition-all duration-300 hover:opacity-100 opacity-80 hover:translate-x-1">✍️ Blog</Link></li>
            <li><Link href="/about" className="flex items-center gap-2 transition-all duration-300 hover:opacity-100 opacity-80 hover:translate-x-1">ℹ️ About</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-base font-semibold uppercase mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><Link href="/terms" className="flex items-center gap-2 transition-all duration-300 hover:opacity-100 opacity-80 hover:translate-x-1">📜 Terms of Service</Link></li>
            <li><Link href="/privacy" className="flex items-center gap-2 transition-all duration-300 hover:opacity-100 opacity-80 hover:translate-x-1">🔒 Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-white pt-6 text-center text-base text-white">
        <p>&copy; {currentYear} NutriGen Bot. All rights reserved. This website is for educational purposes only.</p>
      </div>
    </footer>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default Footer;