"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    ChevronDown,
    MapPin,
    Ticket,
    Car,
    Hotel,
    Ship,
    Train,
    Bus,
    Luggage,
    Utensils,
    Film,
    ShoppingBag,
    Plane,
    Wifi,
    Heart,
    Camera,
    Coffee,
    Mountain,
    Palette,
    Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import API_BASE from "@/lib/api/klookApi";
import categoriesCache from "@/lib/cache/categoriesCache";

// Icon mapping based on category names or IDs
const getCategoryIcon = (categoryName, categoryId) => {
    const name = categoryName.toLowerCase();

    if (name.includes('transport') || name.includes('mobility')) return Bus;
    if (name.includes('hotel') || name.includes('accommodation')) return Hotel;
    if (name.includes('car') || name.includes('rental')) return Car;
    if (name.includes('cruise') || name.includes('ship')) return Ship;
    if (name.includes('train') || name.includes('rail')) return Train;
    if (name.includes('attraction') || name.includes('ticket')) return Ticket;
    if (name.includes('tour') || name.includes('experience')) return MapPin;
    if (name.includes('food') || name.includes('dining')) return Utensils;
    if (name.includes('luggage') || name.includes('travel')) return Luggage;
    if (name.includes('entertainment') || name.includes('movie')) return Film;
    if (name.includes('shopping')) return ShoppingBag;
    if (name.includes('spa') || name.includes('beauty')) return Heart;
    if (name.includes('activity') || name.includes('sport')) return Zap;
    if (name.includes('culture') || name.includes('museum')) return Palette;
    if (name.includes('photo')) return Camera;
    if (name.includes('cafe')) return Coffee;
    if (name.includes('nature') || name.includes('park')) return Mountain;
    if (name.includes('other services') || name.includes('other')) return Wifi;

    return MapPin; // default icon
};

