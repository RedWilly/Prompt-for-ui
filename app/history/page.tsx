"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Calendar, Image as ImageIcon, Code, Layout, Trash2 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface PromptHistoryItem {
  id: string;
  imageUrl: string;
  initialPrompt: string;
  additionalPrompt?: string;
  backendPrompt?: string;
  createdAt: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function HistoryPage() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/prompt-history");
      const data = await res.json();
      setHistory(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching history:", error);
      setLoading(false);
      toast.error("Failed to load history");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/prompt-history?id=${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete history item");
      }

      setHistory(history.filter(item => item.id !== deleteId));
      toast.success("History item deleted successfully");
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast.error("Failed to delete history item");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Prompt History</h1>
        <p className="text-muted-foreground">
          View and manage your generated prompts and designs.
        </p>
      </div>

      {history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4"
        >
          <div className="p-4 rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No prompts generated yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Start by uploading an image and generating your first prompt to see it here!
          </p>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6"
        >
          {history.map((historyItem) => (
            <motion.div key={historyItem.id} variants={item}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-5 gap-6">
                    {/* Image Column */}
                    <div className="lg:col-span-2">
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-muted group">
                        <img 
                          src={historyItem.imageUrl} 
                          alt="Generated from" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setDeleteId(historyItem.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={historyItem.createdAt}>
                          {format(new Date(historyItem.createdAt), 'PPP')}
                        </time>
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="lg:col-span-3">
                      <Tabs defaultValue="ui" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="ui" className="flex items-center gap-2">
                            <Layout className="h-4 w-4" />
                            UI Design
                          </TabsTrigger>
                          <TabsTrigger value="additional" className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Additional
                          </TabsTrigger>
                          <TabsTrigger value="backend" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Backend
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="ui" className="mt-4">
                          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            <div className="space-y-2">
                              <Badge>Initial Prompt</Badge>
                              <p className="text-sm leading-relaxed">
                                {historyItem.initialPrompt}
                              </p>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="additional" className="mt-4">
                          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            <div className="space-y-2">
                              <Badge>Additional Pages</Badge>
                              <p className="text-sm leading-relaxed">
                                {historyItem.additionalPrompt || "No additional pages generated"}
                              </p>
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="backend" className="mt-4">
                          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                            <div className="space-y-2">
                              <Badge>Backend Architecture</Badge>
                              <p className="text-sm leading-relaxed">
                                {historyItem.backendPrompt || "No backend architecture generated"}
                              </p>
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prompt history item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
