// frontend/src/pages/adminUI/components/SearchStatCards.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Search, Users, TrendingUp, Calendar } from 'lucide-react';

interface SearchStatCardsProps {
  totalSearches: number;
  uniqueUsers: number;
  topKeyword: string;
  topKeywordCount: number;
  dateRange: {
    start: Date | undefined;
    end: Date | undefined;
  };
  isLoading: boolean;
}

const SearchStatCards: React.FC<SearchStatCardsProps> = ({
  totalSearches,
  uniqueUsers,
  topKeyword,
  topKeywordCount,
  dateRange,
  isLoading
}) => {
  // Kiểm tra nếu đang áp dụng bộ lọc ngày
  const isDateFiltered = !!(dateRange.start && dateRange.end);
  
  // Format ngày
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Searches Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{totalSearches}</div>
              {isDateFiltered && (
                <p className="text-xs text-muted-foreground mt-1">
                  From {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Unique Users Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{uniqueUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((uniqueUsers / Math.max(1, totalSearches)) * 100).toFixed(1)}% engagement rate
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Top Keyword Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Keyword</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{topKeyword || "N/A"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {topKeywordCount} searches ({((topKeywordCount / Math.max(1, totalSearches)) * 100).toFixed(1)}%)
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Date Range Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Analysis Period</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {isDateFiltered ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` : "All Time"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isDateFiltered ? 
                  `${Math.ceil((dateRange.end!.getTime() - dateRange.start!.getTime()) / (1000 * 60 * 60 * 24))} days` : 
                  "Full search history"
                }
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchStatCards;