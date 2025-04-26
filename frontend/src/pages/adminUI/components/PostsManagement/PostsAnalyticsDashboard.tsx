// src/pages/adminUI/components/PostsManagement/PostsAnalyticsDashboard.tsx

import React, { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards';
import InteractionTrendsChart from './InteractionTrendsChart';
import TimeHeatmap from './TimeHeatmap';
import TopPostsTable from './TopPostsTable';
import GoldenHoursChart from './GoldenHoursChart';
import CaptionAnalysisChart from './CaptionAnalysisChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getPostsSummary, 
  getInteractionTrends, 
  getPostTimeHeatmap, 
  getTopPosts,
  getGoldenHours,
  getCaptionLengthVsEngagement
} from '@/api/adminAPI/postsAnalyticsService';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check as CheckIcon, Info as InfoIcon, MessageSquare as MessageSquareIcon } from 'lucide-react';

interface PostsAnalyticsDashboardProps {
  onViewPostDetails: (post: any) => void;
}

const PostsAnalyticsDashboard: React.FC<PostsAnalyticsDashboardProps> = ({
  onViewPostDetails
}) => {
  // State for summary data
  const [summaryData, setSummaryData] = useState({
    totalPosts: 0,
    activePosts: 0,
    hiddenPosts: 0,
    averageInteraction: 0,
    changePercentage: 0
  });
  
  // State for trends chart
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('day');
  const [days, setDays] = useState(30);
  
  // State for heatmap
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  
  // State for top posts
  const [topPosts, setTopPosts] = useState<any[]>([]);
  
  // State for golden hours
  const [goldenHoursData, setGoldenHoursData] = useState<any[]>([]);
  
  // State for caption analysis
  const [captionData, setCaptionData] = useState<any[]>([]);
  
  // Loading states
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [topPostsLoading, setTopPostsLoading] = useState(true);
  const [goldenHoursLoading, setGoldenHoursLoading] = useState(true);
  const [captionLoading, setCaptionLoading] = useState(true);
  
  // Selected dashboard tab
  const [activeTab, setActiveTab] = useState('overview');

  // Load summary data
  const loadSummaryData = async () => {
    try {
      setSummaryLoading(true);
      console.log('Loading posts summary data...');
      const data = await getPostsSummary();
      console.log('Summary data loaded:', data);
      setSummaryData(data);
    } catch (error) {
      console.error('Error loading summary data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load summary data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  // Load trends data
  const loadTrendsData = async () => {
    try {
      setTrendsLoading(true);
      console.log(`Loading trends data with timeframe: ${timeframe}, days: ${days}`);
      const data = await getInteractionTrends(timeframe, days);
      console.log('Trends data loaded:', data);
      setTrendsData(data);
    } catch (error) {
      console.error('Error loading trends data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trends data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setTrendsLoading(false);
    }
  };

  // Load heatmap data
  const loadHeatmapData = async () => {
    try {
      setHeatmapLoading(true);
      console.log('Loading heatmap data...');
      const data = await getPostTimeHeatmap();
      console.log('Heatmap data loaded:', data);
      setHeatmapData(data);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load heatmap data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setHeatmapLoading(false);
    }
  };

  // Load top posts data
  const loadTopPosts = async () => {
    try {
      setTopPostsLoading(true);
      console.log('Loading top posts data...');
      const data = await getTopPosts(10); // Get top 10 posts
      console.log('Top posts data loaded:', data);
      setTopPosts(data);
    } catch (error) {
      console.error('Error loading top posts data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load top posts data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setTopPostsLoading(false);
    }
  };

  // Load golden hours data
  const loadGoldenHoursData = async () => {
    try {
      setGoldenHoursLoading(true);
      console.log('Loading golden hours data...');
      const data = await getGoldenHours();
      console.log('Golden hours data loaded:', data);
      setGoldenHoursData(data);
    } catch (error) {
      console.error('Error loading golden hours data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load golden hours data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGoldenHoursLoading(false);
    }
  };

  // Load caption analysis data
  const loadCaptionData = async () => {
    try {
      setCaptionLoading(true);
      console.log('Loading caption analysis data...');
      const data = await getCaptionLengthVsEngagement();
      console.log('Caption analysis data loaded:', data);
      setCaptionData(data);
    } catch (error) {
      console.error('Error loading caption analysis data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load caption analysis data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setCaptionLoading(false);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  // Handle days change
  const handleDaysChange = (value: number) => {
    setDays(value);
  };

  // Load data on component mount
  useEffect(() => {
    loadSummaryData();
    loadTopPosts();
    
    // Only load other data when the respective tab is active
    if (activeTab === 'overview') {
      loadTrendsData();
    } else if (activeTab === 'time-analysis') {
      loadHeatmapData();
      loadGoldenHoursData();
    } else if (activeTab === 'content-analysis') {
      loadCaptionData();
    }
  }, [activeTab]);

  // Reload trends data when timeframe or days change
  useEffect(() => {
    if (activeTab === 'overview') {
      loadTrendsData();
    }
  }, [timeframe, days]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      <SummaryCards
        totalPosts={summaryData.totalPosts}
        activePosts={summaryData.activePosts}
        hiddenPosts={summaryData.hiddenPosts}
        averageInteraction={summaryData.averageInteraction}
        changePercentage={summaryData.changePercentage}
        isLoading={summaryLoading}
      />
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time-analysis">Time Analysis</TabsTrigger>
          <TabsTrigger value="content-analysis">Content Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InteractionTrendsChart
              data={trendsData}
              isLoading={trendsLoading}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
              days={days}
              onDaysChange={handleDaysChange}
            />
            
            <TopPostsTable
              posts={topPosts}
              isLoading={topPostsLoading}
              onViewDetails={onViewPostDetails}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="time-analysis" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimeHeatmap
              data={heatmapData}
              isLoading={heatmapLoading}
            />
            
            <GoldenHoursChart
              data={goldenHoursData}
              isLoading={goldenHoursLoading}
            />
          </div>
        </TabsContent>
        <TabsContent value="content-analysis" className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thay đổi bằng cách bọc trong div có class h-full để đảm bảo chiều cao đồng đều */}
            <div className="h-full flex flex-col">
            <CaptionAnalysisChart
                data={captionData}
                isLoading={captionLoading}
            />
            </div>
            
            <div className="space-y-6 h-full flex flex-col">
            {/* Card Content Tips chiếm 40% chiều cao */}
            <Card className="flex-grow-0 flex-shrink-0">
                <CardHeader>
                <CardTitle className="text-base font-medium">Content Tips</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 p-1 rounded-full bg-green-100">
                        <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">Optimal Caption Length</h4>
                        <p className="text-sm text-muted-foreground">
                        Aim for 150-200 characters to maximize engagement. Shorter captions can work for eye-catching images.
                        </p>
                    </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 p-1 rounded-full bg-blue-100">
                        <InfoIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">Use Emojis Strategically</h4>
                        <p className="text-sm text-muted-foreground">
                        Posts with 1-3 emojis tend to have higher engagement rates than those without.
                        </p>
                    </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0 p-1 rounded-full bg-purple-100">
                        <MessageSquareIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium">End With a Question</h4>
                        <p className="text-sm text-muted-foreground">
                        Captions ending with a question see 23% more comments on average.
                        </p>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Top Posts chiếm 60% chiều cao còn lại */}
            <div className="flex-grow">
                <TopPostsTable
                posts={topPosts}
                isLoading={topPostsLoading}
                onViewDetails={onViewPostDetails}
                />
            </div>
            </div>
        </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostsAnalyticsDashboard;