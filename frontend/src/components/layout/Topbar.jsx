'use client';

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';
import GoogleTranslate from '@/components/GoogleTranslate/GoogleTranslate';

function Topbar() {
  return (
    <header
      className="fixed top-0 left-0 bg-gray-900 text-white h-10 flex items-center w-full z-[1000]"
      aria-label="Topbar"
    >
      <div className="container mx-auto px-2 sm:px-4 flex flex-wrap justify-between items-center text-[10px] xs:text-xs md:text-sm">
        {/* Left Side: Phone and Email (hidden on small screens) */}
        <div className="hidden sm:flex flex-row gap-3 md:gap-4 flex-wrap md:pt-1">
          <a
            href="tel:01063425677"
            className="flex items-center whitespace-nowrap hover:text-blue-400 transition-colors"
          >
            <FaPhone className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
            0106 342 5677
          </a>
          <a
            href="mailto:info@trektoo.com"
            className="flex items-center whitespace-nowrap hover:text-blue-400 transition-colors"
          >
            <FaEnvelope className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
            info@trektoo.com
          </a>
        </div>

        {/* Right Side: Links, Language, Cart, and Social Icons */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 ml-auto sm:ml-0 flex-wrap">
          <Link
            href="/about"
            className="text-white hover:text-blue-400 transition-colors whitespace-nowrap"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-white hover:text-blue-400 transition-colors whitespace-nowrap"
          >
            Contact
          </Link>
          
          {/* Google Translate Language Selector */}
          <GoogleTranslate />

          <div className="hidden sm:flex gap-2 md:gap-3">
            <a
              href="https://www.facebook.com/trektoo2000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebookF className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/trek_too?igsh=MTJ5NmY2YmI2OXdtOQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.tiktok.com/@trektoo?_t=ZS-8yK2lqloH4r&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
              aria-label="TikTok"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525 3.025C13.116 3.025 13.7 3.025 14.291 3.025C14.434 4.262 14.92 5.437 15.716 6.363C16.511 7.29 17.577 7.925 18.768 8.184C18.768 9.25 18.768 10.316 18.768 11.382C17.768 11.382 16.768 11.157 15.85 10.725C15.29 10.485 14.768 10.184 14.291 9.825C14.291 12.075 14.291 14.325 14.291 16.575C14.291 17.508 14.025 18.425 13.525 19.225C12.791 20.425 11.658 21.359 10.291 21.825C9.291 22.175 8.225 22.225 7.191 21.975C6.025 21.675 4.975 20.975 4.225 19.975C3.475 18.975 3.075 17.725 3.075 16.425C3.075 15.225 3.425 14.075 4.075 13.125C4.725 12.175 5.675 11.475 6.775 11.125C7.875 10.775 9.075 10.825 10.125 11.275C10.125 12.325 10.125 13.375 10.125 14.425C9.525 14.125 8.825 14.025 8.175 14.175C7.525 14.325 6.975 14.725 6.625 15.275C6.275 15.825 6.175 16.525 6.375 17.175C6.575 17.825 7.025 18.375 7.625 18.675C8.225 18.975 8.925 19.025 9.575 18.825C10.225 18.625 10.775 18.175 11.075 17.575C11.175 17.375 11.225 17.175 11.225 16.975C11.225 14.475 11.225 11.975 11.225 9.475C11.225 7.975 11.225 6.475 11.225 4.975C11.658 4.975 12.091 4.975 12.525 4.975C12.525 4.325 12.525 3.675 12.525 3.025Z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@TrekToo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;