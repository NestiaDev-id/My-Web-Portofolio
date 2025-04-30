import React, { useState } from "react";
import { ContentCard } from "../components/ui/content-card";
import { DataTable } from "../components/ui/data-table";
import { blogPostsData, BlogPost } from "../../lib/middlewares/mock-data";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Plus, X, Upload, Calendar } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { AdminLayout } from "../components/layouts/AdminLayout";

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>(blogPostsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  const emptyPost: BlogPost = {
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: [],
    publishedAt: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState<BlogPost>(emptyPost);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Auto-generate slug from title if title is changed
    if (
      name === "title" &&
      (!formData.slug || formData.slug === slugify(formData.title))
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: slugify(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
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
    if (selectedPost) {
      // Edit existing post
      setPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPost.id ? { ...formData } : post
        )
      );
      toast({
        title: "Post Updated",
        description: "The blog post has been updated successfully.",
      });
    } else {
      // Add new post
      const newPost = {
        ...formData,
        id: Date.now().toString(), // Simple ID generation
      };
      setPosts((prev) => [...prev, newPost]);
      toast({
        title: "Post Added",
        description: "The new blog post has been created successfully.",
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedPost) {
      setPosts((prev) => prev.filter((post) => post.id !== selectedPost.id));
      setIsAlertDialogOpen(false);
      setSelectedPost(null);
      toast({
        title: "Post Deleted",
        description: "The blog post has been deleted successfully.",
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({ ...post });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (post: BlogPost) => {
    setSelectedPost(post);
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
      accessorKey: "title" as keyof BlogPost,
      header: "Title",
    },
    {
      accessorKey: "excerpt" as keyof BlogPost,
      header: "Excerpt",
      cell: (post: BlogPost) => (
        <div className="max-w-md truncate">{post.excerpt}</div>
      ),
    },
    {
      accessorKey: "tags" as keyof BlogPost,
      header: "Tags",
      cell: (post: BlogPost) => (
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "publishedAt" as keyof BlogPost,
      header: "Published",
      cell: (post: BlogPost) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          {post.publishedAt}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button
          onClick={() => {
            setSelectedPost(null);
            setFormData(emptyPost);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Post
        </Button>
      </div>

      <ContentCard title="All Blog Posts">
        <DataTable
          columns={columns}
          data={posts}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </ContentCard>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost ? "Edit Blog Post" : "Add New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              {selectedPost
                ? "Update the details of your blog post"
                : "Fill in the details to create a new blog post"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="post-url-slug"
                required
              />
              <p className="text-xs text-muted-foreground">
                This will be the URL of your post. Auto-generated from title if
                left empty.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief summary of your post"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Your full blog post content"
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                Basic markdown formatting is supported.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">Published Date</Label>
              <Input
                id="publishedAt"
                name="publishedAt"
                type="date"
                value={formData.publishedAt}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center space-x-4">
                {formData.coverImage && (
                  <div
                    className="w-24 h-24 rounded-md bg-cover bg-center border"
                    style={{ backgroundImage: `url(${formData.coverImage})` }}
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
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
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
              {selectedPost ? "Save Changes" : "Publish Post"}
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
              This will permanently delete the blog post "{selectedPost?.title}
              ". This action cannot be undone.
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

export default BlogPage;

BlogPage.getLayout = function getLayout(page: React.ReactNode) {
  return <AdminLayout>{page}</AdminLayout>;
};
