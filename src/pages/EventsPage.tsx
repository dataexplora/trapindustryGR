import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import EventCard from '../components/EventCard';
import { useLanguage } from '../contexts/LanguageContext';
import { EventListItem, eventService } from '@/services/eventService';
import { Calendar, MapPin, Search, Tag, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import SEO from '../components/SEO';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

// Event filter types
type FilterState = {
  query: string;
  eventType: string;
  city: string;
};

const EVENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'concert', label: 'Concerts' },
  { value: 'festival', label: 'Festivals' },
  { value: 'dance_contest', label: 'Dance Contests' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'exhibition', label: 'Exhibitions' },
  { value: 'street_event', label: 'Street Events' },
];

const CITIES = [
  { value: '', label: 'All Cities' },
  { value: 'Athens', label: 'Athens' },
  { value: 'Thessaloniki', label: 'Thessaloniki' },
  { value: 'Patras', label: 'Patras' },
  { value: 'Heraklion', label: 'Heraklion' },
  { value: 'Larissa', label: 'Larissa' },
];

const EventsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredEvents, setFeaturedEvents] = useState<EventListItem[]>([]);
  const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    eventType: '',
    city: '',
  });
  const { t } = useLanguage();
  
  // Track search input separately to only filter when submitted
  const [searchInput, setSearchInput] = useState('');
  
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        
        // Load featured events for the hero section
        const featured = await eventService.getFeaturedEvents(6);
        console.log("Featured events:", featured);
        setFeaturedEvents(featured);
        
        // Load all upcoming events - increased to get more events
        const events = await eventService.getUpcomingEvents(100);
        console.log("All events:", events);
        
        // Sort events chronologically by start date
        const sortedEvents = [...events].sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        
        setAllEvents(sortedEvents);
        setError(null);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, query: searchInput }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      query: '',
      eventType: '',
      city: '',
    });
    setSearchInput('');
  };
  
  // Filter events based on criteria
  const filteredEvents = useMemo(() => {
    if (!allEvents.length) return [];
    
    return allEvents.filter(event => {
      // Filter by search query
      if (filters.query && !event.title.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      
      // Filter by event type
      if (filters.eventType && event.eventType !== filters.eventType) {
        return false;
      }
      
      // Filter by city
      if (filters.city && event.city !== filters.city) {
        return false;
      }
      
      return true;
    });
  }, [allEvents, filters]);
  
  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.eventType) count++;
    if (filters.city) count++;
    return count;
  }, [filters]);
  
  return (
    <>
      <SEO
        title={t('events.seo.title', 'Urban Events in Greece | Concerts, Festivals & More')}
        description={t('events.seo.description', 'Discover upcoming urban culture events in Greece. Find concerts, dance contests, street events, and more across Athens, Thessaloniki, and other cities.')}
        type="website"
        section={t('events.seo.section', 'Events')}
        category="Events Directory"
      />
      <Layout>
        {/* Hero section with featured events */}
        <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/events-pattern.png')] bg-center opacity-10"></div>
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {t('events.title', 'Urban Greece Events')}
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                {t('events.subtitle', 'Discover the pulse of Greek urban culture with concerts, street events, dance battles, and more.')}
              </p>
              
              {/* Search Form */}
              <form 
                onSubmit={handleSearchSubmit} 
                className="mt-8 max-w-md mx-auto flex"
              >
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="search"
                    placeholder={t('events.search.placeholder', 'Search events...')}
                    className="block w-full rounded-l-md border-0 bg-slate-800 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="rounded-l-none bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {t('events.search.button', 'Find')}
                </Button>
              </form>
            </div>
            
            {/* Featured Events Carousel */}
            {isLoading ? (
              // Skeletons for loading state
              <div className="flex flex-col md:flex-row gap-6 mt-10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-full md:w-1/3">
                    <Skeleton className="aspect-[16/9] rounded-xl" />
                    <div className="mt-3">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredEvents.length > 0 ? (
              // Featured events carousel
              <div className="mt-10 px-4 md:px-10">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {featuredEvents.map(event => (
                      <CarouselItem key={event.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                        <EventCard event={event} variant="featured" />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-2 mt-4">
                    <CarouselPrevious className="relative static left-0 translate-y-0 bg-slate-800 hover:bg-slate-700" />
                    <CarouselNext className="relative static right-0 translate-y-0 bg-slate-800 hover:bg-slate-700" />
                  </div>
                </Carousel>
              </div>
            ) : (
              // No featured events
              <div className="w-full text-center py-8">
                <p className="text-slate-400">{t('events.featured.none', 'No featured events available')}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content with filters and event listings */}
        <div className="container mx-auto px-4 py-12">
          {/* Filter controls */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                {t('events.list.title', 'Upcoming Events')}
              </h2>
              
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2 sm:mt-0 border-slate-700 text-slate-300"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {showFilters 
                  ? t('events.filters.hide', 'Hide Filters') 
                  : t('events.filters.show', `Filters ${activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}`)}
              </Button>
            </div>
            
            {/* Advanced Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      {t('events.filters.type', 'Event Type')}
                    </label>
                    <select
                      value={filters.eventType}
                      onChange={(e) => handleFilterChange('eventType', e.target.value)}
                      className="block w-full rounded-md border-0 bg-slate-800 py-2 text-white shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    >
                      {EVENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {t(`events.types.${type.value || 'all'}`, type.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* City Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      {t('events.filters.city', 'City')}
                    </label>
                    <select
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="block w-full rounded-md border-0 bg-slate-800 py-2 text-white shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    >
                      {CITIES.map(city => (
                        <option key={city.value} value={city.value}>
                          {t(`events.cities.${city.value || 'all'}`, city.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Active Filters */}
                  <div className="md:col-span-2 mt-4">
                    <div className="flex flex-wrap gap-2">
                      {filters.query && (
                        <Badge className="flex items-center gap-1 px-3 py-1 bg-slate-700">
                          <Search className="h-3 w-3" />
                          {filters.query}
                          <button 
                            onClick={() => {
                              setFilters(prev => ({ ...prev, query: '' }));
                              setSearchInput('');
                            }}
                            className="ml-1 hover:text-red-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      
                      {filters.eventType && (
                        <Badge className="flex items-center gap-1 px-3 py-1 bg-slate-700">
                          <Tag className="h-3 w-3" />
                          {EVENT_TYPES.find(t => t.value === filters.eventType)?.label}
                          <button 
                            onClick={() => handleFilterChange('eventType', '')}
                            className="ml-1 hover:text-red-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      
                      {filters.city && (
                        <Badge className="flex items-center gap-1 px-3 py-1 bg-slate-700">
                          <MapPin className="h-3 w-3" />
                          {filters.city}
                          <button 
                            onClick={() => handleFilterChange('city', '')}
                            className="ml-1 hover:text-red-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      
                      {activeFiltersCount > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-auto border-red-900 text-red-400 hover:text-red-300 hover:bg-red-950"
                          onClick={clearFilters}
                        >
                          <X className="mr-2 h-3 w-3" />
                          {t('events.filters.clear', 'Clear All')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Results count */}
            <div className="text-sm text-slate-400 mb-8">
              {isLoading 
                ? t('events.list.loading', 'Loading events...') 
                : t('events.list.count', 'Showing {0} event(s)', filteredEvents.length)}
            </div>
          </div>
          
          {/* Event Carousel */}
          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[16/9] rounded-xl" />
                  <div className="mt-3">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {t('events.error.retry', 'Retry')}
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            // Empty state
            <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800">
              <Calendar className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                {t('events.empty.title', 'No events found')}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                {t('events.empty.message', 'There are no events matching your current filters. Try adjusting your search criteria.')}
              </p>
              <Button 
                onClick={clearFilters}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {t('events.empty.action', 'Clear Filters')}
              </Button>
            </div>
          ) : (
            // Events Carousel
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full px-4"
            >
              <CarouselContent>
                {filteredEvents.map(event => (
                  <CarouselItem key={event.id} className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 p-1">
                    <EventCard 
                      key={event.id}
                      event={event} 
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center gap-2 mt-6">
                <CarouselPrevious className="relative static left-0 translate-y-0 bg-slate-800 hover:bg-slate-700">
                  <ChevronLeft className="h-5 w-5" />
                </CarouselPrevious>
                <CarouselNext className="relative static right-0 translate-y-0 bg-slate-800 hover:bg-slate-700">
                  <ChevronRight className="h-5 w-5" />
                </CarouselNext>
              </div>
            </Carousel>
          )}
        </div>
      </Layout>
    </>
  );
};

export default EventsPage; 