// frontend/src/pages/components/profile/ProfileTabs.tsx
import React from 'react';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  // Define tabs
  const tabs = [
    { id: 'profile', label: 'Health Profile' },
    { id: 'nutrition', label: 'Nutrition Dashboard' },
    { id: 'saved', label: 'Saved Recipes' }
  ];

  // Logger for tab changes
  const handleTabClick = (tabId: string) => {
    console.log(`Tab changed to: ${tabId}`);
    onTabChange(tabId);
  };

  return (
    <div className="flex border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`py-3 px-6 font-medium ${
            activeTab === tab.id 
              ? 'text-emerald-600 border-b-2 border-emerald-500' 
              : 'text-gray-500 hover:text-emerald-600'
          }`}
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;