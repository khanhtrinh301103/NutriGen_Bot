// src/pages/adminUI/components/PostsManagement/SummaryCards.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowDown, ArrowUp, FileText, Eye, EyeOff, BarChart } from 'lucide-react';

interface SummaryCardsProps {
  totalPosts: number;
  activePosts: number;
  hiddenPosts: number;
  averageInteraction: number;
  changePercentage: number;
  isLoading: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalPosts,
  activePosts,
  hiddenPosts,
  averageInteraction,
  changePercentage,
  isLoading,
}) => {
  const formatChange = (value: number) => {
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Posts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              totalPosts
            )}
          </div>
          {isLoading ? (
            <div className="h-4 w-24 mt-1 animate-pulse rounded bg-muted"></div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              <span className="flex items-center">
                {changePercentage > 0 ? (
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : changePercentage < 0 ? (
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                ) : null}
                <span className={changePercentage > 0 ? "text-green-500" : changePercentage < 0 ? "text-red-500" : ""}>
                  {formatChange(changePercentage)} from last month
                </span>
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Average Interaction Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Interaction</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              averageInteraction
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Interactions per post
          </p>
        </CardContent>
      </Card>

      {/* Active Posts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              activePosts
            )}
          </div>
          {isLoading ? (
            <div className="h-4 w-24 mt-1 animate-pulse rounded bg-muted"></div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              <span>
                {totalPosts > 0 ? Math.round((activePosts / totalPosts) * 100) : 0}% of total posts
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Hidden Posts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hidden Posts</CardTitle>
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              hiddenPosts
            )}
          </div>
          {isLoading ? (
            <div className="h-4 w-24 mt-1 animate-pulse rounded bg-muted"></div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              <span>
                {totalPosts > 0 ? Math.round((hiddenPosts / totalPosts) * 100) : 0}% of total posts
              </span>
            </p>
          )}
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

export default SummaryCards;