// frontend/src/pages/components/onboarding/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, stepTitles }) => {
  console.log(`Rendering ProgressBar - Step ${currentStep}/${totalSteps}`);
  
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="px-6 pt-6">
      <div className="flex justify-between mb-2">
        {stepTitles.map((title, index) => (
          <span
            key={index}
            className={`text-xs font-medium ${
              index < currentStep ? 'text-emerald-600' : 'text-gray-500'
            }`}
          >
            {title}
          </span>
        ))}
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default ProgressBar;