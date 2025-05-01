'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { HobbySelector } from '@/features/story/components/hobby-selector';
import { ImageUpload } from '@/features/story/components/image-upload';
import { StoryPreview } from '@/features/story/components/story-preview';
import { useToast } from '@/components/ui/use-toast';

const steps = [
  { id: 'upload', title: 'Upload Photo' },
  { id: 'hobbies', title: 'Select Hobbies' },
  { id: 'details', title: 'Story Details' },
  { id: 'preview', title: 'Preview' },
];

export default function StoryPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    photo: null as File | null,
    hobbies: [] as string[],
    storyName: '',
    description: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewStory, setPreviewStory] = useState<string | null>(null);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 1 && formData.hobbies.length < 5 ) {
        toast({
          variant: 'destructive',
          description: 'You should select at least 5 hobbies',
        });
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement story generation
      // For now, just show a preview
      setPreviewStory("Once upon a time, there was a child who loved to play soccer and draw pictures...");
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'upload':
        return (
          <div className="space-y-4">
            <Label>Upload Child's Photo</Label>
            <ImageUpload
              onImageUpload={(file) => setFormData({ ...formData, photo: file })}
            />
            <p className="text-sm text-muted-foreground">
              Upload a photo to personalize the story. The AI will use this to create illustrations.
            </p>
          </div>
        );
      case 'hobbies':
        return (
          <div className="space-y-4">
            <Label>Select Hobbies</Label>
            <HobbySelector
              selectedHobbies={formData.hobbies}
              onChange={(hobbies) => setFormData({ ...formData, hobbies })}
            />
            <p className="text-sm text-muted-foreground">
              Choose hobbies that will be featured in the story.
            </p>
          </div>
        );
      case 'details':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Story Name (Optional)</Label>
              <Input
                placeholder="My Adventure Story"
                value={formData.storyName}
                onChange={(e) => setFormData({ ...formData, storyName: e.target.value })}
                className='text-white'
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Details</Label>
              <Textarea
                placeholder="Any specific details you'd like to include in the story..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className='text-white'
              />
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="space-y-4">
            <StoryPreview
              story={previewStory}
              isGenerating={isGenerating}
            />
            {!previewStory && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Click "Generate Story" to create your personalized story.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <Card className='bg-gray-700'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>Create Your Story</CardTitle>
          <CardDescription>
            Follow these steps to create a personalized story for your child.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{steps[currentStep].title}</span>
              </div>
              <Progress value={(currentStep + 1) * (100 / steps.length)} />
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Story'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 