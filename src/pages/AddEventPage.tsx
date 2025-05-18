import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Camera, MapPin, ExternalLink, CalendarCheck, Tag, Users, Save, Euro, Clock } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { format, set } from 'date-fns';
import SEO from '../components/SEO';
import { artistService, ArtistOption } from '@/services/artistService';
import { MultiSelect } from '@/components/ui/multiselect';
import { PriceTierEditor, PriceTier } from '@/components/ui/price-tier-editor';
import { TimePickerInput } from '@/components/ui/time-picker';
import { CustomDateTimePicker } from "@/components/ui/custom-date-time-picker";

// UI Components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

/* SQL to create required stored procedures in Supabase SQL Editor:

-- Add JSON pricing column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '[]'::jsonb;

-- Drop the old function first if it exists with price tier parameters
DROP FUNCTION IF EXISTS admin_create_event(
  text, text, timestamp with time zone, timestamp with time zone, 
  text, text, text, text, text, text, text, text, boolean,
  integer, text, integer, text, integer, text
);

-- Create the admin_create_event function with JSON pricing parameter
CREATE OR REPLACE FUNCTION admin_create_event(
  p_title TEXT,
  p_description TEXT,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE,
  p_venue_name TEXT,
  p_address TEXT,
  p_city TEXT,
  p_postal_code TEXT,
  p_event_type TEXT,
  p_ticket_url TEXT,
  p_organizer TEXT,
  p_is_featured BOOLEAN,
  p_pricing JSON
) RETURNS UUID
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO events (
    title, description, start_date, end_date, venue_name, address,
    city, postal_code, event_type, ticket_url, organizer, 
    status, is_featured, pricing
  ) VALUES (
    p_title, p_description, p_start_date, p_end_date, p_venue_name, p_address,
    p_city, p_postal_code, p_event_type, p_ticket_url, p_organizer,
    'upcoming', p_is_featured, p_pricing::JSONB
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Create the admin_add_event_image function
CREATE OR REPLACE FUNCTION admin_add_event_image(
  p_event_id UUID,
  p_url TEXT,
  p_image_type TEXT,
  p_position INTEGER
) RETURNS VOID
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  INSERT INTO event_images (event_id, url, image_type, position)
  VALUES (p_event_id, p_url, p_image_type, p_position);
END;
$$ LANGUAGE plpgsql;

-- Create the admin_add_event_tag function
CREATE OR REPLACE FUNCTION admin_add_event_tag(
  p_event_id UUID,
  p_tag TEXT
) RETURNS VOID
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  INSERT INTO event_tags (event_id, tag)
  VALUES (p_event_id, p_tag);
END;
$$ LANGUAGE plpgsql;

-- Create the admin_add_event_artist_id function (by artist ID)
CREATE OR REPLACE FUNCTION admin_add_event_artist_id(
  p_event_id UUID,
  p_artist_id TEXT,
  p_is_headliner BOOLEAN
) RETURNS VOID
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  INSERT INTO event_artists (event_id, artist_id, is_headliner)
  VALUES (p_event_id, p_artist_id, p_is_headliner);
END;
$$ LANGUAGE plpgsql;

-- Create the admin_add_event_artist function (by artist name - legacy)
CREATE OR REPLACE FUNCTION admin_add_event_artist(
  p_event_id UUID,
  p_artist_name TEXT,
  p_is_headliner BOOLEAN
) RETURNS VOID
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  INSERT INTO event_artists (event_id, artist_name, is_headliner)
  VALUES (p_event_id, p_artist_name, p_is_headliner);
END;
$$ LANGUAGE plpgsql;

*/

