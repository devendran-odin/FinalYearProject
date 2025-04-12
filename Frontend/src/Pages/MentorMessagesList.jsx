
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, MessageCircle } from 'lucide-react';

const MentorMessagesList = ({ mentors = [], isLoading = false, onSelectMentor }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredMentors = mentors.filter(mentor => 
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderLoadingState = () => (
    <div className="p-3 space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex gap-3 items-center animate-pulse">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* Search Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <h3 className="font-semibold text-lg mb-3">My Mentors</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search mentors..."
            className="pl-10 pr-4 py-2 bg-muted/20 focus-visible:ring-primary/30 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Mentors List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          renderLoadingState()
        ) : filteredMentors.length > 0 ? (
          <ul className="divide-y">
            {filteredMentors.map(mentor => (
              <li 
                key={mentor.id}
                className="p-4 hover:bg-muted/30 cursor-pointer transition-colors duration-200"
                onClick={() => onSelectMentor && onSelectMentor(mentor)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {mentor.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {mentor.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-medium truncate">{mentor.name}</h4>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock size={12} className="mr-1" />
                        <span>{mentor.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{mentor.lastMessage}</p>
                    {mentor.expertise && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary font-normal">
                          {mentor.expertise}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-muted-foreground">No mentors found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try changing your search query</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default MentorMessagesList;
