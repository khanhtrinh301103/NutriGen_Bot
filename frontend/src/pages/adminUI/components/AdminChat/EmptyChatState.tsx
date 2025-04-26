// frontend/src/pages/adminUI/components/AdminChat/EmptyChatState.tsx
import React from 'react';

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-2/3 h-full bg-gray-50">
      <div className="text-center p-8">
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Select a User to Start Chat
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Choose a user from the sidebar to start or continue a conversation.
        </p>
      </div>
    </div>
  );
};

export default EmptyChatState;