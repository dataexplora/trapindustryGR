import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Event, EventListItem, eventService } from '@/services/eventService';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Ticket, 
  Tag, 
  Info, 
  ExternalLink, 
  User, 
  ChevronLeft, 
  Share2, 
  CalendarDays, 
  Building,
  Music,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, formatDistance, parseISO } from 'date-fns';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import EventCard from '@/components/EventCard';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the event details
        const eventData = await eventService.getEventById(id);
        
        if (!eventData) {
          setError(t('eventDetail.error.notFound', 'Event not found'));
          return;
        }
        
        setEvent(eventData);
        
        // If the event has artists, fetch their other events
        if (eventData.artists && eventData.artists.length > 0) {
          // Use the first artist to find related events
          const artistEvents = await eventService.getEventsByArtist(eventData.artists[0].id, 3);
          
          // Filter out the current event from related events
          const filtered = artistEvents.filter(e => e.id !== id);
          setRelatedEvents(filtered);
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError(t('eventDetail.error.loading', 'Failed to load event details'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEventData();
  }, [id, t]);
  
  // Format the event date/time
  const formattedDate = event?.startDate 
    ? format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')
    : null;
    
  const formattedTime = event?.startDate 
    ? format(new Date(event.startDate), 'h:mm a')
    : null;
    
  const timeFromNow = event?.startDate
    ? formatDistance(new Date(event.startDate), new Date(), { addSuffix: true })
    : null;
  
  // Get the event type display name
  const getEventTypeLabel = () => {
    if (!event?.eventType) return 'Event';
    
    switch(event.eventType) {
      case 'concert': return t('eventTypes.concert', 'Concert');
      case 'dance_contest': return t('eventTypes.dance_contest', 'Dance Contest');
      case 'festival': return t('eventTypes.festival', 'Festival');
      case 'exhibition': return t('eventTypes.exhibition', 'Exhibition');
      case 'workshop': return t('eventTypes.workshop', 'Workshop');
      case 'street_event': return t('eventTypes.street_event', 'Street Event');
      default: return event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);
    }
  };
  
  // Badge color based on event type
  const getBadgeStyle = () => {
    if (!event?.eventType) return 'bg-gray-600';
    
    switch(event.eventType) {
      case 'concert': return 'bg-indigo-600';
      case 'dance_contest': return 'bg-orange-600';
      case 'festival': return 'bg-purple-600';
      case 'exhibition': return 'bg-teal-600';
      case 'workshop': return 'bg-blue-600';
      case 'street_event': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };
  
  // Share event function
  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'Event',
        text: `Check out this ${getEventTypeLabel()}: ${event?.title}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback - copy link to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert(t('eventDetail.share.copied', 'Link copied to clipboard!'));
      }).catch(err => {
        console.error('Error copying link:', err);
      });
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Skeleton for banner image */}
          <Skeleton className="w-full h-72 rounded-xl mb-8" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Skeleton for title */}
              <Skeleton className="h-10 w-3/4 mb-4" />
              
              {/* Skeleton for event meta */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-8 w-36" />
              </div>
              
              {/* Skeleton for description */}
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4 mb-8" />
            </div>
            
            <div>
              {/* Skeleton for info card */}
              <Skeleton className="w-full h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-lg mx-auto">
            <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">
              {error || t('eventDetail.error.notFound', 'Event not found')}
            </h1>
            <p className="text-slate-400 mb-6">
              {t('eventDetail.error.message', 'The event you are looking for may have been removed or is no longer available.')}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => navigate('/events')}>
                {t('eventDetail.error.browseEvents', 'Browse Events')}
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                {t('eventDetail.error.tryAgain', 'Try Again')}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <>
      <SEO
        title={`${event.title} | ${getEventTypeLabel()} in ${event.city}`}
        description={event.description || `Join us for this exciting ${getEventTypeLabel().toLowerCase()} in ${event.city}!`}
        type="event"
        section={t('events.seo.section', 'Events')}
        image={event.images?.poster}
      />
      <Layout>
        {/* Back button */}
        <div className="container mx-auto px-4 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4 text-slate-400 border-slate-800"
            onClick={() => navigate('/events')}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('eventDetail.backToEvents', 'Back to Events')}
          </Button>
        </div>
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {event.images?.poster && (
              <img 
                src={event.images.poster} 
                alt={event.title} 
                className="w-full h-full object-cover blur-sm"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Event poster */}
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="rounded-xl overflow-hidden shadow-2xl shadow-indigo-900/20 border border-slate-800 aspect-[2/3] bg-slate-900">
                  {event.images?.poster ? (
                    <img 
                      src={event.images.poster} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
                      <Calendar className="h-16 w-16 text-white/70" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Event details */}
              <div className="lg:col-span-8 xl:col-span-9">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={`${getBadgeStyle()} px-3 py-1`}>
                    {getEventTypeLabel()}
                  </Badge>
                  
                  {event.isFeatured && (
                    <Badge className="bg-yellow-600 px-3 py-1">
                      {t('eventDetail.featured', 'Featured')}
                    </Badge>
                  )}
                  
                  {event.status !== 'upcoming' && (
                    <Badge 
                      className={
                        event.status === 'ongoing' ? 'bg-green-600' :
                        event.status === 'completed' ? 'bg-slate-600' :
                        event.status === 'canceled' ? 'bg-red-600' : 'bg-slate-600'
                      }
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {event.title}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-slate-300">
                    <CalendarDays className="h-5 w-5 mr-2 text-indigo-400" />
                    <div>
                      <div>{formattedDate}</div>
                      {timeFromNow && (
                        <div className="text-sm text-slate-400">{timeFromNow}</div>
                      )}
                    </div>
                  </div>
                  
                  {formattedTime && (
                    <div className="flex items-center text-slate-300">
                      <Clock className="h-5 w-5 mr-2 text-indigo-400" />
                      <span>{formattedTime}</span>
                    </div>
                  )}
                  
                  <div className="flex items-start text-slate-300">
                    <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-indigo-400" />
                    <div>
                      <div>{event.venueName}</div>
                      {event.address && (
                        <div className="text-sm text-slate-400">{event.address}, {event.city}</div>
                      )}
                    </div>
                  </div>
                  
                  {event.organizer && (
                    <div className="flex items-center text-slate-300">
                      <Building className="h-5 w-5 mr-2 text-indigo-400" />
                      <span>{event.organizer}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  {event.ticketUrl && (
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700" 
                      size="lg"
                      onClick={() => window.open(event.ticketUrl, '_blank')}
                    >
                      <Ticket className="mr-2 h-5 w-5" />
                      {t('eventDetail.getTickets', 'Get Tickets')}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="lg" onClick={shareEvent}>
                    <Share2 className="mr-2 h-5 w-5" />
                    {t('eventDetail.share', 'Share')}
                  </Button>
                </div>
                
                {event.priceInfo && (
                  <div className="mb-4 bg-slate-900/60 border border-slate-800 rounded-lg p-4 inline-flex items-center max-w-md">
                    <Info className="h-5 w-5 mr-3 text-yellow-500" />
                    <span className="text-slate-300">{event.priceInfo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Description */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {t('eventDetail.about', 'About This Event')}
                </h2>
                <div className="prose prose-slate prose-invert max-w-none">
                  {event.description ? (
                    <p className="text-slate-300 whitespace-pre-line">
                      {event.description}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">
                      {t('eventDetail.noDescription', 'No description provided.')}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Artist Lineup */}
              {event.artists && event.artists.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Music className="mr-2 h-5 w-5 text-indigo-400" />
                    {t('eventDetail.lineup', 'Artist Lineup')}
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {event.artists.map(artist => (
                      <Link 
                        key={artist.id} 
                        to={`/artist/${artist.id}`}
                        className="group flex flex-col items-center bg-slate-900/60 border border-slate-800 hover:border-indigo-900/50 rounded-lg p-4 transition-colors"
                      >
                        <div className="w-16 h-16 mb-3 rounded-full overflow-hidden bg-slate-800">
                          {artist.images?.avatar ? (
                            <img 
                              src={artist.images.avatar} 
                              alt={artist.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800">
                              <User className="h-8 w-8 text-slate-600" />
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-white font-medium text-center">
                          {artist.name}
                        </h3>
                        
                        {artist.isHeadliner && (
                          <Badge className="mt-2 bg-indigo-900/70">
                            {t('eventDetail.headliner', 'Headliner')}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Venue/Location */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-indigo-400" />
                  {t('eventDetail.venue', 'Venue')}
                </h2>
                
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
                  {event.locationLat && event.locationLng ? (
                    <div className="h-72">
                      <iframe
                        title={event.venueName}
                        className="w-full h-full border-0"
                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${event.locationLat},${event.locationLng}&zoom=15`}
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="h-72 bg-slate-900 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500">
                          {t('eventDetail.noMap', 'Map not available')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {event.venueName}
                    </h3>
                    <p className="text-slate-400">
                      {event.address || ''} {event.address ? ',' : ''} {event.city}
                      {event.postalCode ? `, ${event.postalCode}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-4">
              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Tag className="mr-2 h-4 w-4 text-indigo-400" />
                    {t('eventDetail.tags', 'Tags')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="border-slate-700 text-slate-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-indigo-400" />
                    {t('eventDetail.relatedEvents', 'Related Events')}
                  </h3>
                  
                  <div className="space-y-3">
                    {relatedEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        variant="compact" 
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Event Info Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Info className="mr-2 h-4 w-4 text-indigo-400" />
                  {t('eventDetail.eventInfo', 'Event Information')}
                </h3>
                
                <ul className="space-y-4">
                  <li className="flex">
                    <Calendar className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-400">
                        {t('eventDetail.date', 'Date')}
                      </p>
                      <p className="text-white">
                        {formattedDate || t('eventDetail.tba', 'TBA')}
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <Clock className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-400">
                        {t('eventDetail.time', 'Time')}
                      </p>
                      <p className="text-white">
                        {formattedTime || t('eventDetail.tba', 'TBA')}
                      </p>
                    </div>
                  </li>
                  
                  <li className="flex">
                    <MapPin className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-400">
                        {t('eventDetail.location', 'Location')}
                      </p>
                      <p className="text-white">
                        {event.venueName}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {event.city}
                      </p>
                    </div>
                  </li>
                  
                  {event.organizer && (
                    <li className="flex">
                      <Users className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-400">
                          {t('eventDetail.organizer', 'Organizer')}
                        </p>
                        <p className="text-white">
                          {event.organizer}
                        </p>
                      </div>
                    </li>
                  )}
                  
                  {event.ticketUrl && (
                    <li className="pt-2">
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => window.open(event.ticketUrl, '_blank')}
                      >
                        <Ticket className="mr-2 h-4 w-4" />
                        {t('eventDetail.getTickets', 'Get Tickets')}
                      </Button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default EventDetailPage; 