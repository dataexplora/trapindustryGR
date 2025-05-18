import { supabase } from '@/lib/supabase';
import { cacheService } from '@/lib/cacheService';

// Event types
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  venueName: string;
  address?: string;
  city: string;
  postalCode?: string;
  locationLat?: number;
  locationLng?: number;
  eventType: string;
  ticketUrl?: string;
  /** @deprecated Use pricing instead */
  priceInfo?: string;
  pricing?: PriceTier[];
  organizer?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'canceled';
  isFeatured: boolean;
  images?: {
    poster?: string;
    venue?: string;
    gallery?: string[];
  };
  artists?: Array<{
    id: string;
    name: string;
    isHeadliner: boolean;
    images?: {
      avatar?: string;
    };
  }>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceTier {
  label: string;
  price: number;
}

// Event list item (lightweight version)
export interface EventListItem {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  venueName: string;
  city: string;
  eventType: string;
  status: string;
  isFeatured: boolean;
  posterUrl?: string;
}

export const eventService = {
  // Get upcoming events with pagination
  getUpcomingEvents: async (limit = 10, offset = 0): Promise<EventListItem[]> => {
    const cacheKey = `events-upcoming-${limit}-${offset}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<EventListItem[]>(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Use the optimized function we created
      const { data, error } = await supabase
        .rpc('get_upcoming_events', { limit_count: limit, offset_count: offset });
        
      if (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
      }
      
      // Transform to our interface
      const events: EventListItem[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        venueName: event.venue_name,
        city: event.city,
        eventType: event.event_type,
        status: event.status,
        isFeatured: event.is_featured,
        posterUrl: event.poster_url,
      }));
      
      // Cache the results
      cacheService.set(cacheKey, events, 300); // Cache for 5 minutes
      
      return events;
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error);
      return [];
    }
  },
  
  // Get featured events for homepage
  getFeaturedEvents: async (limit = 3): Promise<EventListItem[]> => {
    const cacheKey = `events-featured-${limit}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<EventListItem[]>(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, title, description, start_date, end_date, 
          venue_name, city, event_type, status, is_featured
        `)
        .eq('is_featured', true)
        .eq('status', 'upcoming')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);
        
      if (error) {
        console.error('Error fetching featured events:', error);
        return [];
      }
      
      // Get the poster images for these events
      const eventIds = data.map(event => event.id);
      const { data: posterImages, error: imagesError } = await supabase
        .from('event_images')
        .select('event_id, url')
        .in('event_id', eventIds)
        .eq('image_type', 'poster');
        
      if (imagesError) {
        console.error('Error fetching event images:', imagesError);
      }
      
      // Map of event ID to poster URL
      const posterMap: Record<string, string> = {};
      if (posterImages) {
        posterImages.forEach(img => {
          posterMap[img.event_id] = img.url;
        });
      }
      
      // Transform to our interface
      const events: EventListItem[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        venueName: event.venue_name,
        city: event.city,
        eventType: event.event_type,
        status: event.status,
        isFeatured: event.is_featured,
        posterUrl: posterMap[event.id],
      }));
      
      // Cache the results
      cacheService.set(cacheKey, events, 300); // Cache for 5 minutes
      
      return events;
    } catch (error) {
      console.error('Error in getFeaturedEvents:', error);
      return [];
    }
  },
  
  // Get detailed event by ID
  getEventById: async (id: string): Promise<Event | null> => {
    const cacheKey = `event-detail-${id}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<Event>(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
        
      if (eventError || !eventData) {
        console.error('Error fetching event details:', eventError);
        return null;
      }
      
      // Parse pricing JSON if available
      let pricingTiers: PriceTier[] | undefined = undefined;
      if (eventData.pricing) {
        try {
          // If it's already an array, use it directly
          if (Array.isArray(eventData.pricing)) {
            pricingTiers = eventData.pricing;
          } else {
            // Otherwise, parse it from JSON string
            pricingTiers = JSON.parse(eventData.pricing);
          }
        } catch (e) {
          console.error('Error parsing pricing JSON:', e);
        }
      }
      
      // Get event images
      const { data: imagesData, error: imagesError } = await supabase
        .from('event_images')
        .select('*')
        .eq('event_id', id);
        
      if (imagesError) {
        console.error('Error fetching event images:', imagesError);
      }
      
      // Get event artists
      const { data: artistsData, error: artistsError } = await supabase
        .from('event_artists')
        .select(`
          artist_id, is_headliner,
          artists:artist_id (id, name)
        `)
        .eq('event_id', id);
        
      if (artistsError) {
        console.error('Error fetching event artists:', artistsError);
      }
      
      // Get artist avatars
      const artistIds = artistsData?.map(a => a.artist_id) || [];
      let artistImages: any[] = [];
      
      if (artistIds.length > 0) {
        const { data: avatarData, error: avatarError } = await supabase
          .from('artist_images')
          .select('artist_id, url')
          .in('artist_id', artistIds)
          .eq('image_type', 'avatar');
          
        if (avatarError) {
          console.error('Error fetching artist avatars:', avatarError);
        } else {
          artistImages = avatarData || [];
        }
      }
      
      // Get tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('event_tags')
        .select('tag')
        .eq('event_id', id);
        
      if (tagsError) {
        console.error('Error fetching event tags:', tagsError);
      }
      
      // Process images by type
      const images: Event['images'] = {
        gallery: []
      };
      
      if (imagesData) {
        imagesData.forEach(img => {
          if (img.image_type === 'poster') {
            images.poster = img.url;
          } else if (img.image_type === 'venue') {
            images.venue = img.url;
          } else if (img.image_type === 'gallery') {
            images.gallery?.push(img.url);
          }
        });
      }
      
      // Process artists with avatars
      const artists = artistsData?.map(artist => {
        const avatar = artistImages.find(img => img.artist_id === artist.artist_id)?.url;
        
        return {
          id: artist.artist_id,
          name: artist.artists?.name || 'Unknown Artist',
          isHeadliner: artist.is_headliner,
          images: avatar ? { avatar } : undefined
        };
      }) || [];
      
      // Process tags
      const tags = tagsData?.map(t => t.tag) || [];
      
      // Build complete event object
      const event: Event = {
        id: eventData.id,
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.start_date,
        endDate: eventData.end_date,
        venueName: eventData.venue_name,
        address: eventData.address,
        city: eventData.city,
        postalCode: eventData.postal_code,
        locationLat: eventData.location_lat,
        locationLng: eventData.location_lng,
        eventType: eventData.event_type,
        ticketUrl: eventData.ticket_url,
        priceInfo: eventData.price_info,
        pricing: pricingTiers,
        organizer: eventData.organizer,
        status: eventData.status as Event['status'],
        isFeatured: eventData.is_featured,
        createdAt: eventData.created_at,
        updatedAt: eventData.updated_at,
        images: Object.keys(images).length > 0 ? images : undefined,
        artists: artists.length > 0 ? artists : undefined,
        tags: tags.length > 0 ? tags : undefined
      };
      
      // Cache the result
      cacheService.set(cacheKey, event, 300); // Cache for 5 minutes
      
      return event;
    } catch (error) {
      console.error('Error in getEventById:', error);
      return null;
    }
  },
  
  // Get events by artist ID
  getEventsByArtist: async (artistId: string, limit = 5): Promise<EventListItem[]> => {
    const cacheKey = `events-artist-${artistId}-${limit}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<EventListItem[]>(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // First get event IDs for this artist
      const { data: artistEvents, error: artistError } = await supabase
        .from('event_artists')
        .select('event_id')
        .eq('artist_id', artistId);
        
      if (artistError || !artistEvents || artistEvents.length === 0) {
        return [];
      }
      
      const eventIds = artistEvents.map(e => e.event_id);
      
      // Then fetch the actual events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
          id, title, description, start_date, end_date, 
          venue_name, city, event_type, status, is_featured
        `)
        .in('id', eventIds)
        .eq('status', 'upcoming')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit);
        
      if (eventsError || !events || events.length === 0) {
        return [];
      }
      
      // Get the poster images for these events
      const { data: posterImages, error: imagesError } = await supabase
        .from('event_images')
        .select('event_id, url')
        .in('event_id', eventIds)
        .eq('image_type', 'poster');
        
      if (imagesError) {
        console.error('Error fetching event images:', imagesError);
      }
      
      // Map of event ID to poster URL
      const posterMap: Record<string, string> = {};
      if (posterImages) {
        posterImages.forEach(img => {
          posterMap[img.event_id] = img.url;
        });
      }
      
      // Transform to our interface
      const eventsList: EventListItem[] = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        venueName: event.venue_name,
        city: event.city,
        eventType: event.event_type,
        status: event.status,
        isFeatured: event.is_featured,
        posterUrl: posterMap[event.id],
      }));
      
      // Cache the results
      cacheService.set(cacheKey, eventsList, 300); // Cache for 5 minutes
      
      return eventsList;
    } catch (error) {
      console.error('Error in getEventsByArtist:', error);
      return [];
    }
  },
  
  // Search events by various criteria
  searchEvents: async (params: {
    query?: string;
    eventType?: string;
    city?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventListItem[]> => {
    const { 
      query, 
      eventType, 
      city, 
      startDate, 
      endDate, 
      limit = 20, 
      offset = 0 
    } = params;
    
    // Generate a unique cache key based on all parameters
    const paramString = JSON.stringify(params);
    const cacheKey = `events-search-${paramString}`;
    
    // Try to get from cache first
    const cachedData = cacheService.get<EventListItem[]>(cacheKey);
    if (cachedData) return cachedData;
    
    try {
      // Start building the query
      let queryBuilder = supabase
        .from('events')
        .select(`
          id, title, description, start_date, end_date, 
          venue_name, city, event_type, status, is_featured
        `)
        .eq('status', 'upcoming')
        .gte('start_date', startDate || new Date().toISOString());
        
      // Add filters if provided
      if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      }
      
      if (eventType) {
        queryBuilder = queryBuilder.eq('event_type', eventType);
      }
      
      if (city) {
        queryBuilder = queryBuilder.eq('city', city);
      }
      
      if (endDate) {
        queryBuilder = queryBuilder.lte('start_date', endDate);
      }
      
      // Add pagination
      queryBuilder = queryBuilder
        .order('start_date', { ascending: true })
        .range(offset, offset + limit - 1);
      
      // Execute query
      const { data: events, error: eventsError } = await queryBuilder;
      
      if (eventsError || !events || events.length === 0) {
        return [];
      }
      
      // Get the poster images for these events
      const eventIds = events.map(event => event.id);
      const { data: posterImages, error: imagesError } = await supabase
        .from('event_images')
        .select('event_id, url')
        .in('event_id', eventIds)
        .eq('image_type', 'poster');
        
      if (imagesError) {
        console.error('Error fetching event images:', imagesError);
      }
      
      // Map of event ID to poster URL
      const posterMap: Record<string, string> = {};
      if (posterImages) {
        posterImages.forEach(img => {
          posterMap[img.event_id] = img.url;
        });
      }
      
      // Transform to our interface
      const eventsList: EventListItem[] = events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        venueName: event.venue_name,
        city: event.city,
        eventType: event.event_type,
        status: event.status,
        isFeatured: event.is_featured,
        posterUrl: posterMap[event.id],
      }));
      
      // Cache the results (shorter time for search results)
      cacheService.set(cacheKey, eventsList, 180); // Cache for 3 minutes
      
      return eventsList;
    } catch (error) {
      console.error('Error in searchEvents:', error);
      return [];
    }
  }
}; 