// Validation schema
const eventFormSchema = z.object({
  title: z.string().min(3, {
    message: "Event title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Event description must be at least 10 characters."
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  startTimeHour: z.number().min(0).max(23).default(18), // Default to 6:00 PM
  startTimeMinute: z.number().min(0).max(59).default(0),
  endDate: z.date().optional(),
  endTimeHour: z.number().min(0).max(23).optional(),
  endTimeMinute: z.number().min(0).max(59).optional(),
  venueName: z.string().min(3, {
    message: "Venue name is required."
  }),
  address: z.string().optional(),
  city: z.string().min(1, {
    message: "City is required."
  }),
  postalCode: z.string().optional(),
  eventType: z.string({
    required_error: "Please select an event type.",
  }),
  ticketUrl: z.string().url().optional().or(z.literal('')),
  priceTiers: z.array(
    z.object({
      label: z.string().min(1, { message: "Tier label is required" }),
      price: z.coerce.number().min(0, { message: "Price must be a positive number" })
    })
  )
  .default([{ label: "Entrance", price: 0 }])
  .refine(
    tiers => tiers.every(tier => tier.label.trim() !== '' && tier.price >= 0),
    { message: "All price tiers must have a label and a valid price" }
  ),
  organizer: z.string().optional(),
  posterUrl: z.string().url({
    message: "Please enter a valid URL for the poster image."
  }).min(1, { message: "Poster URL is required" }),
  isFeatured: z.boolean().default(false),
  artistIds: z.array(z.string()).optional(),
  tags: z.string().min(1, { message: "At least one tag is required" }),
});

// Default cities and event types (same as in EventsPage)
const CITIES = [
  { value: 'Athens', label: 'Athens' },
  { value: 'Thessaloniki', label: 'Thessaloniki' },
  { value: 'Patras', label: 'Patras' },
  { value: 'Heraklion', label: 'Heraklion' },
  { value: 'Larissa', label: 'Larissa' },
];

const EVENT_TYPES = [
  { value: 'concert', label: 'Concert' },
  { value: 'festival', label: 'Festival' },
  { value: 'dance_contest', label: 'Dance Contest' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'street_event', label: 'Street Event' },
];

type EventFormValues = z.infer<typeof eventFormSchema>;

const AddEventPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);
  const [artistsLoaded, setArtistsLoaded] = useState(false); // Track if artists have been loaded

  // Fetch artists for initial dropdown load - only once
  useEffect(() => {
    // Skip if artists are already loaded
    if (artistsLoaded) return;
    
    const fetchArtists = async () => {
      setIsLoadingArtists(true);
      try {
        const artistOptions = await artistService.getArtistsForSelect();
        
        // Just log the count, not the data
        if (artistOptions.length > 0) {
          console.log(`Loaded ${artistOptions.length} artists for dropdown`);
        }
        
        setArtists(artistOptions);
        setArtistsLoaded(true); // Mark artists as loaded
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setIsLoadingArtists(false);
      }
    };

    fetchArtists();
  }, [artistsLoaded]);

  // Function to handle artist search from the dropdown
  const handleArtistSearch = async (searchTerm: string) => {
    if (isSearchingArtists) return; // Prevent concurrent searches
    
    // If no search term or too short, just use what we already have
    if (!searchTerm || searchTerm.trim().length < 2) {
      // If we have all artists loaded already, no need to fetch again
      if (artists.length > 0) {
        return;
      }
      
      // Only load all artists if we haven't already
      const artistOptions = await artistService.getArtistsForSelect();
      setArtists(artistOptions);
      return;
    }
    
    const normalizedSearch = searchTerm.trim().toLowerCase();
    
    // First try to search in our already loaded artists
    if (artists.length > 0) {
      const localResults = artists.filter(artist => 
        artist.label.toLowerCase().includes(normalizedSearch)
      );
      
      // If we found reasonable matches locally, use them without API call
      if (localResults.length > 0) {
        console.log(`Found ${localResults.length} local matches for "${searchTerm}"`);
        setArtists(localResults);
        return;
      }
    }
    
    // Only if local search failed or no artists loaded yet, do a server search
    setIsSearchingArtists(true);
    
    try {
      console.log(`Searching server for "${searchTerm}"`);
      
      // Search for artists with the given term
      const searchResults = await artistService.searchArtists(searchTerm);
      
      if (searchResults.length === 0) {
        // If no results and we don't have artists loaded, try to get all
        if (artists.length === 0) {
          const allArtists = await artistService.getArtistsForSelect();
          setArtists(allArtists);
        }
        // Otherwise keep current filtered results
      } else {
        // Update the artists state with search results
        setArtists(searchResults);
      }
    } catch (error) {
      console.error('Error searching artists:', error);
      
      // In case of error and no current results, try to load all artists
      if (artists.length === 0) {
        try {
          const allArtists = await artistService.getArtistsForSelect();
          setArtists(allArtists);
        } catch (fallbackError) {
          console.error('Failed to load fallback artists:', fallbackError);
        }
      }
    } finally {
      setIsSearchingArtists(false);
    }
  };

  // Initialize the form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      startTimeHour: 18, // 6:00 PM default
      startTimeMinute: 0,
      venueName: '',
      address: '',
      city: '',
      postalCode: '',
      eventType: '',
      ticketUrl: '',
      priceTiers: [
        { label: "Entrance", price: 0 },
      ],
      organizer: '',
      posterUrl: '',
      isFeatured: false,
      artistIds: [],
      tags: '',
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time for start date
      const startDateTime = set(values.startDate, {
        hours: values.startTimeHour || 0,
        minutes: values.startTimeMinute || 0,
        seconds: 0,
        milliseconds: 0
      });
      
      // Combine date and time for end date if it exists
      let endDateTime = null;
      if (values.endDate) {
        endDateTime = set(values.endDate, {
          hours: values.endTimeHour !== undefined ? values.endTimeHour : 23,
          minutes: values.endTimeMinute !== undefined ? values.endTimeMinute : 59,
          seconds: 59,
          milliseconds: 0
        });
      }
      
      // Format dates for database insertion
      const formattedStartDate = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
      const formattedEndDate = endDateTime 
        ? format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss")
        : null;
      
      // Process tags
      const tagsList = values.tags 
        ? values.tags.split(',').map(tag => tag.trim()) 
        : [];
      
      let eventId;
        
      try {
        // Method 1: Try using supabaseAdmin with service role first
        
        // Filter out any incomplete tiers
        const validTiers = values.priceTiers.filter(tier => 
          tier.label.trim() !== '' && tier.price >= 0
        );
        
        // Ensure at least one valid price tier
        if (validTiers.length === 0) {
          toast({
            title: "Validation Error",
            description: "At least one valid price tier is required.",
            variant: "destructive",
          });
          return;
        }
        
        const { data: eventData, error: eventError } = await supabaseAdmin
          .from('events')
          .insert({
            title: values.title,
            description: values.description,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            venue_name: values.venueName,
            address: values.address,
            city: values.city,
            postal_code: values.postalCode,
            event_type: values.eventType,
            ticket_url: values.ticketUrl || null,
            organizer: values.organizer || null,
            status: 'upcoming',
            is_featured: values.isFeatured,
            pricing: JSON.stringify(validTiers)
          })
          .select('id')
          .single();
          
        if (eventError) {
          console.error("Admin client method failed:", eventError);
          throw eventError;
        }
        
        eventId = eventData.id;
        console.log("Event created with admin client, ID:", eventId);
      } catch (adminError) {
        // Method 2: If admin client fails, try using a stored procedure
        console.log("Trying alternative method via stored procedure...");
        
        // Filter out any incomplete tiers (in case we reach this code path)
        const validTiers = values.priceTiers.filter(tier => 
          tier.label.trim() !== '' && tier.price >= 0
        );
        
        // Ensure at least one valid price tier
        if (validTiers.length === 0) {
          toast({
            title: "Validation Error",
            description: "At least one valid price tier is required.",
            variant: "destructive",
          });
          return;
        }
        
        const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('admin_create_event', {
          p_title: values.title,
          p_description: values.description,
          p_start_date: formattedStartDate,
          p_end_date: formattedEndDate,
          p_venue_name: values.venueName,
          p_address: values.address,
          p_city: values.city,
          p_postal_code: values.postalCode,
          p_event_type: values.eventType,
          p_ticket_url: values.ticketUrl || null,
          p_organizer: values.organizer || null,
          p_is_featured: values.isFeatured,
          p_pricing: JSON.stringify(validTiers)
        });
        
        if (rpcError) {
          console.error("RPC method also failed:", rpcError);
          throw new Error(`Could not create event using any method. ${rpcError.message}`);
        }
        
        eventId = rpcData;
        console.log("Event created with RPC, ID:", eventId);
      }
      
      if (!eventId) {
        throw new Error('Failed to get event ID after creation');
      }
      
      // Create event image if poster URL is provided
      if (values.posterUrl) {
        try {
          const { error: imageError } = await supabaseAdmin
            .from('event_images')
            .insert({
              event_id: eventId,
              url: values.posterUrl,
              image_type: 'poster',
              position: 0
            });
            
          if (imageError) {
            console.error('Error adding poster image with admin client:', imageError);
            throw imageError;
          }
        } catch (imageError) {
          // Try RPC fallback
          const { error: rpcError } = await supabaseAdmin.rpc('admin_add_event_image', {
            p_event_id: eventId,
            p_url: values.posterUrl,
            p_image_type: 'poster',
            p_position: 0
          });
          
          if (rpcError) {
            console.error('Failed to add poster image with RPC method:', rpcError);
          }
        }
      }
      
      // Add tags
      if (tagsList.length > 0) {
        try {
          const tagsToInsert = tagsList.map(tag => ({
            event_id: eventId,
            tag
          }));
          
          const { error: tagsError } = await supabaseAdmin
            .from('event_tags')
            .insert(tagsToInsert);
            
          if (tagsError) {
            console.error('Error adding tags with admin client:', tagsError);
            throw tagsError;
          }
        } catch (tagsError) {
          // Try adding tags one by one via RPC
          for (const tag of tagsList) {
            const { error: rpcError } = await supabaseAdmin.rpc('admin_add_event_tag', {
              p_event_id: eventId,
              p_tag: tag
            });
            
            if (rpcError) {
              console.error(`Failed to add tag "${tag}" with RPC method:`, rpcError);
            }
          }
        }
      }
      
      // Process selected artists
      if (values.artistIds && values.artistIds.length > 0) {
        for (const artistId of values.artistIds) {
          try {
            const { error: artistError } = await supabaseAdmin
              .from('event_artists')
              .insert({
                event_id: eventId,
                artist_id: artistId,
                is_headliner: false // Default to not headliner
              });
              
            if (artistError) {
              console.error(`Error adding artist ${artistId} with admin client:`, artistError);
              throw artistError;
            }
          } catch (artistError) {
            // Try RPC fallback
            const { error: rpcError } = await supabaseAdmin.rpc('admin_add_event_artist_id', {
              p_event_id: eventId,
              p_artist_id: artistId,
              p_is_headliner: false
            });
            
            if (rpcError) {
              console.error(`Failed to add artist "${artistId}" with RPC method:`, rpcError);
            }
          }
        }
      }
      
      // Show success message
      toast({
        title: "Event Created!",
        description: "Your event has been added successfully.",
      });
      
      // Redirect to the events page
      navigate('/events');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "There was a problem creating your event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title={t('events.add.seo.title', 'Add New Event | Urban Greece')}
        description={t('events.add.seo.description', 'Add a new urban culture event to our platform. Concerts, festivals, exhibitions and more.')}
        type="website"
      />
      
      <Layout>
        <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {t('events.add.title', 'Add New Event')}
                </h1>
                <p className="text-lg text-slate-300">
                  {t('events.add.subtitle', 'Create a new event to share with the community')}
                </p>
              </div>
              
              {/* Form */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 md:p-8 shadow-xl">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information */}
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-indigo-400" />
                        {t('events.add.basicInfo', 'Basic Information')}
                      </h2>
                      <Separator className="mb-6 bg-slate-700" />
                      
                      <div className="grid grid-cols-1 gap-6">
                        {/* Title */}
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.title.label', 'Event Title')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('events.add.title.placeholder', 'Enter event title')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Description */}
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.description.label', 'Description')}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder={t('events.add.description.placeholder', 'Describe the event')} 
                                  className="min-h-32"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Event Type */}
                        <FormField
                          control={form.control}
                          name="eventType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.type.label', 'Event Type')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('events.add.type.placeholder', 'Select event type')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EVENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Start Date and Time - Integrated */}
                          <div>
                            <FormField
                              control={form.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>{t('events.add.startDate.label', 'Start Date & Time')}</FormLabel>
                                  <FormControl>
                                    <CustomDateTimePicker
                                      value={field.value}
                                      onChange={(date) => {
                                        field.onChange(date);
                                        form.setValue('startTimeHour', date.getHours());
                                        form.setValue('startTimeMinute', date.getMinutes());
                                      }}
                                      disabled={isSubmitting}
                                      placeholder={t('events.add.startDate.placeholder', 'Select date and time')}
                                      minDate={new Date()}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          {/* End Date and Time - Integrated */}
                          <div>
                            <FormField
                              control={form.control}
                              name="endDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>{t('events.add.endDate.label', 'End Date & Time (Optional)')}</FormLabel>
                                  <FormControl>
                                    <CustomDateTimePicker
                                      value={field.value || undefined}
                                      onChange={(date) => {
                                        field.onChange(date);
                                        form.setValue('endTimeHour', date.getHours());
                                        form.setValue('endTimeMinute', date.getMinutes());
                                      }}
                                      disabled={isSubmitting}
                                      placeholder={t('events.add.endDate.placeholder', 'Select date and time')}
                                      minDate={form.getValues("startDate") || new Date()}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-indigo-400" />
                        {t('events.add.location.title', 'Location')}
                      </h2>
                      <Separator className="mb-6 bg-slate-700" />
                      
                      <div className="grid grid-cols-1 gap-6">
                        {/* Venue Name */}
                        <FormField
                          control={form.control}
                          name="venueName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.venueName.label', 'Venue Name')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('events.add.venueName.placeholder', 'Enter venue name')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Address */}
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.address.label', 'Address (Optional)')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('events.add.address.placeholder', 'Enter address')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* City */}
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('events.add.city.label', 'City')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('events.add.city.placeholder', 'Select city')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {CITIES.map((city) => (
                                      <SelectItem key={city.value} value={city.value}>
                                        {city.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Postal Code */}
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('events.add.postalCode.label', 'Postal Code (Optional)')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('events.add.postalCode.placeholder', 'Enter postal code')} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Details */}
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Tag className="h-5 w-5 mr-2 text-indigo-400" />
                        {t('events.add.additionalDetails.title', 'Additional Details')}
                      </h2>
                      <Separator className="mb-6 bg-slate-700" />
                      
                      <div className="grid grid-cols-1 gap-6">
                        {/* Ticket URL */}
                        <FormField
                          control={form.control}
                          name="ticketUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.ticketUrl.label', 'Ticket URL (Optional)')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('events.add.ticketUrl.placeholder', 'Enter ticket URL')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Price Tiers */}
                        <FormField
                          control={form.control}
                          name="priceTiers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.priceTiers.label', 'Price Tiers')}</FormLabel>
                              <FormControl>
                                <PriceTierEditor
                                  value={field.value as PriceTier[]}
                                  onChange={field.onChange}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormDescription>
                                {t('events.add.priceTiers.description', 'Add as many pricing tiers as needed (e.g., Early Bird, Regular, VIP). All prices are in euros (€).')}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Organizer */}
                        <FormField
                          control={form.control}
                          name="organizer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.organizer.label', 'Organizer (Optional)')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('events.add.organizer.placeholder', 'Enter organizer name')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Artists */}
                        <FormField
                          control={form.control}
                          name="artistIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.artists.label', 'Artists')}</FormLabel>
                              <FormControl>
                                <MultiSelect
                                  options={artists}
                                  selected={field.value || []}
                                  onChange={field.onChange}
                                  placeholder={t('events.add.artists.placeholder', 'Select artists')}
                                  emptyMessage={isLoadingArtists ? "Loading artists..." : "No artists found"}
                                  disabled={isLoadingArtists}
                                  className="bg-background border-input"
                                  onSearch={handleArtistSearch}
                                  isSearching={isSearchingArtists}
                                  serverSideSearch={true}
                                />
                              </FormControl>
                              <FormDescription>
                                {t('events.add.artists.description', 'Select artists from our database who will perform at this event')}
                                {artists.length > 0 && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({artists.length} artists {isSearchingArtists ? "searching..." : "found"})
                                  </span>
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Tags */}
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.tags.label', 'Tags (Required, comma separated)')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('events.add.tags.placeholder', 'e.g. hiphop, livemusic, urban')} {...field} />
                              </FormControl>
                              <FormDescription>
                                {t('events.add.tags.description', 'Separate multiple tags with commas')}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Media */}
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Camera className="h-5 w-5 mr-2 text-indigo-400" />
                        {t('events.add.media.title', 'Media')}
                      </h2>
                      <Separator className="mb-6 bg-slate-700" />
                      
                      <div className="grid grid-cols-1 gap-6">
                        {/* Poster URL */}
                        <FormField
                          control={form.control}
                          name="posterUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('events.add.posterUrl.label', 'Poster Image URL (Required)')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('events.add.posterUrl.placeholder', 'Enter poster image URL')} {...field} />
                              </FormControl>
                              <FormDescription>
                                {t('events.add.posterUrl.description', 'Direct link to poster image (JPG, PNG)')}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Is Featured */}
                        <FormField
                          control={form.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  {t('events.add.isFeatured.label', 'Featured Event')}
                                </FormLabel>
                                <FormDescription>
                                  {t('events.add.isFeatured.description', 'Featured events appear in the spotlight section')}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-green-500"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('events.add.submitting', 'Submitting...')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Save className="mr-2 h-5 w-5" />
                          {t('events.add.submit', 'Create Event')}
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AddEventPage; 