import React from 'react';
import PropTypes from 'prop-types';

const SocialIcon = ({ type }) => {
  const socialLinks = {
    facebook: 'https://www.facebook.com/trektoo2000',
    instagram: 'https://www.instagram.com/trek_too?igsh=MTJ5NmY2YmI2OXdtOQ==',
    tiktok: 'https://www.tiktok.com/@trektoo?_t=ZS-8yK2lqloH4r&_r=1',
    youtube: 'https://www.youtube.com/@trektoo',
    linkedin: 'https://www.linkedin.com/company/trektoo',
  };

  const icons = {
    facebook: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
    instagram: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
      </svg>
    ),
    tiktok: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12.525 3.025C13.116 3.025 13.7 3.025 14.291 3.025C14.434 4.262 14.92 5.437 15.716 6.363C16.511 7.29 17.577 7.925 18.768 8.184C18.768 9.25 18.768 10.316 18.768 11.382C17.768 11.382 16.768 11.157 15.85 10.725C15.29 10.485 14.768 10.184 14.291 9.825C14.291 12.075 14.291 14.325 14.291 16.575C14.291 17.508 14.025 18.425 13.525 19.225C12.791 20.425 11.658 21.359 10.291 21.825C9.291 22.175 8.225 22.225 7.191 21.975C6.025 21.675 4.975 20.975 4.225 19.975C3.475 18.975 3.075 17.725 3.075 16.425C3.075 15.225 3.425 14.075 4.075 13.125C4.725 12.175 5.675 11.475 6.775 11.125C7.875 10.775 9.075 10.825 10.125 11.275C10.125 12.325 10.125 13.375 10.125 14.425C9.525 14.125 8.825 14.025 8.175 14.175C7.525 14.325 6.975 14.725 6.625 15.275C6.275 15.825 6.175 16.525 6.375 17.175C6.575 17.825 7.025 18.375 7.625 18.675C8.225 18.975 8.925 19.025 9.575 18.825C10.225 18.625 10.775 18.175 11.075 17.575C11.175 17.375 11.225 17.175 11.225 16.975C11.225 14.475 11.225 11.975 11.225 9.475C11.225 7.975 11.225 6.475 11.225 4.975C11.658 4.975 12.091 4.975 12.525 4.975C12.525 4.325 12.525 3.675 12.525 3.025Z" />
      </svg>
    ),
    youtube: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    linkedin: (
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  };

  return (
    <a
      href={socialLinks[type]}
      target="_blank"
      rel="noopener noreferrer"
      className="mr-3 hover:opacity-75 transition-opacity duration-200"
      aria-label={`Follow us on ${type}`}
    >
      {icons[type]}
    </a>
  );
};

SocialIcon.propTypes = {
  type: PropTypes.oneOf(['facebook', 'instagram', 'tiktok', 'youtube', 'linkedin']).isRequired,
};

const ContactIcon = ({ type }) => {
  const icons = {
    phone: (
              <svg
          className="w-4 h-4 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
    ),
    email: (
              <svg
          className="w-4 h-4 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
    ),
    address: (
              <svg
          className="w-4 h-4 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
    ),
  };

  return <span className="mr-2">{icons[type]}</span>;
};

ContactIcon.propTypes = {
  type: PropTypes.oneOf(['phone', 'email', 'address']).isRequired,
};

export { SocialIcon, ContactIcon };
