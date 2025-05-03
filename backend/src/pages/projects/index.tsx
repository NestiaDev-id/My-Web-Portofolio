import React, { useState } from "react";
import { ContentCard } from "../../components/ui/content-card";
import { DataTable } from "../../components/ui/data-table";
import { projectsData, Project } from "../../lib/utils/mock-data";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { Plus, X, Upload } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { AdminLayout } from "../../components/layouts/AdminLayout";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>(projectsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  const emptyProject: Project = {
    id: "",
    title: "",
    description: "",
    imageUrl: "",
    tags: [],
    link: "",
    createdAt: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState<Project>(emptyProject);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddEdit = () => {
    if (selectedProject) {
      // Edit existing project
      setProjects((prev) =>
        prev.map((project) =>
          project.id === selectedProject.id ? { ...formData } : project
        )
      );
      toast({
        title: "Project Updated",
        description: "The project has been updated successfully.",
      });
    } else {
      // Add new project
      const newProject = {
        ...formData,
        id: Date.now().toString(), // Simple ID generation
      };
      setProjects((prev) => [...prev, newProject]);
      toast({
        title: "Project Added",
        description: "The new project has been created successfully.",
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedProject) {
      setProjects((prev) =>
        prev.filter((project) => project.id !== selectedProject.id)
      );
      setIsAlertDialogOpen(false);
      setSelectedProject(null);
      toast({
        title: "Project Deleted",
        description: "The project has been deleted successfully.",
      });
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({ ...project });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setIsAlertDialogOpen(true);
  };

  const handleImageUpload = () => {
    toast({
      title: "Upload Feature",
      description:
        "Image upload would be implemented with a backend service like Supabase or Cloudinary.",
    });
  };

  const columns = [
    {
      accessorKey: "title" as keyof Project,
      header: "Title",
    },
    {
      accessorKey: "description" as keyof Project,
      header: "Description",
      cell: (project: Project) => (
        <div className="max-w-md truncate">{project.description}</div>
      ),
    },
    {
      accessorKey: "tags" as keyof Project,
      header: "Tags",
      cell: (project: Project) => (
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "createdAt" as keyof Project,
      header: "Created",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Manage your portfolio projects
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedProject(null);
            setFormData(emptyProject);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <ContentCard title="All Projects">
        <DataTable
          columns={columns}
          data={projects}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </ContentCard>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Edit Project" : "Add New Project"}
            </DialogTitle>
            <DialogDescription>
              {selectedProject
                ? "Update the details of your project"
                : "Fill in the details to create a new project"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter project description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="link">Project Link</Label>
                <Input
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdAt">Created Date</Label>
                <Input
                  id="createdAt"
                  name="createdAt"
                  type="date"
                  value={formData.createdAt}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Project Image</Label>
              <div className="flex items-center space-x-4">
                {formData.imageUrl && (
                  <div
                    className="w-24 h-24 rounded-md bg-cover bg-center border"
                    style={{ backgroundImage: `url(${formData.imageUrl})` }}
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageUpload}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Image</span>
                </Button>
              </div>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Or enter image URL"
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-secondary-foreground/70 hover:text-secondary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  id="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a new tag"
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEdit}>
              {selectedProject ? "Save Changes" : "Add Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project &quot;
              {selectedProject?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectsPage;

ProjectsPage.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
