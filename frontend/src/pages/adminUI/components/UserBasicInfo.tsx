// frontend/src/pages/adminUI/components/UserBasicInfo.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface UserBasicInfoProps {
  user: any;
  formatDate: (dateString: string) => string;
}

const UserBasicInfo: React.FC<UserBasicInfoProps> = ({ user, formatDate }) => {
  if (!user) return null;
  
  const infoItems = [
    { label: 'Full name', value: user.fullName },
    { label: 'Email address', value: user.email },
    { label: 'Authentication provider', value: user.provider || 'email', capitalize: true },
    { label: 'Role', value: user.role, capitalize: true },
    { label: 'Account created', value: formatDate(user.createdAt) },
    { label: 'Last updated', value: formatDate(user.updatedAt) }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
        <CardDescription>Personal details and account information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {infoItems.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b last:border-b-0">
              <div className="font-medium text-sm">{item.label}</div>
              <div className={`text-sm md:col-span-2 ${item.capitalize ? 'capitalize' : ''}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default UserBasicInfo;