import React, { useState, useEffect } from 'react';
import { Rocket, Flame, Flag, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { formatNumber } from '../utils/format';

export interface ReactionCounts {
  rocket: number;
  fire: number;
  poop: number;
  flag: number;
}

interface CompactArtistReactionsProps {
  artistId: string;
  className?: string;
}

const CompactArtistReactions: React.FC<CompactArtistReactionsProps> = ({ artistId, className = '' }) => {
  const [counts, setCounts] = useState<ReactionCounts>({ rocket: 0, fire: 0, poop: 0, flag: 0 });
  const [userReactions, setUserReactions] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [rateLimit, setRateLimit] = useState(false);
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);

  // Reaction descriptions
  const reactionDescriptions = {
    rocket: "Boost this artist",
    fire: "Love this artist",
    poop: "Hate this artist",
    flag: "This artist is a red flag"
  };

  // Check if the user has reached the rate limit for this specific artist
  const checkRateLimit = (): boolean => {
    // Get all reactions from localStorage
    const allReactions = JSON.parse(localStorage.getItem('ug_reactions') || '{}');
    
    // Filter for only this artist's reactions within the last hour
    const artistReactionsInLastHour = Object.entries(allReactions)
      .filter(([key, timestamp]: [string, number]) => {
        const isForThisArtist = key.startsWith(`${artistId}_`);
        const isWithinLastHour = Date.now() - timestamp < 3600000; // 1 hour in milliseconds
        return isForThisArtist && isWithinLastHour;
      });
    
    // User is rate limited if they've reacted 3 or more times to this artist in the last hour
    return artistReactionsInLastHour.length >= 3;
  };

  // Track user reactions in localStorage
  const trackReaction = (reactionType: string): void => {
    const reactions = JSON.parse(localStorage.getItem('ug_reactions') || '{}');
    reactions[`${artistId}_${reactionType}_${Date.now()}`] = Date.now();
    localStorage.setItem('ug_reactions', JSON.stringify(reactions));
  };
  
  // Check if user has already reacted with this type
  const hasUserReacted = (reactionType: string): boolean => {
    const artistReactions = JSON.parse(localStorage.getItem(`ug_artist_${artistId}`) || '{}');
    return artistReactions[reactionType] || false;
  };
  
  // Record that user has reacted with this type
  const recordUserReaction = (reactionType: string): void => {
    const artistReactions = JSON.parse(localStorage.getItem(`ug_artist_${artistId}`) || '{}');
    artistReactions[reactionType] = true;
    localStorage.setItem(`ug_artist_${artistId}`, JSON.stringify(artistReactions));
  };

  // Hide popup after a delay
  useEffect(() => {
    if (showRateLimitPopup) {
      const timer = setTimeout(() => {
        setShowRateLimitPopup(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showRateLimitPopup]);

  // Load existing reactions for this artist
  useEffect(() => {
    const loadReactions = async () => {
      try {
        setIsLoading(true);
        
        // Get reaction counts directly from the artists table
        const { data, error } = await supabase
          .from('artists')
          .select('rocket_count, fire_count, poop_count, flag_count')
          .eq('id', artistId)
          .single();
        
        if (error) {
          // For new artists or if the columns aren't ready yet, don't throw
          if (error.code !== 'PGRST116') {
            throw error;
          }
        }
        
        // Initialize with zeros or use data if available
        if (data) {
          setCounts({
            rocket: data.rocket_count || 0,
            fire: data.fire_count || 0,
            poop: data.poop_count || 0,
            flag: data.flag_count || 0
          });
        }
        
        // Check if user has already reacted to this artist
        const artistReactions = JSON.parse(localStorage.getItem(`ug_artist_${artistId}`) || '{}');
        setUserReactions(artistReactions);
        
        // Check rate limit for this specific artist
        setRateLimit(checkRateLimit());
        
      } catch (error) {
        console.error('Error loading reactions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReactions();
  }, [artistId]);

  // Handle reaction click
  const handleReactionClick = async (e: React.MouseEvent, reactionType: keyof ReactionCounts) => {
    e.preventDefault(); // Prevent navigation when inside a link
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      // Check if user already reacted with this type
      if (hasUserReacted(reactionType)) {
        toast({
          title: "Already reacted",
          description: "You've already used this reaction!",
          variant: "default",
        });
        return;
      }
      
      // Check rate limit for this artist
      if (rateLimit) {
        // Show the popup
        setShowRateLimitPopup(true);
        
        toast({
          title: "Too many reactions",
          description: "You can only react 3 times per hour to this artist. Try again later!",
          variant: "destructive",
        });
        return;
      }
      
      // Call the increment function
      const { error } = await supabase.rpc(
        'increment_artist_reaction',
        { 
          artist_id: artistId,
          reaction_type: reactionType
        }
      );
      
      if (error) throw error;
      
      // Update local state
      setCounts(prev => ({
        ...prev,
        [reactionType]: prev[reactionType] + 1
      }));
      
      // Record this reaction in localStorage
      recordUserReaction(reactionType);
      setUserReactions(prev => ({
        ...prev,
        [reactionType]: true
      }));
      
      // Track for rate limiting
      trackReaction(reactionType);
      const isNowRateLimited = checkRateLimit();
      setRateLimit(isNowRateLimited);
      
      // If this reaction pushed them to the rate limit, show the popup
      if (isNowRateLimited) {
        setShowRateLimitPopup(true);
      }
      
      toast({
        title: "Reaction added!",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  // Render emoji buttons with dynamic state
  const renderReactionButton = (type: keyof ReactionCounts, icon: React.ReactNode, label: string) => {
    const hasReacted = userReactions[type];
    const count = counts[type];
    
    return (
      <button
        onClick={(e) => handleReactionClick(e, type)}
        disabled={isLoading || hasReacted || rateLimit}
        className={`flex flex-col items-center rounded-md p-2 mx-1 transition-colors ${
          hasReacted 
            ? 'text-indigo-400 cursor-default' 
            : 'text-gray-400 hover:text-white hover:bg-indigo-900/30 cursor-pointer'
        }`}
        title={reactionDescriptions[type]}
      >
        <div className="mb-1">
          {icon}
        </div>
        <span className="text-xs font-medium">{formatNumber(count)}</span>
      </button>
    );
  };

  if (isLoading) {
    return <div className={`h-6 ${className}`}></div>;
  }

  return (
    <div className="relative">
      <div className={`flex items-center ${className}`}>
        {renderReactionButton('rocket', <span className="text-xl">🚀</span>, "Boost this artist")}
        {renderReactionButton('fire', <span className="text-xl">🔥</span>, "Love this artist")}
        {renderReactionButton('poop', <span className="text-xl">💩</span>, "Hate this artist")}
        {renderReactionButton('flag', <span className="text-xl">🚩</span>, "This artist is a red flag")}
      </div>
      
      {/* Rate limit popup */}
      {showRateLimitPopup && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap animate-bounce">
          <div className="flex items-center font-bold">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Don't spam!
          </div>
          <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-red-600"></div>
        </div>
      )}
    </div>
  );
};

export default CompactArtistReactions; 