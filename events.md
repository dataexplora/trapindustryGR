# Urban Greece - Events Feature

This document provides comprehensive documentation for the Events feature implementation in Urban Greece website.

## Overview

The Events feature allows users to discover and explore upcoming urban music events across Greece. Events are categorized by type (concerts, festivals, dance contests, etc.), searchable by city, date range, and other criteria, and include detailed information about venues, artists, and ticket information.

## Database Schema

Located in `supabase/functions/events_schema.sql`.

### Main Tables

1. **events**
   - Primary table storing event details
   - Fields include: title, description, dates, venue information, event type, status, etc.
   - Includes indexing for efficient queries on start_date, status, city, and event_type

2. **event_images**
   - Stores image URLs for events
   - Supports multiple image types: poster, venue, gallery
   - Uses position field for ordering in galleries

3. **event_artists**
   - Junction table connecting events to artists
   - Tracks headliner status

4. **event_tags**
   - Tags for event categorization and filtering
   - Indexed for fast tag-based searches

### Database Functions

- `get_upcoming_events`: Optimized function to retrieve upcoming event data with images in a single query

## Service Layer

Located in `src/services/eventService.ts`.

### Data Types

- `Event`: Complete event data with all details
- `EventListItem`: Lightweight version for list displays

### Key Functions

1. **Data Fetching**
   - `getUpcomingEvents`: Retrieves upcoming events with pagination
   - `getFeaturedEvents`: Gets featured events for homepage
   - `getEventById`: Fetches comprehensive event details including artists, images, and tags
   - `getEventsByArtist`: Finds events associated with a specific artist
   - `searchEvents`: Searches events with various criteria (type, city, date range, query)

2. **Performance Optimizations**
   - Caching implementation using `cacheService`
   - Typed interfaces ensuring data consistency
   - Efficient query patterns to minimize database load

## UI Components

### EventCard Component (`src/components/EventCard.tsx`)

Versatile event display component with three variants:
- `default`: Standard card with image, title, date, venue and event type
- `featured`: Larger card with overlay text for highlighting on homepage/hero sections
- `compact`: Condensed version for sidebar/related events

Features:
- Dynamic styling based on event type
- Responsive design for all screen sizes
- Proper handling of missing data (default images, fallback text)

### FeaturedEvents Component (`src/components/FeaturedEvents.tsx`)

Homepage section highlighting special events:
- Automatically loads featured events
- Proper loading states with skeletons
- Only displays when events are available
- Links to the main events page

## Pages

### EventsPage (`src/pages/EventsPage.tsx`)

Main event listing and discovery page:
- Hero section with search functionality and featured events
- Comprehensive filtering system:
  - Time-based filters: upcoming, weekend, this month, all
  - Event type filters
  - City filters
  - Text search
- Clear filter options and filter badge displays
- Responsive grid layout
- SEO optimization
- Loading states and empty states

### EventDetailPage (`src/pages/EventDetailPage.tsx`)

Detailed view of a single event:
- Hero section with event poster and key information
- Ticket purchasing section with external links
- Event description and details
- Artist lineup section
- Venue/location information
- Event information sidebar
- Related events suggestions
- SEO optimization with structured data

## Integration

### Application Routes

Added to `src/App.tsx`:
```jsx
<Route path="/events" element={<EventsPage />} />
<Route path="/events/:id" element={<EventDetailPage />} />
```

### Navigation

Added to main navigation in `src/Layout.tsx`:
- Desktop navigation
- Mobile menu navigation

### Homepage Integration

Added `FeaturedEvents` component to the homepage between artists and tracks sections.

## Features & Functionality

1. **Event Discovery**
   - Browse upcoming events
   - Filter by event type, city, date range
   - Search by text
   - Featured events highlighting

2. **Event Details**
   - Comprehensive information display
   - Artist lineup with links to artist pages
   - Venue information with address
   - Ticket purchasing links
   - Event tags and categorization
   - Related events

3. **Artist Integration**
   - Events connected to artists
   - Artist images displayed in lineup
   - Navigation between artists and their events

4. **User Experience**
   - Loading states with skeleton placeholders
   - Responsive design for all screen sizes
   - Empty states with helpful messaging
   - Error handling

## Performance Considerations

1. **Data Management**
   - Lightweight list items for browse pages
   - Detailed data only loaded when needed
   - Caching for frequently accessed data
   - Optimized database queries

2. **Image Handling**
   - Default image placeholders
   - Image categorization (poster, venue, gallery)
   - Responsive image sizing

## Future Improvements

Potential enhancements to consider:
- Event filtering by artist
- Map integration for venue locations
- Calendar view for events
- User event favoriting/saving
- Event attendance tracking
- Ticket purchasing integration
- Event reminder functionality
- Social sharing options 