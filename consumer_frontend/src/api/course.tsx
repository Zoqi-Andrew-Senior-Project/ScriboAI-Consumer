// src/api/course.ts
import axios from 'axios';
import { useState } from 'react';
import { getCSRFToken } from '@/utils/csrf';

    export interface Course {
        uuid: string;
        title: string;
        objectives: string[];
        duration: string;
        summary: string;
        status: string;
        organization: string;
        modules: {
            uuid: string;
            name: string;
            duration: string;
            subtopics: string[];
            features: string[];
        }[];
    }

export const fetchCourseDetails = async (courseId: string) => {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      throw new Error('Failed to get CSRF token');
    }

    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_ADDRESS}/course/course/?course=${courseId}`,
      {
        headers: {
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      }
    );
    
    return response.data.course;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};