import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, User, Search, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const Mentors = () => {
  const [mentorsData, setMentorsData] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("All Fields");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  // Define all fields including the new ones
  const allFieldsList = [
    "All Fields",
    "Software Development",
    "Doctor",
    "Assisting in PhD",
    "Police",
    "Cinema Field",
    "Dancing",
    "Chartered Accountant (CA)",
    "Finance",
    "Lawyer",
    "Teacher",
    "Data Scientist",
    "Mechanical Engineer",
    "Civil Engineer",
    "Marketing",
    "Business Analyst",
    "Entrepreneur",
    "Consultant",
    "Psychologist",
    "Journalist",
    "Others",
  ];

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/mentors");
        setMentorsData(response.data);
        setFilteredMentors(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch mentors");
        setLoading(false);
        console.error("Error fetching mentors:", err);
      }
    };

    fetchMentors();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  // Filter mentors based on search term and selected field
  useEffect(() => {
    const filterMentors = () => {
      let filtered = [...mentorsData];

      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter((mentor) => {
          const nameMatch = mentor.name?.toLowerCase().includes(searchLower);
          const experienceMatch = mentor.experience?.toLowerCase().includes(searchLower);
          const keywordsMatch = mentor.keywords?.some(keyword => 
            keyword.toLowerCase().includes(searchLower)
          );
          return nameMatch || experienceMatch || keywordsMatch;
        });
      }

      // Filter by field
      if (selectedField !== "All Fields") {
        filtered = filtered.filter((mentor) => mentor.field === selectedField);
      }

      setFilteredMentors(filtered);
    };

    filterMentors();
  }, [searchTerm, selectedField, mentorsData]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFieldChange = (value) => {
    setSelectedField(value);
  };

  const handleStartChat = (mentor) => {
    if (userRole === 'mentor') {
      toast.error("As a mentor, you cannot initiate conversations.");
      return;
    }

    navigate(`/profile?mentor=${mentor._id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Mentors</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center mb-8">
        <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Find Your Mentor</h1>
          <p className="text-gray-600 max-w-xl">
            Connect with experienced professionals who can guide you through your learning journey
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, experience or keywords..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={selectedField} onValueChange={handleFieldChange}>
            <SelectTrigger className="w-full md:w-[200px] h-11">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {allFieldsList.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor._id} className="hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-600">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-16 w-16 border-1 border-blue-600">
                <AvatarFallback className="bg-primary/5 text-primary text-xl font-semibold">
                  {mentor.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{mentor.name}</h3>
                <p className="text-sm text-gray-500">{mentor.field}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-gray-600 mb-4 line-clamp-3">
                {mentor.experience || "No experience details available"}
              </p>
              <div className="flex flex-wrap gap-2">
                {mentor.keywords?.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-2">
              <Button 
                className="w-full" 
                variant={userRole === 'mentor' ? "secondary" : "default"}
                onClick={() => handleStartChat(mentor)}
              >
                {userRole === 'mentor' ? "Cannot Start Chat" : "Start Chat"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Mentors;


