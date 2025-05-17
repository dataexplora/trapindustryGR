import React, { useState, useEffect } from 'react';
import { EventListItem, eventService } from '@/services/eventService';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import EventCard from './EventCard';

const FeaturedEvents: React.FC = () => {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  
  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        setIsLoading(true);
        const featuredEvents = await eventService.getFeaturedEvents(3);
        setEvents(featuredEvents);
      } catch (error) {
        console.error('Error loading featured events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeaturedEvents();
  }, []);
  
  if (isLoading) {
    return (
      <div className="py-10">
        <div className="container mx-auto px-4">
          {/* Skeleton loading state */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[16/9] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Don't render the component if there are no events
  if (events.length === 0) {
    return null;
  }
  
  return (
    <div className="py-10 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
              {t('home.featuredEvents.title', 'Featured Events')}
            </h2>
            <p className="text-gray-400 mt-1">
              {t('home.featuredEvents.subtitle', 'Upcoming happenings in the Greek urban scene')}
            </p>
          </div>
          
          <Link to="/events" className="mt-4 sm:mt-0">
            <Button variant="outline" className="text-indigo-400 border-indigo-900 hover:bg-indigo-950">
              {t('home.featuredEvents.viewAll', 'View All Events')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard 
              key={event.id} 
              event={event}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedEvents; 