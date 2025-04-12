import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, MapPin, Briefcase, MessageSquare } from "lucide-react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import MentorMessagesExample from "./MentorMessagesExample";
import toast from "react-hot-toast";

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get('mentor');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMentors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/mentors`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMentors(response.data);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchUserDetails();
    fetchMentors();
  }, []);

  const handleStartChat = async (mentorId) => {
    try {
      const token = localStorage.getItem("token");
      // Create initial message to start chat
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/messages`,
        {
          recipientId: mentorId,
          content: "Hello! I'd like to start a conversation."
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Navigate to profile with the selected mentor
      navigate(`/profile?mentor=${mentorId}`);
      toast.success('Chat started successfully!');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* User Profile Card */}
      <Card className="max-w-3xl mx-auto mt-12 shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="bg-muted/30 pb-2">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
              <AvatarImage
                src={userDetails?.avatar}
                alt={userDetails?.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-800 text-primary-foreground text-3xl font-semibold">
                {userDetails?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="md:text-left text-center flex-1">
              <h2 className="text-3xl font-bold tracking-tight">
                {userDetails?.name}
              </h2>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground justify-center md:justify-start">
                <Mail size={16} className="opacity-70" />
                <span>{userDetails?.email}</span>
              </div>

              {userDetails?.field && (
                <div className="mt-3">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-sm rounded-full border-primary/20 px-4 py-1.5 "
                  >
                    {userDetails.field}
                  </Badge>
                  {userDetails?.otherField && (
                    <Badge variant="outline" className="ml-2 px-3 py-1">
                      {userDetails.otherField}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-8">
          {userDetails?.experience && (
            <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-muted">
              <div className="flex items-start gap-2 mb-2">
                <Briefcase size={18} className="mt-1 text-muted-foreground" />
                <h3 className="font-medium">Experience</h3>
              </div>
              <p className="text-gray-600 pl-6 text-md">
                {userDetails.experience}
              </p>
            </div>
          )}

          {userDetails?.keywords?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-3 text-sm text-gray-700">
                SKILLS & INTERESTS
              </h3>
              <div className="flex flex-wrap gap-2">
                {userDetails.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 capitalize bg-gray-100 border text-xs"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MentorMessagesExample />
    </div>
  );
};

export default Profile;
