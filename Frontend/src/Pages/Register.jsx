import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const FIELDS_OF_INTEREST = [
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

const ROLES = ["Mentee", "Mentor"];

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [field, setField] = useState("");
  const [otherField, setOtherField] = useState("");
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = (formData) => {
    const newErrors = {};

    const name = formData.get("name");
    if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    const email = formData.get("email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const password = formData.get("password");
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!role) {
      newErrors.role = "Please select a role";
    }

    if (!field) {
      newErrors.field = "Please select a field of interest";
    }

    if (field === "others" && !otherField.trim()) {
      newErrors.otherField = "Please specify your field of interest";
    }

    if (keywords.length === 0) {
      newErrors.keywords = "Please add at least one keyword";
    }

    setErrors(newErrors); // ✅ Make sure this is called
    return Object.keys(newErrors).length === 0; // ✅ Returns false if there are errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (!validateForm(formData)) {
      return; // Stop form submission if validation fails
    }
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role,
      field,
      otherField: field === "others" ? otherField : "",
      keywords,
      experience: formData.get("experience"),
    };

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      toast.error(error.message);
    }
  };

  const handleKeywordKeyDown = (e) => {
    if (e.key === "Enter" && currentKeyword.trim()) {
      e.preventDefault();
      if (!keywords.includes(currentKeyword.trim())) {
        setKeywords([...keywords, currentKeyword.trim()]);
        setErrors({ ...errors, keywords: "" });
      }
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setKeywords(keywords.filter((k) => k !== keywordToRemove));
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                Create your account
              </CardTitle>
            </div>
            <CardDescription>
              Join our mentorship platform and connect with amazing mentors and
              mentees
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className={`bg-white ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">{errors.name}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  className={`bg-white ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <span className="text-sm text-red-500">{errors.email}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  className={`bg-white ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <span className="text-sm text-red-500">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* Role Selection */}
                <div className="w-full">
                  <Label htmlFor="role" className="py-2">
                    Role
                  </Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger
                      className={`w-full bg-white ${
                        errors.role ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r.toLowerCase()}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <span className="text-sm text-red-500">{errors.role}</span>
                  )}
                </div>

                {/* Field of Interest Selection */}
                <div className="w-full">
                  <Label htmlFor="field" className="py-2">
                    Field of Interest
                  </Label>
                  <Select value={field} onValueChange={setField} required>
                    <SelectTrigger
                      className={`w-full bg-white ${
                        errors.field ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select your field" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-72">
                        {FIELDS_OF_INTEREST.map((f) => (
                          <SelectItem key={f} value={f.toLowerCase()}>
                            {f}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  {errors.field && (
                    <span className="text-sm text-red-500">{errors.field}</span>
                  )}
                </div>
              </div>

              {field === "others" && (
                <div className="grid gap-2">
                  <Label htmlFor="otherField">Specify Your Field</Label>
                  <Input
                    id="otherField"
                    name="otherField"
                    value={otherField}
                    onChange={(e) => setOtherField(e.target.value)}
                    placeholder="Enter your field of interest"
                    required
                    className={`bg-white ${
                      errors.otherField ? "border-red-500" : ""
                    }`}
                  />
                  {errors.otherField && (
                    <span className="text-sm text-red-500">
                      {errors.otherField}
                    </span>
                  )}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="keywords">Keywords</Label>
                <div className="space-y-2">
                  <Input
                    id="keywords"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyDown={handleKeywordKeyDown}
                    placeholder="Type keyword and press Enter"
                    className={`bg-white ${
                      errors.keywords ? "border-red-500" : ""
                    }`}
                  />
                  {errors.keywords && (
                    <span className="text-sm text-red-500">
                      {errors.keywords}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {role === "mentor" && (
                <div className="grid gap-2 mb-6">
                  <Label htmlFor="experience">Experience & Skills</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    placeholder="Share your expertise and experience..."
                    className="min-h-[100px] bg-white"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-blue-500 hover:text-indigo-400 font-medium"
                >
                  Sign in
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
