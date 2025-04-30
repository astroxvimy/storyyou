'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayersIcon } from '@radix-ui/react-icons';

interface StoryPreviewProps {
  story: string | null;
  isGenerating: boolean;
}

export function StoryPreview({ story, isGenerating }: StoryPreviewProps) {
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <LayersIcon className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Generating your story...</p>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Story Preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-line">{story}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          This is a preview of your story. Upgrade to get the full version with illustrations!
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Share Preview
          </Button>
          <Button size="sm">
            Upgrade to Full Version
          </Button>
        </div>
      </div>
    </div>
  );
} 