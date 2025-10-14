"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/ui/Custom/Logo";
import SearchInput from "@/components/ui/Custom/SearchInput";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DropdownMenu from "./DropdownMenu";
import { ChevronDown } from "lucide-react";
import KlookDropdown from "@/components/feature/KlookDropdown/KlookDropdown";
import { MobileKlookDropdown } from "@/components/feature/KlookDropdown/KlookDropdown";

const dropdownItems = {
  exploreTrektoo: [
    { href: "/hotels-list", label: "Hotels", key: "hotels-main" },
    { href: "/tours", label: "Tours & Experiences", key: "tours-main" },
    {
      href: "/attractions",
      label: "Attraction Tickets",
      key: "attractions-main",
    },
    { href: "/transport", label: "Transport", key: "transport-main" },
    { href: "/car-rentals", label: "Car Rentals", key: "cars-main" },
  ],
};

// Desktop Explore TrekToo Dropdown
const ExploreDropdown = ({ items }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm md:text-base uppercase tracking-wide py-2 px-3 focus:outline-none">
        Explore TrekToo <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [topOffset, setTopOffset] = useState("top-10");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout, isAuthenticated, authSuccess, authError, clearMessages } =
    useAuth();
  const router = useRouter();

  // Keep navbar always at top-10 to stick with topbar
  useEffect(() => {
    setTopOffset("top-10");
  }, []);

  // Clear messages when profile dropdown closes
  useEffect(() => {
    if (!isProfileOpen) clearMessages();
  }, [isProfileOpen, clearMessages]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed in Navbar:", error.message);
    } finally {
      setIsProfileOpen(false);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav
      className={`fixed ${topOffset} z-40 w-full bg-white border-b border-gray-200 transition-all duration-300 font-montserrat shadow-lg`}
      aria-label="Main navigation"
    >
      {(authSuccess || authError) && (
        <div
          className={`absolute top-full left-0 right-0 z-30 ${authSuccess ? "bg-green-500" : "bg-red-500"
            } text-white text-center py-1`}
        >
          {authSuccess || authError}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
        <div className="flex h-12 items-center justify-between md:h-14 lg:h-16">
          {/* Logo */}
          <div className="flex-shrink-0 scale-100 md:scale-110 lg:scale-125">
            <Logo />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 md:gap-3">
            {/* Desktop Menu */}
            {/* <div className="hidden lg:flex items-center space-x-2">
              <ExploreDropdown items={dropdownItems.exploreTrektoo} />
              <span className="h-6 border-l border-gray-300 mx-2"></span>
            </div> */}

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-2">
              <KlookDropdown />
              <span className="h-6 border-l border-gray-300 mx-2"></span>
            </div>

            {/* Mobile Menu - Add this in your mobile menu section */}
            <div className="lg:hidden">
              <MobileKlookDropdown />
            </div>

            {/* Search */}
            <div className="hidden sm:block">
              <SearchInput />
            </div>

            {/* Profile */}
            <div className="relative">
              {/* Profile Button */}
              <button
                onClick={() => !isLoggingOut && setIsProfileOpen(!isProfileOpen)}
                disabled={isLoggingOut}
                className="p-1.5 rounded-full text-gray-800 hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Profile menu"
              >
                {user && (
                  <span className="text-sm font-medium">
                    {user.first_name}
                  </span>
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-xl py-2 z-10 border border-blue-100">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.display_name || "Welcome"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      {/* Profile link hidden - API not ready */}
                      {/* <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-900 hover:bg-blue-100 hover:text-gray-900"
                      >
                        Profile
                      </Link> */}
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-blue-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-900 hover:bg-blue-100 hover:text-gray-900"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-3 py-2 text-sm text-gray-900 hover:bg-blue-100 hover:text-gray-900"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-1.5 text-gray-800 hover:text-blue-600 transition-colors z-30 relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-4 w-4 md:h-5 md:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden bg-white border border-gray-200 rounded-lg shadow-lg fixed left-0 right-0 max-h-[calc(100vh-5.5rem)] overflow-y-auto z-20"
            style={{ top: "5.5rem" }}
          >
            <div className="px-3 py-4 space-y-3">
              <div className="sm:hidden mb-3">
                <SearchInput />
              </div>

              <DropdownMenu
                title="Explore TrekToo"
                items={dropdownItems.exploreTrektoo}
                onItemClick={() => setIsMobileMenuOpen(false)}
              />

              <div className="pt-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    {/* Profile link hidden - API not ready */}
                    {/* <Link
                      href="/profile"
                      className="block text-gray-800 hover:text-blue-600 font-medium text-sm uppercase tracking-wide py-1.5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="block w-full text-left text-gray-800 hover:text-blue-600 font-medium text-sm uppercase tracking-wide py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block text-gray-800 hover:text-blue-600 font-medium text-sm uppercase tracking-wide py-1.5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block text-gray-800 hover:text-blue-600 font-medium text-sm uppercase tracking-wide py-1.5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
