<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'level',
        'parent_id',
        'main_category_id',
        'full_path',
        'sort_order',
        'is_active',
        'raw_data'
    ];

    protected $casts = [
        'category_id' => 'integer',
        'parent_id' => 'integer',
        'main_category_id' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
        'raw_data' => 'array'
    ];

    // Use the default primary key (id) for relationships
    // category_id is just a unique field, not the primary key

    /**
     * Get the parent category
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id', 'category_id');
    }

    /**
     * Get the main category (top-level)
     */
    public function mainCategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'main_category_id', 'category_id');
    }

    /**
     * Get child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id', 'category_id');
    }

    /**
     * Get all sub-categories under this main category
     */
    public function subCategories(): HasMany
    {
        return $this->hasMany(Category::class, 'main_category_id', 'category_id')
                    ->where('level', 'sub');
    }

    /**
     * Get all leaf categories under this main category
     */
    public function leafCategories(): HasMany
    {
        return $this->hasMany(Category::class, 'main_category_id', 'category_id')
                    ->where('level', 'leaf');
    }

    /**
     * Scope for main categories only
     */
    public function scopeMain($query)
    {
        return $query->where('level', 'main');
    }

    /**
     * Scope for sub categories only
     */
    public function scopeSub($query)
    {
        return $query->where('level', 'sub');
    }

    /**
     * Scope for leaf categories only
     */
    public function scopeLeaf($query)
    {
        return $query->where('level', 'leaf');
    }

    /**
     * Scope for active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for searching by name
     */
    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('name', 'like', '%' . $searchTerm . '%');
    }

    /**
     * Get the full category path as a string
     */
    public function getFullPathAttribute()
    {
        if ($this->level === 'main') {
            return $this->name;
        } elseif ($this->level === 'sub') {
            $main = $this->mainCategory;
            return $main ? $main->name . ' > ' . $this->name : $this->name;
        } else { // leaf
            $main = $this->mainCategory;
            $sub = $this->parent;
            if ($main && $sub) {
                return $main->name . ' > ' . $sub->name . ' > ' . $this->name;
            }
            return $this->name;
        }
    }
}