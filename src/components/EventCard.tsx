import React from 'react';
import { Link } from 'react-router-dom';
import { EventListItem } from '@/services/eventService';
import { Calendar, MapPin, Tag, Users, ExternalLink, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: EventListItem;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  variant = 'default',
  className 
}) => {
  // Default image placeholder with gradient
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMzNzNiOWM7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojODg0MGJkO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2dyYWQpIiAvPjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LXNpemU9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkV2ZW50PC90ZXh0Pjwvc3ZnPg==';
  
  const posterImage = event.posterUrl || defaultImage;
  
  // Format date
  const formattedDate = event.startDate ? format(new Date(event.startDate), 'EEE, MMM d, yyyy') : 'TBA';
  const formattedTime = event.startDate ? format(new Date(event.startDate), 'h:mm a') : '';
  
  // Get event type label
  const getEventTypeLabel = () => {
    switch(event.eventType) {
      case 'concert': return 'Concert';
      case 'dance_contest': return 'Dance Contest';
      case 'festival': return 'Festival';
      case 'exhibition': return 'Exhibition';
      case 'workshop': return 'Workshop';
      case 'street_event': return 'Street Event';
      default: return event.eventType?.charAt(0).toUpperCase() + event.eventType?.slice(1) || 'Event';
    }
  };
  
  // Badge color based on event type
  const getBadgeStyle = () => {
    switch(event.eventType) {
      case 'concert': return 'bg-indigo-600 hover:bg-indigo-700';
      case 'dance_contest': return 'bg-orange-600 hover:bg-orange-700';
      case 'festival': return 'bg-purple-600 hover:bg-purple-700';
      case 'exhibition': return 'bg-teal-600 hover:bg-teal-700';
      case 'workshop': return 'bg-blue-600 hover:bg-blue-700';
      case 'street_event': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (variant === 'featured') {
    return (
      <Link 
        to={`/events/${event.id}`} 
        className={cn(
          "group relative overflow-hidden rounded-xl block w-full", 
          className
        )}
      >
        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl">
          <img 
            src={posterImage} 
            alt={event.title} 
            className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className={cn("px-3 py-1 font-medium", getBadgeStyle())}>
              {getEventTypeLabel()}
            </Badge>
            {event.isFeatured && (
              <Badge className="bg-yellow-600 hover:bg-yellow-700 font-medium">
                Featured
              </Badge>
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-sm">{event.title}</h3>
          
          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{event.venueName}, {event.city}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }
  
  if (variant === 'compact') {
    return (
      <Link 
        to={`/events/${event.id}`} 
        className={cn(
          "group flex items-center gap-4 rounded-lg overflow-hidden border border-slate-800 bg-slate-900/50 hover:bg-slate-900 p-3 transition-colors", 
          className
        )}
      >
        <div className="h-14 w-14 flex-shrink-0 rounded-md overflow-hidden">
          <img 
            src={posterImage} 
            alt={event.title} 
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-white mb-1 truncate">{event.title}</h4>
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="mr-1 h-3 w-3" />
            <span className="mr-2">{formattedDate}</span>
            <MapPin className="mr-1 h-3 w-3" />
            <span className="truncate">{event.city}</span>
          </div>
        </div>
        
        <Badge className={cn("px-2 py-1 text-xs font-medium", getBadgeStyle())}>
          {getEventTypeLabel()}
        </Badge>
      </Link>
    );
  }
  
  // Default card style
  return (
    <Link 
      to={`/events/${event.id}`} 
      className={cn(
        "group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/20 hover:-translate-y-1", 
        className
      )}
    >
      <div className="relative">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img 
            src={posterImage} 
            alt={event.title} 
            className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between z-10">
            <Badge className={cn("px-3 py-1 font-medium", getBadgeStyle())}>
              {getEventTypeLabel()}
            </Badge>
            
            {event.isFeatured && (
              <Badge className="bg-yellow-600 hover:bg-yellow-700">
                Featured
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">{event.title}</h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description || `Join us for this exciting ${getEventTypeLabel().toLowerCase()} in ${event.city}!`}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
            <span>{formattedDate}</span>
            {formattedTime && (
              <>
                <span className="mx-1">•</span>
                <Clock className="h-4 w-4 mr-1 text-indigo-400" />
                <span>{formattedTime}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-indigo-400" />
            <span>{event.venueName}, {event.city}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard; 