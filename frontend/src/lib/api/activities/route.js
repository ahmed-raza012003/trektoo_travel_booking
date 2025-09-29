import { NextResponse } from 'next/server';
import API_BASE from '../klookApi';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const limit = searchParams.get('limit') || '20';
    const page = searchParams.get('page') || '1';

    // Build the backend API URL
    let apiUrl = `${API_BASE}/klook/activities?limit=${limit}&page=${page}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // If we have a category ID and the backend doesn't filter properly, do client-side filtering
    if (categoryId && data.success && data.data?.activity?.activity_list) {
      const allActivities = data.data.activity.activity_list;
      
      // Filter activities based on category (you might need to adjust this logic)
      const filteredActivities = allActivities.filter(activity => {
        // Adjust this logic based on how categories are stored in activity objects
        return activity.category_id == categoryId || 
               activity.categories?.some(cat => cat.id == categoryId);
      });
      
      // Update the response with filtered data
      data.data.activity.activity_list = filteredActivities;
      data.data.activity.total = filteredActivities.length;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}