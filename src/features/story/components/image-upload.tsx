'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon } from '@radix-ui/react-icons';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  previewProps?: string | null;
  setPreviewImage?: (previewImage: string | null) => void;
}

export function ImageUpload({ onImageUpload, previewProps, setPreviewImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewProps ?? null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onImageUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setPreviewImage && setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}`}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className='space-y-4'>
          <img src={preview} alt='Preview' className='mx-auto h-32 w-32 rounded-lg object-cover' />
          <Button size='sm'>
            <UploadIcon className='mr-2 h-4 w-4' />
            Change Image
          </Button>
        </div>
      ) : (
        <div className='space-y-2'>
          <ImageIcon className='mx-auto h-12 w-12 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>
            {isDragActive ? 'Drop the image here...' : 'Drag and drop an image, or click to select'}
          </p>
          <Button size='sm' className='bg-opacity-60'>
            <UploadIcon className='mr-2 h-4 w-4' />
            Upload Image
          </Button>
        </div>
      )}
    </div>
  );
}
