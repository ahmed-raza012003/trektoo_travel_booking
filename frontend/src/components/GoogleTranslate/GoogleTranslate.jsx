'use client';

import { useEffect, useState } from 'react';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

const GoogleTranslate = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Language options - only the 5 you requested
    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    ];

    useEffect(() => {
        // Check for URL parameters first, then saved language preference
        const urlParams = new URLSearchParams(window.location.search);
        const urlLanguage = urlParams.get('hl') || urlParams.get('tl');
        const savedLanguage = localStorage.getItem('google-translate-language');
        const targetLanguage = urlLanguage || savedLanguage;

        if (targetLanguage && targetLanguage !== 'en') {
            console.log('Found language preference:', targetLanguage, 'from', urlLanguage ? 'URL' : 'localStorage');
            document.documentElement.lang = targetLanguage;
            if (targetLanguage === 'ar') {
                document.documentElement.dir = 'rtl';
            } else {
                document.documentElement.dir = 'ltr';
            }

            // Save URL language to localStorage if it's different
            if (urlLanguage && urlLanguage !== savedLanguage) {
                localStorage.setItem('google-translate-language', urlLanguage);
            }
        }

        // Load Google Translate script
        const loadGoogleTranslate = () => {
            if (document.getElementById('google-translate-script')) return;

            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        };

        // Initialize Google Translate
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'en,ar,es,ru,de',
                    autoDisplay: false
                },
                'google_translate_element'
            );

            // Small delay to let widget render
            setTimeout(() => {
                const lang = localStorage.getItem('google-translate-language') || 'en';
                const select = document.querySelector('.goog-te-combo');
                if (select) {
                    select.value = lang;
                    select.dispatchEvent(new Event('change'));
                }
            }, 1000);
        };


        loadGoogleTranslate();

         // Add immediate script to handle URL parameters and hide Google Translate banner
         const immediateScript = document.createElement('script');
         immediateScript.textContent = `
       // Check for URL parameters and apply immediately
       (function() {
         const urlParams = new URLSearchParams(window.location.search);
         const urlLanguage = urlParams.get('hl') || urlParams.get('tl');
         
         if (urlLanguage && urlLanguage !== 'en') {
           console.log('Immediate URL language detection:', urlLanguage);
           document.documentElement.lang = urlLanguage;
           if (urlLanguage === 'ar') {
             document.documentElement.dir = 'rtl';
           } else {
             document.documentElement.dir = 'ltr';
           }
           
           // Save to localStorage
           localStorage.setItem('google-translate-language', urlLanguage);
         }
         
         // Hide Google Translate banner immediately
         function hideGoogleTranslateBanner() {
           const banner = document.querySelector('.goog-te-banner-frame');
           if (banner) {
             banner.style.display = 'none';
             banner.style.visibility = 'hidden';
             banner.style.height = '0';
             banner.style.width = '0';
             banner.style.position = 'absolute';
             banner.style.top = '-9999px';
             banner.style.left = '-9999px';
             banner.style.zIndex = '-9999';
             banner.style.opacity = '0';
           }
         }
         
         // Hide banner immediately and on DOM changes
         hideGoogleTranslateBanner();
         document.addEventListener('DOMContentLoaded', hideGoogleTranslateBanner);
         
         // Watch for Google Translate banner and hide it
         const observer = new MutationObserver(function(mutations) {
           mutations.forEach(function(mutation) {
             if (mutation.type === 'childList') {
               hideGoogleTranslateBanner();
             }
           });
         });
         
         observer.observe(document.body, {
           childList: true,
           subtree: true
         });
       })();
     `;
         document.head.appendChild(immediateScript);

        return () => {
            delete window.googleTranslateElementInit;
        };
    }, []);

    const changeLanguage = (langCode) => {
        // Save language preference
        localStorage.setItem('google-translate-language', langCode);

        // Set page language and direction
        document.documentElement.lang = langCode;
        if (langCode === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }

        // Try to use Google Translate select element
        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement) {
            selectElement.value = langCode;
            selectElement.dispatchEvent(new Event('change'));
        } else {
            // Fallback: Try to force translation without reloading
            console.log('Google Translate select not found, trying alternative method...');
            if (window.google?.translate) {
                try {
                    // Force translation by changing the page language
                    document.documentElement.lang = langCode;

                    // Trigger Google Translate to detect the language change
                    const event = new Event('languagechange');
                    document.dispatchEvent(event);

                    console.log('Triggered language change event');
                } catch (error) {
                    console.error('Error triggering translation:', error);
                }
            }
        }

        setIsOpen(false);
    };

    const getCurrentLanguage = () => {
        const savedLanguage = localStorage.getItem('google-translate-language');
        if (savedLanguage) {
            return languages.find(lang => lang.code === savedLanguage) || languages[0];
        }
        return languages[0];
    };

    const currentLang = getCurrentLanguage();

    return (
        <div className="relative">
            {/* Hidden Google Translate Element */}
            <div id="google_translate_element" className="hidden"></div>

            {/* Custom Language Selector */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 text-white hover:text-blue-400 transition-colors whitespace-nowrap"
                    aria-label="Select Language"
                >
                    <FaGlobe className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{currentLang.flag}</span>
                    <span className="hidden md:inline">{currentLang.name}</span>
                    <FaChevronDown className={`w-2.5 h-2.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white text-gray-900 rounded-lg shadow-lg py-2 min-w-[160px] border border-gray-200 z-50">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center gap-2 ${currentLang.code === lang.code ? 'bg-blue-100 text-blue-600 font-semibold' : ''
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-sm">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

             {/* Custom CSS to hide Google Translate UI */}
             <style jsx global>{`
         /* Hide Google Translate banner completely */
         .goog-te-banner-frame,
         .goog-te-banner-frame.skiptranslate,
         .goog-te-ftab-frame,
         .goog-te-combo,
         .goog-te-banner-frame.skiptranslate {
             display: none !important;
             visibility: hidden !important;
             height: 0 !important;
             width: 0 !important;
             position: absolute !important;
             top: -9999px !important;
             left: -9999px !important;
         }
         
         /* Remove Google Translate margin and padding */
         body {
             top: 0 !important;
             margin-top: 0 !important;
             padding-top: 0 !important;
         }
         
         /* Prevent Google Translate from adding unwanted styles */
         body.goog-te-fading {
             margin-top: 0 !important;
             padding-top: 0 !important;
         }
         
         /* Hide Google Translate iframe completely */
         .goog-te-ftab-frame {
             display: none !important;
             visibility: hidden !important;
             height: 0 !important;
             width: 0 !important;
             position: absolute !important;
             top: -9999px !important;
             left: -9999px !important;
         }
         
         /* Hide original Google Translate widget */
         #google_translate_element {
             display: none !important;
         }
         
         /* Style for translated text */
         .goog-te-translated {
             font-family: inherit !important;
         }
         
         /* RTL support for Arabic */
         html[dir="rtl"] {
             direction: rtl;
             text-align: right;
         }
         
         html[dir="rtl"] body {
             direction: rtl;
         }
         
         /* Specific language direction fixes */
         html[lang="ar"],
         html[lang="ar"] * {
             direction: rtl !important;
             text-align: right !important;
         }
         
         /* Additional hiding for Google Translate elements */
         .goog-te-banner-frame,
         .goog-te-banner-frame.skiptranslate,
         .goog-te-ftab-frame,
         .goog-te-combo {
             display: none !important;
             visibility: hidden !important;
             opacity: 0 !important;
             height: 0 !important;
             width: 0 !important;
             position: absolute !important;
             top: -9999px !important;
             left: -9999px !important;
             z-index: -9999 !important;
         }
         `}</style>
        </div>
    );
};

export default GoogleTranslate;
