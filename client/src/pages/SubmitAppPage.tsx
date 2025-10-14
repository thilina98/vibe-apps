import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { insertAppListingSchema, VIBECODING_TOOLS, CATEGORIES } from "@shared/schema";
import type { InsertAppListing } from "@shared/schema";
import { ObjectUploader } from "../components/ObjectUploader";
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
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UploadResult } from "@uppy/core";

export default function SubmitAppPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [tagInput, setTagInput] = useState("");

  const form = useForm<InsertAppListing>({
    resolver: zodResolver(insertAppListingSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      fullDescription: "",
      launchUrl: "",
      vibecodingTools: [],
      category: "",
      creatorName: "",
      creatorContact: "",
      previewImage: "",
      tags: [],
      keyLearnings: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertAppListing) => {
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
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit app. Please try again.",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
    });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      const uploadUrl = result.successful[0].uploadURL;
      
      const response = await apiRequest("PUT", "/api/apps/image", {
        imageURL: uploadUrl,
      });
      const data = await response.json();

      setUploadedImageUrl(data.objectPath);
      form.setValue("previewImage", data.objectPath);
      
      toast({
        title: "Image uploaded",
        description: "Your preview image has been uploaded successfully.",
      });
    }
  };

  const addTag = () => {
    const currentTags = form.getValues("tags") || [];
    if (tagInput.trim() && currentTags.length < 5 && !currentTags.includes(tagInput.trim())) {
      form.setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (data: InsertAppListing) => {
    submitMutation.mutate(data);
  };

  const toggleTool = (tool: string) => {
    const currentTools = form.getValues("vibecodingTools");
    if (currentTools.includes(tool)) {
      form.setValue("vibecodingTools", currentTools.filter(t => t !== tool));
    } else {
      form.setValue("vibecodingTools", [...currentTools, tool]);
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

              <FormField
                control={form.control}
                name="vibecodingTools"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vibecoding Tools Used *</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {VIBECODING_TOOLS.map((tool) => (
                        <div key={tool} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tool-${tool}`}
                            checked={field.value?.includes(tool)}
                            onCheckedChange={() => toggleTool(tool)}
                            data-testid={`checkbox-tool-${tool.toLowerCase().replace(/\s+/g, '-')}`}
                          />
                          <Label htmlFor={`tool-${tool}`} className="cursor-pointer text-sm">
                            {tool}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {CATEGORIES.map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={category} 
                                id={`category-${category}`}
                                data-testid={`radio-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                              />
                              <Label htmlFor={`category-${category}`} className="cursor-pointer text-sm">
                                {category}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <div className="flex gap-2">
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
                        disabled={(field.value?.length || 0) >= 5}
                        data-testid="button-add-tag"
                      >
                        Add
                      </Button>
                    </div>
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((tag) => (
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
                    <FormDescription>
                      Max 5 tags
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-display font-semibold">Preview Image</h2>

              <FormField
                control={form.control}
                name="previewImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Screenshot *</FormLabel>
                    <div className="space-y-4">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={5242880}
                        onGetUploadParameters={handleGetUploadParameters}
                        onComplete={handleUploadComplete}
                        buttonClassName="w-full"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Upload className="w-5 h-5" />
                          <span>{uploadedImageUrl ? "Change Image" : "Upload Image"}</span>
                        </div>
                      </ObjectUploader>
                      
                      {uploadedImageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                          <img 
                            src={uploadedImageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            data-testid="img-preview-uploaded"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      Max 5MB - 16:9 aspect ratio recommended
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            <Card className="p-6 space-y-6">
              <h2 className="text-2xl font-display font-semibold">Creator Information</h2>

              <FormField
                control={form.control}
                name="creatorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name/Handle *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe or @johndoe" 
                        {...field} 
                        data-testid="input-creator-name"
                      />
                    </FormControl>
                    <FormDescription>
                      Max 50 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creatorContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com or https://twitter.com/yourhandle" 
                        {...field} 
                        data-testid="input-creator-contact"
                      />
                    </FormControl>
                    <FormDescription>
                      Email or social media link
                    </FormDescription>
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
