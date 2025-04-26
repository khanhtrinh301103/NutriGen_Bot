// src/api/adminAPI/postsAnalyticsService.js

import axios from 'axios';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const FIREBASE_API_URL = process.env.NEXT_PUBLIC_FIREBASE_API_URL || "https://firestore.googleapis.com/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nutrigen-bot";

// Base URL for Firestore REST API
const baseUrl = `${FIREBASE_API_URL}/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Get posts summary data
 * @returns {Promise<Object>} Summary stats
 */
export const getPostsSummary = async () => {
  try {
    console.log('Fetching posts summary...');
    
    // Get all posts
    const response = await axios.get(`${baseUrl}/posts`);
    
    if (!response.data.documents) {
      console.log('No posts found');
      return {
        totalPosts: 0,
        activePosts: 0,
        hiddenPosts: 0,
        averageInteraction: 0,
        changePercentage: 0
      };
    }
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    
    // Process posts
    let totalPosts = 0;
    let activePosts = 0;
    let hiddenPosts = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let postsLastMonth = 0;
    let postsPreviousMonth = 0;
    
    await Promise.all(response.data.documents.map(async (doc) => {
      const postId = doc.name.split('/').pop();
      const createdAt = doc.fields?.createdAt?.timestampValue ? new Date(doc.fields.createdAt.timestampValue) : null;
      const isDeleted = doc.fields?.isDeleted?.booleanValue || false;
      
      totalPosts++;
      if (isDeleted) {
        hiddenPosts++;
      } else {
        activePosts++;
      }
      
      // Count posts by time period
      if (createdAt && createdAt >= thirtyDaysAgo) {
        postsLastMonth++;
      } else if (createdAt && createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo) {
        postsPreviousMonth++;
      }
      
      // Get likes count
      const likesResponse = await axios.get(`${baseUrl}/posts/${postId}/likes`);
      const likesCount = likesResponse.data.documents ? likesResponse.data.documents.length : 0;
      totalLikes += likesCount;
      
      // Get comments count
      const commentsResponse = await axios.get(`${baseUrl}/posts/${postId}/comments`);
      const commentsCount = commentsResponse.data.documents ? commentsResponse.data.documents.length : 0;
      totalComments += commentsCount;
    }));
    
    // Calculate average interactions per post
    const averageInteraction = totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts).toFixed(2) : 0;
    
    // Calculate change percentage
    const changePercentage = postsPreviousMonth > 0 
      ? (((postsLastMonth - postsPreviousMonth) / postsPreviousMonth) * 100).toFixed(1)
      : postsLastMonth > 0 ? 100 : 0;
    
    return {
      totalPosts,
      activePosts,
      hiddenPosts,
      averageInteraction: parseFloat(averageInteraction),
      changePercentage: parseFloat(changePercentage)
    };
  } catch (error) {
    console.error('Error fetching posts summary:', error);
    throw error;
  }
};

/**
 * Get interaction trends data for chart
 * @param {string} timeframe - 'day', 'week', or 'month'
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Trend data for chart
 */
export const getInteractionTrends = async (timeframe = 'day', days = 30) => {
  try {
    console.log(`Fetching interaction trends by ${timeframe} for the last ${days} days...`);
    
    // Get all posts
    const response = await axios.get(`${baseUrl}/posts`);
    
    if (!response.data.documents) {
      console.log('No posts found');
      return [];
    }
    
    // Calculate date ranges
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    startDate.setHours(0, 0, 0, 0);
    
    // Setup data structure based on timeframe
    const trendData = {};
    let currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      let key;
      if (timeframe === 'day') {
        key = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (timeframe === 'week') {
        // Get the first day of the week (Sunday)
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (timeframe === 'month') {
        key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!trendData[key]) {
        trendData[key] = {
          date: key,
          posts: 0,
          likes: 0,
          comments: 0
        };
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Process all posts and their interactions
    await Promise.all(response.data.documents.map(async (doc) => {
      const postId = doc.name.split('/').pop();
      const createdAt = doc.fields?.createdAt?.timestampValue ? new Date(doc.fields.createdAt.timestampValue) : null;
      
      if (!createdAt || createdAt < startDate) {
        return; // Skip posts outside our time range
      }
      
      let key;
      if (timeframe === 'day') {
        key = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (timeframe === 'week') {
        // Get the first day of the week (Sunday)
        const weekStart = new Date(createdAt);
        weekStart.setDate(createdAt.getDate() - createdAt.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (timeframe === 'month') {
        key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (trendData[key]) {
        trendData[key].posts += 1;
      }
      
      // Get likes count
      const likesResponse = await axios.get(`${baseUrl}/posts/${postId}/likes`);
      const likesCount = likesResponse.data.documents ? likesResponse.data.documents.length : 0;
      
      if (trendData[key]) {
        trendData[key].likes += likesCount;
      }
      
      // Get comments count
      const commentsResponse = await axios.get(`${baseUrl}/posts/${postId}/comments`);
      const commentsCount = commentsResponse.data.documents ? commentsResponse.data.documents.length : 0;
      
      if (trendData[key]) {
        trendData[key].comments += commentsCount;
      }
    }));
    
    // Convert to array sorted by date
    return Object.values(trendData).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching interaction trends:', error);
    throw error;
  }
};

/**
 * Get data for the posting time heatmap
 * @returns {Promise<Array>} Data for heatmap
 */
export const getPostTimeHeatmap = async () => {
  try {
    console.log('Fetching post time heatmap data...');
    
    // Get all posts
    const response = await axios.get(`${baseUrl}/posts`);
    
    if (!response.data.documents) {
      console.log('No posts found');
      return [];
    }
    
    // Initialize heatmap data structure
    // 7 days (0=Sunday, 6=Saturday) x 24 hours
    const heatmapData = Array(7).fill().map(() => Array(24).fill(0));
    
    // Process all posts
    response.data.documents.forEach(doc => {
      const createdAt = doc.fields?.createdAt?.timestampValue ? new Date(doc.fields.createdAt.timestampValue) : null;
      
      if (createdAt) {
        const dayOfWeek = createdAt.getDay(); // 0-6
        const hourOfDay = createdAt.getHours(); // 0-23
        
        // Increment the count for this day/hour combination
        heatmapData[dayOfWeek][hourOfDay]++;
      }
    });
    
    // Convert to format needed for heatmap
    const formattedData = [];
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    daysOfWeek.forEach((day, dayIndex) => {
      for (let hour = 0; hour < 24; hour++) {
        formattedData.push({
          day,
          hour: hour.toString(), // Convert to string for display
          value: heatmapData[dayIndex][hour]
        });
      }
    });
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching post time heatmap data:', error);
    throw error;
  }
};

/**
 * Get top posts by interaction
 * @param {number} limit Number of top posts to retrieve
 * @returns {Promise<Array>} Top posts data
 */
export const getTopPosts = async (postsLimit = 10) => {
  try {
    console.log(`Fetching top ${postsLimit} posts by interaction...`);
    
    // Get all posts
    const response = await axios.get(`${baseUrl}/posts`);
    
    if (!response.data.documents) {
      console.log('No posts found');
      return [];
    }
    
    // Process posts and calculate total interactions
    const postsWithInteractions = await Promise.all(response.data.documents.map(async (doc) => {
      const postId = doc.name.split('/').pop();
      const createdAt = doc.fields?.createdAt?.timestampValue || null;
      const isDeleted = doc.fields?.isDeleted?.booleanValue || false;
      
      // Skip deleted posts
      if (isDeleted) {
        return null;
      }
      
      // Get likes count
      const likesResponse = await axios.get(`${baseUrl}/posts/${postId}/likes`);
      const likesCount = likesResponse.data.documents ? likesResponse.data.documents.length : 0;
      
      // Get comments count
      const commentsResponse = await axios.get(`${baseUrl}/posts/${postId}/comments`);
      const commentsCount = commentsResponse.data.documents ? commentsResponse.data.documents.length : 0;
      
      // Total interactions (likes + comments)
      const totalInteractions = likesCount + commentsCount;
      
      return {
        id: postId,
        caption: doc.fields?.caption?.stringValue || '',
        createdAt,
        userName: doc.fields?.userName?.stringValue || '',
        userAvatar: doc.fields?.userAvatar?.stringValue || '',
        images: doc.fields?.images?.arrayValue?.values?.map(img => img.stringValue) || [],
        likesCount,
        commentsCount,
        totalInteractions
      };
    }));
    
    // Filter out null values and sort by total interactions
    const sortedPosts = postsWithInteractions
      .filter(post => post !== null)
      .sort((a, b) => b.totalInteractions - a.totalInteractions);
    
    // Return top N posts
    return sortedPosts.slice(0, postsLimit);
  } catch (error) {
    console.error('Error fetching top posts:', error);
    throw error;
  }
};

/**
 * Get golden hours (hours with highest engagement)
 * @returns {Promise<Array>} Hourly engagement data
 */
export const getGoldenHours = async () => {
  try {
    console.log('Fetching golden hours data...');
    
    // Get all posts
    const response = await axios.get(`${baseUrl}/posts`);
    
    if (!response.data.documents) {
      console.log('No posts found');
      return [];
    }
    
    // Initialize data structure for hours (0-23)
    const hourData = Array(24).fill().map((_, hour) => ({
      hour,
      posts: 0,
      likes: 0,
      comments: 0,
      engagement: 0 // Will be calculated later
    }));
    
    // Process all posts and their engagement
    await Promise.all(response.data.documents.map(async (doc) => {
      const postId = doc.name.split('/').pop();
      const createdAt = doc.fields?.createdAt?.timestampValue ? new Date(doc.fields.createdAt.timestampValue) : null;
      
      if (!createdAt) return;
      
      const hourOfDay = createdAt.getHours(); // 0-23
      hourData[hourOfDay].posts++;
      
      // Get likes count
      const likesResponse = await axios.get(`${baseUrl}/posts/${postId}/likes`);
      const likesCount = likesResponse.data.documents ? likesResponse.data.documents.length : 0;
      hourData[hourOfDay].likes += likesCount;
      
      // Get comments count
      const commentsResponse = await axios.get(`${baseUrl}/posts/${postId}/comments`);
      const commentsCount = commentsResponse.data.documents ? commentsResponse.data.documents.length : 0;
      hourData[hourOfDay].comments += commentsCount;
    }));
    
    // Calculate engagement rate for each hour
    hourData.forEach(data => {
      if (data.posts > 0) {
        data.engagement = ((data.likes + data.comments) / data.posts).toFixed(2);
      }
      // Format hour for display (e.g., "00:00" for midnight)
      data.hourFormatted = `${String(data.hour).padStart(2, '0')}:00`;
    });
    
    return hourData;
  } catch (error) {
    console.error('Error fetching golden hours data:', error);
    throw error;
  }
};

/**
 * Get caption length vs engagement data
 * @returns {Promise<Array>} Scatter plot data
 */
export const getCaptionLengthVsEngagement = async () => {
  try {
    console.log('Fetching caption length vs engagement data...');
    
    // Get all posts
    const response = await axios.get(`${baseUrl}/posts`);
    
    if (!response.data.documents) {
      console.log('No posts found');
      return [];
    }
    
    // Process posts to analyze caption length vs engagement
    const scatterData = await Promise.all(response.data.documents.map(async (doc) => {
      const postId = doc.name.split('/').pop();
      const caption = doc.fields?.caption?.stringValue || '';
      const isDeleted = doc.fields?.isDeleted?.booleanValue || false;
      
      // Skip deleted posts
      if (isDeleted) {
        return null;
      }
      
      // Calculate caption length (in characters)
      const captionLength = caption.length;
      
      // Get likes count
      const likesResponse = await axios.get(`${baseUrl}/posts/${postId}/likes`);
      const likesCount = likesResponse.data.documents ? likesResponse.data.documents.length : 0;
      
      // Get comments count
      const commentsResponse = await axios.get(`${baseUrl}/posts/${postId}/comments`);
      const commentsCount = commentsResponse.data.documents ? commentsResponse.data.documents.length : 0;
      
      // Total interactions (likes + comments)
      const totalInteractions = likesCount + commentsCount;
      
      return {
        id: postId,
        captionLength,
        totalInteractions,
        engagement: captionLength > 0 ? (totalInteractions / captionLength).toFixed(5) : 0
      };
    }));
    
    // Filter out null values
    return scatterData.filter(item => item !== null);
  } catch (error) {
    console.error('Error fetching caption length vs engagement data:', error);
    throw error;
  }
};