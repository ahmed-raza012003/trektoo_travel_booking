// Categories Cache Manager
// Shared cache for categories across the application

const RAW_CACHE_KEY = 'trektoo-categories-raw';
const RAW_CACHE_TIMESTAMP_KEY = 'trektoo-categories-raw-timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

class CategoriesCache {
  constructor() {
    this.rawCache = null;
    this.timestamp = null;
  }

  // Get cached raw categories (all categories from API)
  getRawCategories() {
    try {
      // Check if we have in-memory cache first
      if (this.rawCache && this.timestamp && this.isCacheValid(this.timestamp)) {
        return this.rawCache;
      }

      // Check localStorage
      const cachedData = localStorage.getItem(RAW_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(RAW_CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTimestamp && this.isCacheValid(parseInt(cachedTimestamp))) {
        const categories = JSON.parse(cachedData);
        // Update in-memory cache
        this.rawCache = categories;
        this.timestamp = parseInt(cachedTimestamp);
        return categories;
      }

      return null;
    } catch (error) {
      console.error('Error reading raw categories cache:', error);
      return null;
    }
  }

  // Set cached raw categories
  setRawCategories(categories) {
    try {
      const timestamp = Date.now();
      
      // Update in-memory cache
      this.rawCache = categories;
      this.timestamp = timestamp;

      // Update localStorage
      localStorage.setItem(RAW_CACHE_KEY, JSON.stringify(categories));
      localStorage.setItem(RAW_CACHE_TIMESTAMP_KEY, timestamp.toString());

      console.log('✅ Raw categories cached successfully');
    } catch (error) {
      console.error('Error setting raw categories cache:', error);
    }
  }

  // Get categories for global dropdown (excludes Cruise & Hotel)
  getGlobalDropdownCategories() {
    const rawCategories = this.getRawCategories();
    if (!rawCategories) return null;

    // Filter out only Cruise and Hotel categories for global dropdown
    const filteredCategories = rawCategories.filter(category => {
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
    
    return [...filteredCategories, otherServicesCategory];
  }

  // Get categories for activities page (excludes more categories)
  getActivitiesPageCategories() {
    const rawCategories = this.getRawCategories();
    if (!rawCategories) return null;

    // Filter out specified categories for activities page only
    const categoriesToHide = ['cruise', 'hotel', 'car services', 'mobility transportation', 'transportation pass', 'id'];
    const filteredCategories = rawCategories.filter(category => {
      const categoryName = category.name.toLowerCase();
      return !categoriesToHide.some(hiddenCategory => categoryName.includes(hiddenCategory));
    });
    
    return filteredCategories;
  }

  // Check if cache is valid
  isCacheValid(timestamp) {
    return (Date.now() - timestamp) < CACHE_DURATION;
  }

  // Clear cache
  clearCache() {
    try {
      this.rawCache = null;
      this.timestamp = null;
      localStorage.removeItem(RAW_CACHE_KEY);
      localStorage.removeItem(RAW_CACHE_TIMESTAMP_KEY);
      console.log('🗑️ Categories cache cleared');
    } catch (error) {
      console.error('Error clearing categories cache:', error);
    }
  }

  // Get cache info for debugging
  getCacheInfo() {
    const cachedData = this.getRawCategories();
    return {
      hasCache: !!cachedData,
      timestamp: this.timestamp,
      isValid: this.timestamp ? this.isCacheValid(this.timestamp) : false,
      categoriesCount: cachedData ? cachedData.length : 0,
      cacheAge: this.timestamp ? Math.round((Date.now() - this.timestamp) / 1000 / 60) : null
    };
  }
}

// Create singleton instance
const categoriesCache = new CategoriesCache();

export default categoriesCache;
