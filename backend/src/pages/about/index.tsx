import React, { useEffect, useState } from "react";
import { ContentCard } from "../components/ui/content-card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { X, Upload, Check, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../components/ui/use-toast";
import { AdminLayout } from "../components/layouts/AdminLayout";
import Cookies from "js-cookie";

interface User {
  name: string;
  email: string;
  profile_picture: string | null;
  title: string;
  aboutme: string;
  skills: string[];
  phone: string;
  tech_stack: string[];
  location: string;
  languages: string[];
  quote?: string;
  resume_url?: string;
  contact_email?: string;
  lastLogin?: string;
  createdAt?: string;
}

const AboutPage = () => {
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    profile_picture: null,
    title: "",
    aboutme: "",
    skills: [],
    phone: "",
    tech_stack: [],
    location: "",
    languages: [],
    quote: "",
    resume_url: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newTech, setNewTech] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);

    fetch("/api/user", {
      method: "GET",
      credentials: "include", // penting! supaya cookie dikirim
    })
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
        if (res.ok) {
          setFormData(data);
        } else {
          toast({
            title: "Gagal memuat data pengguna",
            description: data.error || "Terjadi kesalahan.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        toast({
          title: "Terjadi kesalahan",
          description: "Tidak dapat mengambil data pengguna.",
          variant: "destructive",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleResumeSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    const formDataFile = new FormData();
    formDataFile.append("resume", resumeFile);

    try {
      setIsLoading(true);
      const token = Cookies.get("token");

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataFile,
      });

      const data = await response.json();
      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          resume_url: data.url,
        }));
        toast({
          title: "Resume uploaded successfully",
        });
        setResumeFile(null);
      } else {
        toast({
          title: "Upload failed",
          description: data.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: "Something went wrong while uploading",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTech = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTech.trim()],
      }));
      setNewTech("");
    }
  };
  const handleAddLanguage = () => {
    if (
      newLanguage.trim() &&
      !formData.languages.includes(newLanguage.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang !== langToRemove),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");
    // const token = localStorage.getItem("token");
    // console.log(token);

    if (!token) {
      toast({
        title: "Token tidak ditemukan",
        description: "Anda perlu login terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    fetch("/api/user", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          toast({
            title: "Profil berhasil diperbarui",
            description: "Data profil Anda telah disimpan.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Gagal memperbarui profil",
            description: data.error || "Terjadi kesalahan.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Terjadi kesalahan",
          description: "Tidak dapat memperbarui data pengguna.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">About Me</h1>
        <p className="text-muted-foreground">
          Manage your personal information and profile
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <ContentCard title="Profile Preview">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={formData.profile_picture || ""} />
                <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{formData.name}</h3>
              <p className="text-muted-foreground">{formData.title}</p>
              <div className="mt-4 space-x-2 space-y-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </ContentCard>
        </div>

        <div className="md:col-span-2">
          <ContentCard
            title="Edit Profile"
            description="Update your personal information"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={formData.profile_picture || ""} />
                    <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Change Avatar</span>
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutme">About me</Label>
                  <Textarea
                    id="aboutme"
                    name="aboutme"
                    value={formData.aboutme}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      id="newSkill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a new skill"
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isLoading}
              >
                <Check className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </form>
          </ContentCard>
        </div>
      </div>
      <ContentCard title="Profile Info">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="quote">Quote</Label>
              <Textarea
                name="quote"
                value={formData.quote || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.languages.map((lang) => (
                  <motion.div
                    key={lang}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm flex items-center space-x-1"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  id="newLanguage"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add a language"
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddLanguage}
                  disabled={!newLanguage.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Upload Resume (PDF/DOCX)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeSelection}
              />

              {resumeFile && (
                <p className="text-sm text-muted-foreground">
                  Selected file: <strong>{resumeFile.name}</strong> (not
                  uploaded yet)
                </p>
              )}

              {formData.resume_url && !resumeFile && (
                <a
                  href={formData.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Current Resume
                </a>
              )}

              {resumeFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResumeUpload}
                  disabled={isLoading}
                >
                  Upload Resume
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Last Login:</span>
                <br />
                {new Date(formData.lastLogin).toLocaleString()}
              </div>
              <div>
                <span className="font-medium text-foreground">Joined:</span>
                <br />
                {new Date(formData.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="aboutme">About me</Label>
            <Textarea
              name="aboutme"
              value={formData.aboutme}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <Button type="button" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="tech_stack">Tech Stack</Label>
            <div className="flex flex-wrap gap-2">
              {formData.tech_stack.map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
              />
              <Button type="button" onClick={handleAddTech}>
                Add
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            <Check className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </form>
      </ContentCard>
    </div>
  );
};

export default AboutPage;

AboutPage.getLayout = function getLayout(page: React.ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
