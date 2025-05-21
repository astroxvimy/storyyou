'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { HobbySelector } from '@/features/story/components/hobby-selector';
import { ImageUpload } from '@/features/story/components/image-upload';
import { StoryPreview } from '@/features/story/components/story-preview';
import { balanceService, storyService } from '@/libs/api_service';

const steps = [
  { id: 'upload', title: 'Upload Photo', description: 'Upload a photo to personalize the story.' },
  { id: 'hobbies', title: 'Select Hobbies', description: 'Choose hobbies that will be featured in the story.' },
  { id: 'details', title: 'Story Details', description: 'Provide additional details to make the story unique.' },
  { id: 'preview', title: 'Preview', description: 'Review your story before generating it.' },
];

type Balances = {
  totalBalance: number;
  basicBalance: number;
  proBalance: number;
  hobbyBalance: number;
};

export function CreateBook({ userId }: { userId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [balances, setBalances] = useState<Balances>({
    totalBalance: 0,
    basicBalance: 0,
    proBalance: 0,
    hobbyBalance: 0,
  });
  const [formData, setFormData] = useState({
    photo: null as File | null,
    hobbies: [] as string[],
    storyName: '',
    description: '',
  });
  const [remainingChars, setRemainingChars] = useState(200);

  const templateTitles = [
    'My Adventure Story',
    'The Magical Journey',
    'A Day in the Life of a Hero',
    'The Secret Garden Adventure',
  ];
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewStory, setPreviewStory] = useState<string | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>('/avatar.png');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const getBalances = async () => {
      const [total, basic, pro, hobby] = await Promise.all([
        balanceService.getTotalBalance(userId),
        balanceService.getBasicBalance(userId),
        balanceService.getProBalance(userId),
        balanceService.getHobbyBalance(userId),
      ]);
      console.log('❤️', total);
      setBalances({
        totalBalance: total.data.balance,
        basicBalance: basic.data.balance,
        proBalance: pro.data.balance,
        hobbyBalance: hobby.data.balance,
      });
    };
    getBalances();
  }, [userId]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 1 && formData.hobbies.length < 5) {
        toast({
          variant: 'destructive',
          description: 'Please select at least 5 hobbies to proceed.',
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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 200) {
      setFormData({ ...formData, description: value });
      setRemainingChars(200 - value.length);
    }
  };

  const handleTemplateSelect = (title: string) => {
    setFormData({ ...formData, storyName: title });
  };

  let storyId: string = '';

  const handleSubmit = async () => {
    if (balances.totalBalance <= 0) {
      toast({
        variant: 'destructive',
        description: 'You do not any credits now, please purchase new credits',
      });
    } else {
      setIsGenerating(true);
      try {
        const res = await storyService.submit({
          storyName: formData.storyName.trim(),
          hobbies: formData.hobbies,
          userPicture: formData.photo as File,
          storyDetail: formData.description.trim(),
        });
        storyId = res.data.data.id;
        toast({
          description: 'Story submitted successfully! Redirecting...',
        });
        router.push(`/story/${storyId}/view`);
      } catch (error) {
        console.error('Error generating story:', error);
        toast({
          variant: 'destructive',
          description: 'Failed to generate the story. Please try again.',
        });
      } finally {
        setIsGenerating(false);
      }
    }    
  };

  const renderStep = () => {
    let stepContent;

    switch (steps[currentStep].id) {
      case 'upload':
        stepContent = (
          <div className='space-y-4'>
            <Label className='text-white'>Upload Child&apos;s Photo</Label>
            <ImageUpload
              previewProps={userPhotoPreview}
              setPreviewImage={setUserPhotoPreview}
              onImageUpload={(file) => setFormData({ ...formData, photo: file })}
            />
            <p className='text-sm text-muted-foreground'>
              Upload a photo to personalize the story. The AI will use this to create illustrations that match the
              child&apos;s appearance.
            </p>
          </div>
        );
        break;

      case 'hobbies':
        stepContent = (
          <div className='space-y-4'>
            <Label className='text-gray-200'>Select Hobbies</Label>
            <HobbySelector
              selectedHobbies={formData.hobbies}
              onChange={(hobbies) => setFormData({ ...formData, hobbies })}
            />
            <p className='text-sm text-muted-foreground'>
              Select at least 5 hobbies that your child enjoys. These hobbies will be incorporated into the story to
              make it more relatable and engaging.
            </p>
          </div>
        );
        break;

      case 'details':
        stepContent = (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label className='text-gray-200'>Story Name (Optional)</Label>
              <Input
                placeholder='My Adventure Story'
                value={formData.storyName}
                onChange={(e) => setFormData({ ...formData, storyName: e.target.value })}
                className='border border-gray-200 border-input bg-opacity-0 text-white'
              />
              <div className='flex flex-wrap gap-2'>
                {templateTitles.map((title) => (
                  <button
                    key={title}
                    onClick={() => handleTemplateSelect(title)}
                    className={`rounded-lg border px-4 py-2 text-xs ${
                      formData.storyName === title ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                    } hover:bg-blue-500 hover:text-white`}
                  >
                    {title}
                  </button>
                ))}
              </div>
              <p className='text-sm text-muted-foreground'>
                Give your story a unique name. If left blank, a default name will be assigned.
              </p>
            </div>
            <div className='space-y-2'>
              <Label className='text-gray-200'>Additional Details</Label>
              <div className='relative'>
                <Textarea
                  placeholder="Any specific details you'd like to include in the story..."
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  className='text-white'
                />
                {/* Remaining Characters */}
                <div className='absolute bottom-2 right-2 text-xs text-gray-200'>
                  {remainingChars} characters remaining
                </div>
              </div>
              <p className='text-sm text-muted-foreground'>
                Add any specific details or themes you want to include in the story. This helps make the story more
                personalized.
              </p>
            </div>
          </div>
        );
        break;

      case 'preview':
        stepContent = (
          <div className='space-y-4'>
            <StoryPreview story={previewStory} isGenerating={isGenerating} />
            {!previewStory && (
              <div className='flex flex-col gap-2 py-8'>
                <p className='text-muted-foreground'>
                  <strong>Story Name:</strong> {formData.storyName || 'Not set'}
                </p>
                <p className='text-muted-foreground'>
                  <strong>Story Description:</strong> {formData.description || 'Not set'}
                </p>
                <img src={userPhotoPreview ?? ''} alt='Preview' className='h-32 w-32 rounded-lg object-cover' />
                <p className='text-muted-foreground'>
                  <strong>Hobbies:</strong>{' '}
                  {formData.hobbies.length > 0 ? formData.hobbies.join(', ') : 'None selected'}
                </p>
              </div>
            )}
          </div>
        );
        break;

      default:
        stepContent = null;
    }

    return (
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
      >
        {stepContent}
      </motion.div>
    );
  };

  return (
    <div className='container flex w-full flex-col gap-8 py-8 lg:flex-row'>
      <Card className='min-h-full flex-1 rounded-lg bg-gradient-to-r from-purple-700  to-blue-600'>
        <div className='relative min-h-full px-12 py-16 shadow-lg'>
          <img src='/balloon.png' alt='balloon' className='absolute bottom-8 right-0 h-48 w-48 opacity-50'></img>
          <CardTitle className='relative mb-8 text-2xl font-bold text-white'>Your Story Summary</CardTitle>
          <img src={userPhotoPreview ?? ''} alt='Preview' className='mb-8 h-32 w-32 rounded-lg  object-cover' />
          <div className='relative flex flex-col'>
            <ul className='mt-4 space-y-2 text-sm text-gray-200'>
              <li className='flex gap-1'>
                <b className='basis-1/3'>Story Name:</b>
                <p className='basis-2/3'>{formData.storyName || 'Not set'}</p>
              </li>
              <li className='flex flex-row gap-1'>
                <b className='basis-1/3'>Hobbies:</b>
                <p className='basis-2/3'>
                  {formData.hobbies.length > 0 ? formData.hobbies.join(', ') : 'None selected'}
                </p>
              </li>
              <li className='flex flex-row gap-1'>
                <b className='basis-1/3'>Description:</b>{' '}
                <p className='basis-2/3'>{formData.description || 'Not set'}</p>
              </li>
            </ul>
          </div>
          <div className='mt-8 rounded-lg bg-white bg-opacity-10 p-4 text-sm text-white shadow-md'>
            <h3 className='mb-2 text-lg font-semibold'>Available Credits</h3>
            <ul className='space-y-1'>
              <li className='flex justify-between'>
                <span>Total:</span>
                <span>{balances.totalBalance}</span>
              </li>
              <li className='flex justify-between'>
                <span>Basic:</span>
                <span>{balances.basicBalance}</span>
              </li>
              <li className='flex justify-between'>
                <span>Pro:</span>
                <span>{balances.proBalance}</span>
              </li>
              <li className='flex justify-between'>
                <span>Hobby:</span>
                <span>{balances.hobbyBalance}</span>
              </li>
            </ul>
          </div>
          <div className='flex justify-end mt-8'>
            <Link href='/pricing'>
              <Button variant='sexy' className='text-gray-100'>
                Buy new credits
              </Button>
              </Link>
          </div>
        </div>
      </Card>
      <Card className='w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-700 p-8 shadow-lg lg:w-3/5'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-white'>Create Your Story</CardTitle>
          <CardDescription className='text-gray-200'>
            Follow these steps to create a personalized story for your child. Each step will guide you through the
            process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-8'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm text-gray-200'>
                <span>
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span>{steps[currentStep].title}</span>
              </div>
              <Progress value={(currentStep + 1) * (100 / steps.length)} />
              <p className='text-sm text-muted-foreground'>{steps[currentStep].description}</p>
            </div>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <div className='flex justify-between pt-4'>
              <div className='flex w-full items-center justify-between'>
                {/* Progress Bar */}
                <Button onClick={handleBack} className='border-2 bg-opacity-40' disabled={currentStep === 0}>
                  Back
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button variant='sexy' className='text-white' onClick={handleSubmit} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate Story'}
                  </Button>
                ) : (
                  <Button variant='sexy' className='text-gray-100' onClick={handleNext}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
