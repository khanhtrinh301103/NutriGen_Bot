// frontend/src/pages/adminUI/components/UserDetailsHeader.tsx
import React from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardHeader 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail } from 'lucide-react';

interface UserDetailsHeaderProps {
  user: any;
}

const UserDetailsHeader: React.FC<UserDetailsHeaderProps> = ({ user }) => {
  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Link href="/adminUI/UserManagement">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to User Management
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">{user.fullName}</h2>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-1 h-4 w-4" />
                {user.email}
              </div>
            </div>
            <Badge 
              className={`capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {user.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm">
            <User className="mr-1 h-4 w-4" />
            <span className="font-medium">User ID:</span>
            <span className="ml-1 text-muted-foreground">{user.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default UserDetailsHeader;