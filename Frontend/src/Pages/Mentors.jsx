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
import { ChevronLeft, User, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Mentors = () => {
  // Mentor data defined directly in the component
  // This would typically come from an API call to your backend
  const mentorsData = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      field: "Doctor",
      imageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
      description:
        "Experienced physician specializing in internal medicine with 15 years of clinical practice and research.",
      tags: [
        { id: 1, name: "Internal Medicine" },
        { id: 2, name: "Clinical Research" },
        { id: 3, name: "Medical Education" },
      ],
      availability: "Weekdays 5-7 PM EST",
    },
    {
      id: 2,
      name: "Alex Chen",
      field: "Software Development",
      imageUrl: "https://randomuser.me/api/portraits/men/2.jpg",
      description:
        "Full-stack developer with expertise in React, Node.js, and cloud architecture.",
      tags: [
        { id: 4, name: "React" },
        { id: 5, name: "Node.js" },
        { id: 6, name: "AWS" },
      ],
      availability: "Weekends & Thursdays",
    },
    {
      id: 3,
      name: "Maya Patel",
      field: "Finance",
      imageUrl: "https://randomuser.me/api/portraits/women/3.jpg",
      description:
        "Investment banker turned fintech entrepreneur with experience in venture capital and startups.",
      tags: [
        { id: 7, name: "Investments" },
        { id: 8, name: "Fintech" },
        { id: 9, name: "Entrepreneurship" },
      ],
      availability: "Tuesday & Friday evenings",
    },
    {
      id: 4,
      name: "James Wilson",
      field: "Marketing",
      imageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
      description:
        "Digital marketing specialist focused on SEO, content strategy, and growth marketing.",
      tags: [
        { id: 10, name: "SEO" },
        { id: 11, name: "Content Marketing" },
        { id: 12, name: "Analytics" },
      ],
      availability: "Mondays & Wednesdays",
    },
    {
      id: 5,
      name: "Olivia Rodriguez",
      field: "Business Analyst",
      imageUrl: "https://randomuser.me/api/portraits/women/5.jpg",
      description:
        "Business analyst with strong background in data interpretation and strategic business insights for Fortune 500 companies.",
      tags: [
        { id: 13, name: "Data Analysis" },
        { id: 14, name: "Strategic Planning" },
        { id: 15, name: "Process Optimization" },
      ],
      availability: "Flexible hours",
    },
    {
      id: 6,
      name: "David Kim",
      field: "Data Scientist",
      imageUrl: "https://randomuser.me/api/portraits/men/6.jpg",
      description:
        "Data scientist specializing in machine learning models and predictive analytics.",
      tags: [
        { id: 16, name: "Machine Learning" },
        { id: 17, name: "Python" },
        { id: 18, name: "Big Data" },
      ],
      availability: "Weekday evenings",
    },
    {
      id: 7,
      name: "Elena Martinez",
      field: "Lawyer",
      imageUrl: "https://randomuser.me/api/portraits/women/7.jpg",
      description:
        "Corporate attorney with expertise in intellectual property law and technology licensing.",
      tags: [
        { id: 19, name: "Intellectual Property" },
        { id: 20, name: "Corporate Law" },
        { id: 21, name: "Contract Negotiation" },
      ],
      availability: "Tuesdays & Thursdays, 3-6 PM",
    },
    {
      id: 8,
      name: "Michael Taylor",
      field: "Civil Engineer",
      imageUrl: "https://randomuser.me/api/portraits/men/8.jpg",
      description:
        "Structural engineer with experience in sustainable building designs and urban infrastructure projects.",
      tags: [
        { id: 22, name: "Structural Design" },
        { id: 23, name: "Sustainable Building" },
        { id: 24, name: "Project Management" },
      ],
      availability: "Weekdays, 7-9 PM",
    },
    {
      id: 9,
      name: "Sophie Anderson",
      field: "Psychologist",
      imageUrl: "https://randomuser.me/api/portraits/women/9.jpg",
      description:
        "Clinical psychologist specialized in cognitive behavioral therapy and stress management techniques.",
      tags: [
        { id: 25, name: "CBT" },
        { id: 26, name: "Stress Management" },
        { id: 27, name: "Mental Health" },
      ],
      availability: "Weekends, 10 AM-2 PM",
    },
    {
      id: 10,
      name: "Robert Garcia",
      field: "Cinema Field",
      imageUrl: "https://randomuser.me/api/portraits/men/10.jpg",
      description:
        "Film director and cinematographer with experience in independent films and documentary production.",
      tags: [
        { id: 28, name: "Cinematography" },
        { id: 29, name: "Directing" },
        { id: 30, name: "Film Editing" },
      ],
      availability: "Evenings & Weekends",
    },
    {
      id: 11,
      name: "Natalie Wong",
      field: "Dancing",
      imageUrl: "https://randomuser.me/api/portraits/women/11.jpg",
      description:
        "Professional dancer and choreographer specializing in contemporary and jazz dance styles.",
      tags: [
        { id: 31, name: "Contemporary" },
        { id: 32, name: "Jazz" },
        { id: 33, name: "Choreography" },
      ],
      availability: "Mornings & Weekends",
    },
    {
      id: 12,
      name: "Daniel Brown",
      field: "Police",
      imageUrl: "https://randomuser.me/api/portraits/men/12.jpg",
      description:
        "Retired police detective with 20 years of experience in criminal investigations and community policing.",
      tags: [
        { id: 34, name: "Criminal Investigation" },
        { id: 35, name: "Community Policing" },
        { id: 36, name: "Public Safety" },
      ],
      availability: "Flexible availability",
    },
  ];

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

  const [filteredMentors, setFilteredMentors] = useState(mentorsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("All Fields");
  const [allFields, setAllFields] = useState(allFieldsList);

  useEffect(() => {
    // Initial filtering
    filterMentors(searchTerm, selectedField);
  }, []);

  const filterMentors = (search, field) => {
    setSearchTerm(search);
    setSelectedField(field);

    let filtered = mentorsData;

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(searchLower) ||
          mentor.description.toLowerCase().includes(searchLower) ||
          mentor.tags.some((tag) =>
            tag.name.toLowerCase().includes(searchLower)
          )
      );
    }

    // Filter by field
    if (field && field !== "All Fields") {
      filtered = filtered.filter((mentor) => mentor.field === field);
    }

    setFilteredMentors(filtered);
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    filterMentors(newSearchTerm, selectedField);
  };

  const handleFieldChange = (value) => {
    filterMentors(searchTerm, value);
  };

  return (
    <div className="container px-4 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 text-sm"
            >
              <ChevronLeft size={16} />
              <span>Back to Home</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight">
              Find Your{" "}
              <span className="text-blue-700 font-semibold">Mentor </span>
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Connect with experienced professionals who can guide you through
            your learning journey and help you achieve your goals.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Search and Filter */}
      <div
        className="w-full mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="relative flex-grow">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Search size={18} />
          </div>
          <Input
            type="text"
            placeholder="Search by name, skill or expertise..."
            className="pl-10 py-5 bg-background border-input hover:border-primary/30 focus-visible:ring-primary/20 transition-all w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="w-full md:w-64">
          <Select value={selectedField} onValueChange={handleFieldChange}>
            <SelectTrigger className="bg-background py-5 border-input hover:border-primary/30 focus:ring-primary/20 transition-all">
              <SelectValue placeholder="Filter by field" />
            </SelectTrigger>
            <SelectContent>
              {allFields.map((field) => (
                <SelectItem
                  key={field}
                  value={field}
                  className="cursor-pointer"
                >
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mentors Grid */}
      {filteredMentors.length === 0 ? (
        <div
          className="py-20 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <User size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium">No mentors found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor, index) => (
            <div
              key={mentor.id}
              className="opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards] hover:translate-y-[-5px] transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-col items-center pt-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                    <Avatar className="w-24 h-24 border-2 border-primary/10">
                      <AvatarImage
                        src={`${mentor.imageUrl}?w=200&h=200&fit=crop&auto=format`}
                        alt={mentor.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                        {mentor.name
                          .split(" ")
                          .map((name) => name.charAt(0))
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-1.5 text-center">
                    <h3 className="text-xl font-medium tracking-tight">
                      {mentor.name}
                    </h3>
                    <div className="px-3 py-1 bg-secondary text-xs inline-block rounded-full">
                      {mentor.field}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    {mentor.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                    {mentor.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-xs font-normal transition-all duration-200 hover:bg-primary/5 hover:scale-105"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-1 pb-4 border-t flex justify-center">
                  <div className="w-full text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      Availability
                    </p>
                    <p className="text-sm relative pl-4">
                      <span className="absolute w-2 h-2 rounded-full bg-green-500 left-0 top-1/2 transform -translate-y-1/2 animate-[pulse_2s_infinite]"></span>
                      {mentor.availability}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default Mentors;
