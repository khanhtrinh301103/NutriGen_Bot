// frontend/src/pages/adminUI/components/chat/ImageUploader.tsx
import React, { forwardRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ImageUploader = forwardRef<HTMLInputElement, ImageUploaderProps>(
  ({ onImageSelect }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        
        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
          console.error('❌ [ImageUploader] Invalid file type:', file.type);
          alert('Please select an image file');
          return;
        }
        
        // Kiểm tra kích thước file (giới hạn 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.error('❌ [ImageUploader] File too large:', file.size);
          alert('Image size should be less than 5MB');
          return;
        }
        
        console.log('✅ [ImageUploader] Valid image selected:', file.name);
        onImageSelect(file);
        
        // Reset input để có thể chọn lại cùng một file
        e.target.value = '';
      }
    };

    return (
      <input
        type="file"
        ref={ref}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
    );
  }
);

ImageUploader.displayName = 'ImageUploader';


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default ImageUploader;