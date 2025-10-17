import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import { insertAppSchema, type Category, type Tool, type AppListing } from "@shared/schema";
import type { InsertApp } from "@shared/schema";
import { ImageUpload } from "../components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Check, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function EditAppPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/app/:id/edit");
  const appId = params?.id;
  const { toast } = useToast();
  const { isAuthenticated, isLoading, signInWithGoogle, user } = useAuth();
  
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedToolId, setSelectedToolId] = useState<string>("");
  const [otherToolName, setOtherToolName] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch the app data
  const { data: app, isLoading: appLoading } = useQuery<AppListing>({
    queryKey: [`/api/apps/${appId}`],
    enabled: !!appId,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tools, isLoading: toolsLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const form = useForm<InsertApp>({
    resolver: zodResolver(insertAppSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      fullDescription: "",
      launchUrl: "",
      previewImageUrl: "",
      keyLearnings: "",
      status: "published",
      creatorId: "",
      categoryId: "",
    },
  });

  // Check if user is creator
  useEffect(() => {
    if (app && user && app.creatorId !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to edit this app.",
        variant: "destructive",
      });
      setLocation(`/app/${appId}`);
    }
  }, [app, user, appId, setLocation, toast]);

  // Pre-populate form when app data is loaded
  useEffect(() => {
    if (app) {
      form.reset({
        name: app.name,
        shortDescription: app.shortDescription,
        fullDescription: app.fullDescription,
        launchUrl: app.launchUrl,
        previewImageUrl: app.previewImageUrl,
        keyLearnings: app.keyLearnings || "",
        status: "published",
        creatorId: app.creatorId || "",
        categoryId: app.categoryId || "",
      });

      // Set tags
      if (app.tags) {
        setTagNames(app.tags);
      }

      // Set tool (only the first one)
      if (app.vibecodingTools && app.vibecodingTools.length > 0) {
        const tool = tools?.find(t => t.name === app.vibecodingTools[0]);
        if (tool) {
          setSelectedToolId(tool.id);
        }
      }
    }
  }, [app, form, tools]);

  const updateMutation = useMutation({
    mutationFn: async (data: InsertApp & { toolIds?: string[], tagNames?: string[], otherToolName?: string }) => {
      const response = await apiRequest("PATCH", `/api/apps/${appId}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your app has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/apps/${appId}`] });
      setLocation(`/app/${appId}`);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update app. Please try again.",
      });
    },
  });

  const addTag = () => {
    if (tagInput.trim() && tagNames.length < 5 && !tagNames.includes(tagInput.trim())) {
      setTagNames([...tagNames, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTagNames(tagNames.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: InsertApp) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to update this app.",
        variant: "destructive",
      });
      setTimeout(() => {
        signInWithGoogle();
      }, 500);
      return;
    }

    // Clear validation errors on submit
    setValidationErrors([]);

    // Prepare submission data
    const submissionData = {
      ...data,
      toolIds: selectedToolId && selectedToolId !== "other" ? [selectedToolId] : [],
      tagNames: tagNames,
      otherToolName: selectedToolId === "other" ? otherToolName : undefined,
    };

    updateMutation.mutate(submissionData);
  };

  // Field name mapping for user-friendly error messages
  const fieldLabels: Record<string, string> = {
    name: "App Name",
    shortDescription: "Short Description",
    fullDescription: "Full Description",
    launchUrl: "Launch URL",
    previewImageUrl: "App Preview Image",
    categoryId: "Category",
    keyLearnings: "Key Learnings",
  };

  // Show validation errors when form submission fails
  const onInvalid = () => {
    const errors = form.formState.errors;
    const errorFields = Object.keys(errors).filter(field => field !== "creatorId");

    if (errorFields.length > 0) {
      // Map field names to user-friendly labels
      const friendlyErrorFields = errorFields.map(field => fieldLabels[field] || field);
      setValidationErrors(friendlyErrorFields);

      // Scroll to first error
      const firstErrorElement = document.querySelector(`[name="${errorFields[0]}"]`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  if (appLoading || categoriesLoading || toolsLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold mb-4">App not found</h2>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href={`/app/${appId}`}>
            <Button variant="ghost" className="mb-4" data-testid="button-back-to-app">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <h1 className="text-4xl font-display font-bold mb-2">Edit Your App</h1>
          <p className="text-muted-foreground">Update your app's information below.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-display font-semibold">Basic Information</h2>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="My Awesome App" 
                        {...field} 
                        data-testid="input-app-name"
                      />
                    </FormControl>
                    <FormDescription>
                      Max 100 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief description of what your app does" 
                        className="resize-none h-20"
                        {...field} 
                        data-testid="input-short-description"
                      />
                    </FormControl>
                    <FormDescription>
                      Max 200 characters - This appears on the app card
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description *</FormLabel>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList>
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about your app. You can use Markdown formatting!" 
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                            data-testid="input-full-description"
                          />
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="prose prose-slate max-w-none min-h-[200px] p-4 border rounded-md bg-muted/20">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {field.value || "*No content yet*"}
                          </ReactMarkdown>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <FormDescription>
                      Supports Markdown formatting (headers, lists, links, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="launchUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Launch URL *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://your-app.com" 
                        type="url"
                        {...field}
                        data-testid="input-launch-url"
                      />
                    </FormControl>
                    <FormDescription>
                      The live URL where users can access your app
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-display font-semibold">Categorization</h2>

              <div>
                <FormLabel>Vibecoding Tool Used *</FormLabel>
                {toolsLoading ? (
                  <div className="h-10 bg-muted rounded animate-pulse mt-3" />
                ) : (
                  <div className="mt-3">
                    <Select value={selectedToolId} onValueChange={setSelectedToolId}>
                      <SelectTrigger data-testid="select-tool">
                        <SelectValue placeholder="Select a tool" />
                      </SelectTrigger>
                      <SelectContent>
                        {tools?.map((tool) => (
                          <SelectItem
                            key={tool.id}
                            value={tool.id}
                            data-testid={`select-item-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <div className="flex items-center gap-2">
                              {tool.logoUrl && (
                                <img
                                  src={tool.logoUrl}
                                  alt={`${tool.name} logo`}
                                  className="w-5 h-5 rounded object-cover"
                                />
                              )}
                              <span>{tool.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="other" data-testid="select-item-tool-other">
                          <span>Other</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {selectedToolId === "other" && (
                  <div className="mt-3">
                    <Input
                      placeholder="Enter tool name"
                      value={otherToolName}
                      onChange={(e) => setOtherToolName(e.target.value)}
                      data-testid="input-other-tool"
                    />
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    {categoriesLoading ? (
                      <div className="h-10 bg-muted rounded animate-pulse" />
                    ) : (
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}
                                data-testid={`select-item-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Tags (Optional)</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    data-testid="input-tag"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={tagNames.length >= 5}
                    data-testid="button-add-tag"
                  >
                    Add
                  </Button>
                </div>
                {tagNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tagNames.map((tag) => (
                      <div key={tag} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-md text-sm">
                        <span data-testid={`badge-tag-${tag}`}>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                          data-testid={`button-remove-tag-${tag}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Max 5 tags
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-display font-semibold">App Preview Image</h2>
              <FormField
                control={form.control}
                name="previewImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preview Image *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a screenshot or preview image of your app (max 5MB, image formats only)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-display font-semibold">Key Learnings (Optional)</h2>
              <FormField
                control={form.control}
                name="keyLearnings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Share Your Insights</FormLabel>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList>
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <FormControl>
                          <Textarea 
                            placeholder="What did you learn while building this app? Share tips and insights for others!" 
                            className="min-h-[150px] font-mono text-sm"
                            {...field}
                            data-testid="input-key-learnings"
                          />
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="prose prose-slate max-w-none min-h-[150px] p-4 border rounded-md bg-muted/20">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {field.value || "*No content yet*"}
                          </ReactMarkdown>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <FormDescription>
                      Share what you learned, challenges you faced, and tips for others. Supports Markdown.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4" data-testid="validation-error-container">
                <div className="flex items-start gap-3">
                  <div className="text-destructive mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-destructive mb-2" data-testid="validation-error-title">
                      Missing Required Fields
                    </h3>
                    <p className="text-sm text-destructive/90 mb-2">
                      Please fill in the following required fields:
                    </p>
                    <ul className="list-disc list-inside text-sm text-destructive/90 space-y-1">
                      {validationErrors.map((field, index) => (
                        <li key={index} data-testid={`validation-error-field-${index}`}>{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setLocation(`/app/${appId}`)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={updateMutation.isPending}
                className="px-8"
                data-testid="button-update-app"
              >
                {updateMutation.isPending ? "Updating..." : "Update App"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
