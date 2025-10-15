import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { insertAppSchema, type Category, type Tool } from "@shared/schema";
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
import { ArrowLeft, Upload, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function SubmitAppPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, signInWithGoogle, user } = useAuth();

  // Redirect to login if not authenticated (page-level protection)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an app.",
        variant: "destructive",
      });
      setTimeout(() => {
        signInWithGoogle();
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast, signInWithGoogle]);
  
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [otherToolName, setOtherToolName] = useState("");
  const [isOtherToolSelected, setIsOtherToolSelected] = useState(false);

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
      screenshotUrl: "",
      keyLearnings: "",
      status: "draft",
      creatorId: "",
      categoryId: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertApp & { toolIds?: string[], tagNames?: string[], otherToolName?: string }) => {
      const response = await apiRequest("POST", "/api/apps", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your app has been submitted successfully.",
      });
      setLocation(`/app/${data.id}`);
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
        description: error.message || "Failed to submit app. Please try again.",
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
        description: "Please log in to submit an app.",
        variant: "destructive",
      });
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...data,
      creatorId: user.id,
      toolIds: selectedToolIds,
      tagNames: tagNames,
      otherToolName: isOtherToolSelected ? otherToolName : undefined,
    };

    submitMutation.mutate(submissionData);
  };

  // Show validation errors when form submission fails
  const onInvalid = () => {
    const errors = form.formState.errors;
    const errorFields = Object.keys(errors);
    
    if (errorFields.length > 0) {
      const firstError = errors[errorFields[0] as keyof typeof errors];
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields. First missing field: ${errorFields[0]}`,
        variant: "destructive",
      });
      
      // Scroll to first error
      const firstErrorElement = document.querySelector(`[name="${errorFields[0]}"]`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const toggleTool = (toolId: string) => {
    if (selectedToolIds.includes(toolId)) {
      setSelectedToolIds(selectedToolIds.filter(id => id !== toolId));
    } else {
      setSelectedToolIds([...selectedToolIds, toolId]);
    }
  };

  const fullDescription = form.watch("fullDescription");
  const keyLearnings = form.watch("keyLearnings");

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Submit Your App</h1>
          <p className="text-lg text-muted-foreground">
            Share your AI-built creation with the community and inspire other builders.
          </p>
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
                            className="resize-none min-h-48"
                            {...field} 
                            data-testid="input-full-description"
                          />
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="border rounded-md p-4 min-h-48 prose prose-slate max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {fullDescription || "*No content to preview*"}
                          </ReactMarkdown>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <FormDescription>
                      Max 2000 characters - Markdown supported
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
                        type="url" 
                        placeholder="https://your-app.com" 
                        {...field} 
                        data-testid="input-launch-url"
                      />
                    </FormControl>
                    <FormDescription>
                      The URL where users can access your app
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-display font-semibold">Categorization</h2>

              <div>
                <FormLabel>Vibecoding Tools Used *</FormLabel>
                {toolsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {tools?.map((tool) => (
                      <div key={tool.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tool-${tool.id}`}
                          checked={selectedToolIds.includes(tool.id)}
                          onCheckedChange={() => toggleTool(tool.id)}
                          data-testid={`checkbox-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <Label htmlFor={`tool-${tool.id}`} className="cursor-pointer text-sm">
                          {tool.name}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tool-other"
                        checked={isOtherToolSelected}
                        onCheckedChange={(checked) => setIsOtherToolSelected(!!checked)}
                        data-testid="checkbox-tool-other"
                      />
                      <Label htmlFor="tool-other" className="cursor-pointer text-sm">
                        Other
                      </Label>
                    </div>
                  </div>
                )}
                {isOtherToolSelected && (
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
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <FormControl>
                        <RadioGroup value={field.value} onValueChange={field.onChange}>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categories?.map((category) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value={category.id} 
                                  id={`category-${category.id}`}
                                  data-testid={`radio-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                />
                                <Label htmlFor={`category-${category.id}`} className="cursor-pointer text-sm">
                                  {category.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
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
              <h2 className="text-2xl font-display font-semibold">Preview Image</h2>

              <FormField
                control={form.control}
                name="screenshotUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Screenshot *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="p-6 space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  💡
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-display font-semibold mb-2">Key Learnings (Optional)</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your experience building this app. What challenges did you face? What surprised you? What tips would you give to other builders?
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="keyLearnings"
                render={({ field }) => (
                  <FormItem>
                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList>
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit">
                        <FormControl>
                          <Textarea 
                            placeholder="Share your insights, challenges, and tips for other builders..." 
                            className="resize-none min-h-40"
                            {...field} 
                            data-testid="input-key-learnings"
                          />
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="preview">
                        <div className="border rounded-md p-4 min-h-40 prose prose-slate max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {keyLearnings || "*No content to preview*"}
                          </ReactMarkdown>
                        </div>
                      </TabsContent>
                    </Tabs>
                    <FormDescription>
                      Max 1500 characters - Markdown supported
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <div className="flex justify-end gap-4 pt-6">
              <Link href="/">
                <Button type="button" variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                size="lg"
                disabled={submitMutation.isPending}
                className="px-8"
                data-testid="button-submit"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit App"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
