import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from 'lucide-react';

const ChatList = ({ onSelectMentor }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/mentors', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setMentors(response.data);
      } catch (err) {
        setError('Failed to fetch mentors');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {mentors.map((mentor) => (
        <Card
          key={mentor._id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onSelectMentor(mentor._id)}
        >
          <CardContent className="flex items-center space-x-4 p-4">
            <Avatar>
              <AvatarImage src={mentor.profileImage} />
              <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{mentor.name}</h3>
              <p className="text-sm text-muted-foreground">{mentor.field}</p>
            </div>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChatList; 