const KlookDropdown = () => {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const router = useRouter();

    // Fetch categories from database with caching
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                
                // Check cache first
                const cachedCategories = categoriesCache.getGlobalDropdownCategories();
                if (cachedCategories) {
                    console.log('📦 Using cached categories for global dropdown');
                    setCategories(cachedCategories);
                    setLoading(false);
                    return;
                }

                console.log('🌐 Fetching categories from API for global dropdown');
                const res = await fetch(`${API_BASE}/simple-categories`);
                const data = await res.json();

                if (data.success && data.data.categories) {
                    // Cache the raw categories first
                    categoriesCache.setRawCategories(data.data.categories);
                    
                    // Get filtered categories for global dropdown
                    const finalCategories = categoriesCache.getGlobalDropdownCategories();
                    setCategories(finalCategories);
                }
            } catch (error) {
                console.error("Error fetching categories from database:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryHover = (category) => {
        setActiveCategory(category);
    };

    const handleSubCategoryClick = (leafCategory, parentCategoryId) => {
        // Navigate to activities page with the leaf category ID (not parent)
        router.push(`/activities?category_id=${leafCategory.id}`);
        setOpen(false);
        setActiveCategory(null);
    };

    const handleSubCategoryMainClick = (subCategory, parentCategoryId) => {
        // Handle special "Other Services" subcategories
        if (subCategory.id === 'sim-cards') {
            handleSimCardClick();
            return;
        }
        if (subCategory.id === 'wifi') {
            handleWifiClick();
            return;
        }
        
        // Navigate to activities page with the sub category ID
        router.push(`/activities?category_id=${subCategory.id}`);
        setOpen(false);
        setActiveCategory(null);
    };

    const handleMainCategoryClick = (category, event) => {
        // Prevent event bubbling
        event?.stopPropagation();
        
        console.log('🔍 DEBUG - handleMainCategoryClick called with category:', category);
        
        // Always navigate to activities page with the main category ID
        router.push(`/activities?category_id=${category.id}`);
        setOpen(false);
        setActiveCategory(null);
    };

    const handleSimCardClick = () => {
        setOpen(false);
        router.push(`/activities?search=sim+card`);
    };

    const handleWifiClick = () => {
        setOpen(false);
        router.push(`/activities?search=wifi`);
    };

    const handleCategoryHoverOnly = (category) => {
        // Only set active category for hover, don't navigate
        setActiveCategory(category);
    };

    const toggleDropdown = () => {
        setOpen(!open);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative font-sans hidden lg:block">
            {/* Button */}
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                onMouseEnter={() => setOpen(true)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm py-2 px-3 focus:outline-none"
            >
                Explore Trektoo <ChevronDown size={16} />
            </button>

            {/* Dropdown menu */}
            {open && (
                <div
                    ref={dropdownRef}
                    className="fixed top-[110px] left-0 right-0 mx-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-[900px] max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="p-4">
                            {/* Grid Layout for Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categories.map((category) => {
                                    const IconComponent = getCategoryIcon(category.name, category.id);
                                    
                                    return (
                                        <div key={category.id} className="space-y-3">
                                            {/* Main Category Header */}
                                            <button
                                                onClick={() => handleMainCategoryClick(category)}
                                                className="w-full flex items-center gap-2 pb-1 border-b border-gray-100 hover:bg-blue-50 rounded-md px-2 py-1 transition-colors"
                                            >
                                                <div className="p-1.5 bg-blue-50 rounded-md">
                                                    <IconComponent size={18} className="text-blue-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-800 hover:text-blue-600">
                                                    {category.name}
                                                </h3>
                                            </button>
                                            
                                            {/* Sub Categories List */}
                                            <div className="space-y-1">
                                                {category.sub_category && category.sub_category.length > 0 ? (
                                                    category.sub_category.map((subCategory) => (
                                                        <button
                                                            key={subCategory.id}
                                                            onClick={() => handleSubCategoryMainClick(subCategory, category.id)}
                                                            className="w-full text-left text-xs text-gray-800 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors block font-medium"
                                                        >
                                                            {subCategory.name}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic">No subcategories</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Mobile version for responsive design
export const MobileKlookDropdown = () => {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/simple-categories`);
                const data = await res.json();

                if (data.success && data.data.categories) {
                    // Filter out only Cruise and Hotel categories for global dropdown
                    const filteredCategories = data.data.categories.filter(category => {
                        const categoryName = category.name.toLowerCase();
                        return !categoryName.includes('cruise') && !categoryName.includes('hotel');
                    });
                    
                    // Add "Other Services" category at the end
                    const otherServicesCategory = {
                        id: 'other-services',
                        name: 'Other Services',
                        sub_category: [
                            { id: 'sim-cards', name: 'SIM Cards' },
                            { id: 'wifi', name: 'WiFi' }
                        ]
                    };
                    
                    setCategories([...filteredCategories, otherServicesCategory]);
                }
            } catch (error) {
                console.error("Error fetching categories from database:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const toggleCategory = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleSubCategoryClick = (leafCategory, parentCategoryId) => {
        router.push(`/activities?category_id=${leafCategory.id}`);
        setOpen(false);
        setExpandedCategories(new Set());
    };

    const handleSubCategoryMainClick = (subCategory, parentCategoryId) => {
        // Handle special "Other Services" subcategories
        if (subCategory.id === 'sim-cards') {
            handleSimCardClick();
            return;
        }
        if (subCategory.id === 'wifi') {
            handleWifiClick();
            return;
        }
        
        // Navigate to activities page with the sub category ID
        router.push(`/activities?category_id=${subCategory.id}`);
        setOpen(false);
        setExpandedCategories(new Set());
    };

    const handleMainCategoryClick = (category, event) => {
        // Prevent event bubbling
        event?.stopPropagation();
        
        // Always navigate to activities page with the main category ID
        router.push(`/activities?category_id=${category.id}`);
        setOpen(false);
        setExpandedCategories(new Set());
    };

    const handleSimCardClick = () => {
        setOpen(false);
        router.push(`/activities?search=sim+card`);
    };

    const handleWifiClick = () => {
        setOpen(false);
        router.push(`/activities?search=wifi`);
    };

    const handleCategoryExpand = (category, event) => {
        // Prevent event bubbling
        event?.stopPropagation();
        
        // Only toggle expansion, don't navigate
        toggleCategory(category.id);
    };

    return (
        <div className="relative font-sans lg:hidden">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm py-2 px-3 focus:outline-none w-full justify-between"
            >
                <span>Explore Trektoo</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="fixed inset-x-4 top-20 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto mx-auto max-w-2xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {loading ? (
                        <div className="flex items-center justify-center py-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {categories.map((category) => {
                                const IconComponent = getCategoryIcon(category.name, category.id);
                                const isExpanded = expandedCategories.has(category.id);

                                return (
                                    <div key={category.id} className="border-b border-gray-100 last:border-b-0 pb-3">
                                        {/* Main Category Header */}
                                        <div className="flex items-center justify-between mb-2">
                                            <button
                                                onClick={() => handleMainCategoryClick(category)}
                                                className="flex items-center gap-2 hover:bg-blue-50 rounded-md px-2 py-1 transition-colors flex-1"
                                            >
                                                <div className="p-1.5 bg-blue-50 rounded-md">
                                                    <IconComponent size={16} className="text-blue-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-800 hover:text-blue-600">
                                                    {category.name}
                                                </h3>
                                            </button>
                                            {category.sub_category && category.sub_category.length > 0 && (
                                                <button
                                                    onClick={(e) => handleCategoryExpand(category, e)}
                                                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                                                >
                                                    <ChevronDown
                                                        size={14}
                                                        className={`transition-transform ${
                                                            isExpanded ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </button>
                                            )}
                                        </div>

                                        {/* Sub Categories */}
                                        {isExpanded && category.sub_category && (
                                            <div className="ml-6 space-y-1">
                                                {category.sub_category.map((subCategory) => (
                                                    <button
                                                        key={subCategory.id}
                                                        onClick={() => handleSubCategoryMainClick(subCategory, category.id)}
                                                        className="w-full text-left text-xs text-gray-800 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors block font-medium"
                                                    >
                                                        {subCategory.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KlookDropdown;