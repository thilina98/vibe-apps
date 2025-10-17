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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [otherToolName, setOtherToolName] = useState("");
  const [isOtherToolSelected, setIsOtherToolSelected] = useState(false);

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

      // Set tools
      if (app.vibecodingTools) {
        const toolIds: string[] = [];
        app.vibecodingTools.forEach((toolName: string) => {
          const tool = tools?.find(t => t.name === toolName);
          if (tool) {
            toolIds.push(tool.id);
          }
        });
        setSelectedToolIds(toolIds);
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

    const finalToolIds = isOtherToolSelected 
      ? [...selectedToolIds.filter(id => id !== "other")] 
      : selectedToolIds;

    updateMutation.mutate({
      ...data,
      toolIds: finalToolIds,
      tagNames: tagNames,
      otherToolName: isOtherToolSelected ? otherToolName : undefined,
    });
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Label className="text-base font-medium mb-3 block">Vibecoding Tools Used *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all AI-powered coding tools you used to build this app
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tools?.map((tool) => (
                    <div key={tool.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tool-${tool.id}`}
                        checked={selectedToolIds.includes(tool.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedToolIds([...selectedToolIds, tool.id]);
                          } else {
                            setSelectedToolIds(selectedToolIds.filter(id => id !== tool.id));
                          }
                        }}
                        data-testid={`checkbox-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <label
                        htmlFor={`tool-${tool.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tool.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      >
                        {categories?.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={category.id} id={`category-${category.id}`} data-testid={`radio-category-${category.name.toLowerCase()}`} />
                            <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label className="text-base font-medium mb-2 block">Tags (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Add up to 5 tags to help people discover your app
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Enter a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    disabled={tagNames.length >= 5}
                    data-testid="input-tag"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || tagNames.length >= 5}
                    data-testid="button-add-tag"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagNames.map((tag) => (
                    <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1" data-testid={`badge-tag-${tag}`}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        data-testid={`button-remove-tag-${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
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

            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={updateMutation.isPending}
                className="flex-1"
                data-testid="button-update-app"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Update App
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setLocation(`/app/${appId}`)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
