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

    // Fetch categories dynamically from your API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/klook/categories`);
                const data = await res.json();

                if (data.success && data.data.categories) {
                    setCategories(data.data.categories);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
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
        // Navigate to activities page with the category_id
        router.push(`/activities?category_id=${parentCategoryId}`);
        setOpen(false);
        setActiveCategory(null);
    };

    const handleMainCategoryClick = (category) => {
        // If main category has no subcategories, navigate directly
        if (!category.sub_category || category.sub_category.length === 0) {
            router.push(`/activities?category_id=${category.id}`);
            setOpen(false);
            setActiveCategory(null);
        } else {
            // If it has subcategories, show them
            setActiveCategory(category);
        }
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
                    className="fixed top-[110px] left-0 right-0 mx-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-[900px] max-w-[calc(100vw-2rem)]"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <div className="flex">
                            {/* Main Categories Column */}
                            <div className="w-1/3 border-r border-gray-200 py-4">
                                <div className="space-y-1 max-h-[500px] overflow-y-auto px-2">
                                    {categories.map((category) => {
                                        const IconComponent = getCategoryIcon(category.name, category.id);
                                        const isActive = activeCategory?.id === category.id;

                                        return (
                                            <button
                                                key={category.id}
                                                onMouseEnter={() => handleCategoryHover(category)}
                                                onClick={() => handleMainCategoryClick(category)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-md transition-all text-left ${
                                                    isActive
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                <IconComponent size={20} className="flex-shrink-0 text-blue-500" />
                                                <span className="text-sm font-medium">{category.name}</span>
                                                {category.sub_category && category.sub_category.length > 0 && (
                                                    <ChevronDown
                                                        size={14}
                                                        className={`ml-auto transition-transform ${
                                                            isActive ? "-rotate-90" : ""
                                                        }`}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sub Categories Column */}
                            <div className="w-2/3 py-4 px-6">
                                {activeCategory ? (
                                    <div>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-6 max-h-[500px] overflow-y-auto">
                                            {activeCategory.sub_category?.map((subCategory) => (
                                                <div key={subCategory.id} className="space-y-2">
                                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3">
                                                        {subCategory.name}
                                                    </h4>
                                                    <div className="space-y-1.5">
                                                        {subCategory.leaf_category?.map((leafCategory) => (
                                                            <button
                                                                key={leafCategory.id}
                                                                onClick={() => handleSubCategoryClick(leafCategory, activeCategory.id)}
                                                                className="w-full text-left text-sm text-gray-600 hover:text-blue-500 transition-colors block"
                                                            >
                                                                {leafCategory.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {(!activeCategory.sub_category || activeCategory.sub_category.length === 0) && (
                                            <div className="text-center py-12 text-gray-400">
                                                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No subcategories available</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <div className="text-center py-12">
                                            <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Click on a category to see details</p>
                                        </div>
                                    </div>
                                )}
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
                const res = await fetch(`${API_BASE}/klook/categories`);
                const data = await res.json();

                if (data.success && data.data.categories) {
                    setCategories(data.data.categories);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
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
        router.push(`/activities?category_id=${parentCategoryId}`);
        setOpen(false);
        setExpandedCategories(new Set());
    };

    const handleMainCategoryClick = (category) => {
        if (!category.sub_category || category.sub_category.length === 0) {
            router.push(`/activities?category_id=${category.id}`);
            setOpen(false);
            setExpandedCategories(new Set());
        } else {
            toggleCategory(category.id);
        }
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
                <div className="fixed inset-x-4 top-20 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto mx-auto max-w-2xl">
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category) => {
                                const IconComponent = getCategoryIcon(category.name, category.id);
                                const isExpanded = expandedCategories.has(category.id);

                                return (
                                    <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                                        <button
                                            onClick={() => handleMainCategoryClick(category)}
                                            className="w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left text-gray-700 hover:bg-gray-50"
                                        >
                                            <IconComponent size={18} className="flex-shrink-0 text-blue-500" />
                                            <span className="text-sm font-medium flex-1">{category.name}</span>
                                            {category.sub_category && category.sub_category.length > 0 && (
                                                <ChevronDown
                                                    size={14}
                                                    className={`transition-transform ${
                                                        isExpanded ? "rotate-180" : ""
                                                    }`}
                                                />
                                            )}
                                        </button>

                                        {isExpanded && category.sub_category && (
                                            <div className="ml-6 mt-1 space-y-2 pb-2">
                                                {category.sub_category.map((subCategory) => (
                                                    <div key={subCategory.id}>
                                                        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                                            {subCategory.name}
                                                        </h4>
                                                        <div className="space-y-1">
                                                            {subCategory.leaf_category?.map((leafCategory) => (
                                                                <button
                                                                    key={leafCategory.id}
                                                                    onClick={() => handleSubCategoryClick(leafCategory, category.id)}
                                                                    className="w-full text-left px-2 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                >
                                                                    {leafCategory.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
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