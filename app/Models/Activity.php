<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'activity_id',
        'title',
        'sub_title',
        'city_id',
        'country_id',
        'category_id',
        'supported_languages',
        'price',
        'currency',
        'vat_price',
        // Image fields
        'primary_image_url',
        'image_alt_text',
        'all_images',
        // Country/location fields
        'country_name',
        'city_name',
        'location_display'
    ];

    protected $casts = [
        'supported_languages' => 'array',
        'all_images' => 'array',
        'activity_id' => 'integer',
        'city_id' => 'integer',
        'country_id' => 'integer',
        'category_id' => 'integer'
    ];

    // Disable auto-incrementing primary key since we use activity_id
    public $incrementing = false;
    protected $primaryKey = 'activity_id';

    // Scope for filtering by category
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    // Scope for searching by title
    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('title', 'like', '%' . $searchTerm . '%');
    }

    // Scope for filtering by city
    public function scopeByCity($query, $cityId)
    {
        return $query->where('city_id', $cityId);
    }

    // Scope for filtering by country
    public function scopeByCountry($query, $countryId)
    {
        return $query->where('country_id', $countryId);
    }
    
    // Scope for filtering by country name
    public function scopeByCountryName($query, $countryName)
    {
        return $query->where('country_name', $countryName);
    }
}
