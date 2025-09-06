# PM Internship Scheme - Profile & Features Documentation

## Overview
This document describes the comprehensive profile management system and two main features integrated into the PM Internship Scheme platform.

## Profile Management System

### Profile Page (`/profile`)
A comprehensive user profile page that allows users to manage all their information in one place:

#### Personal Information
- **Full Name** (required, unique)
- **Mobile Number** (required, unique, 10 digits)
- **Email Address** (required, unique)
- **Aadhar Card Number** (required, unique, 12 digits)
- **College/University** (required)
- **Location** (required)

#### Education & Experience
- **Education Level** (Graduate/Post Graduate/PhD)
- **Experience Level** (Beginner/Intermediate/Advanced)
- **Field of Study** (optional)

#### Skills & Expertise
- **Skills Management**: Add/remove skills with search functionality
- **Skill Suggestions**: Auto-suggested skills based on available options
- **Custom Skills**: Users can add their own skills

#### Resume & Documents
- **Resume Upload**: Support for PDF, DOC, DOCX files (max 5MB)
- **Drag & Drop**: Easy file upload interface
- **File Management**: View current resume, replace if needed

#### Interests & Preferences
- **Sector Interests**: Select from available sectors (Technology, Government, Healthcare, etc.)
- **Location Preferences**: Preferred work locations
- **Remote Work**: Option to indicate remote work preference

### Profile Features
- **Real-time Validation**: Form validation with error messages
- **Unique Field Checking**: Ensures mobile, email, and Aadhar are unique
- **Auto-save**: Profile data is saved and can be edited anytime
- **Data Persistence**: Profile data is stored and retrieved on page load

## Feature 1: Enhanced Internship Recommendations

### Access Points
- **Main Home Page**: Original multi-step form
- **Profile Page**: "Get Internship Recommendations" button
- **Dedicated Recommendations Page**: `/recommendations`

### Data Sources
1. **Profile Data**: Uses saved profile information
2. **Manual Entry**: Quick form for one-time recommendations
3. **Resume Upload**: Extract skills from uploaded resume

### Recommendation Process
1. **Data Collection**: Gather user preferences and skills
2. **Matching Algorithm**: Match user profile against internship requirements
3. **Scoring System**: Calculate match percentage based on:
   - Skills alignment
   - Education level match
   - Experience level match
   - Location preferences
   - Sector interests
4. **Results Display**: Show ranked recommendations with:
   - Match percentage
   - Required skills
   - Match reasons
   - Apply links

## Feature 2: Career Goals & Skill Requirements Analysis

### Goals Page (`/goals`)
A dedicated page for setting career goals and getting market-based skill requirements:

#### Goal Setting
- **Target Job Role**: Select from predefined list (Software Developer, Data Analyst, etc.)
- **Additional Details**: Optional description of career aspirations
- **Market Analysis**: Real-time analysis of current internship market

#### Skill Requirements Analysis
- **Required Skills**: Skills needed for the selected goal
- **Market Data**: Based on actual internship postings
- **Skill Gap Analysis**: Compare user's current skills vs. required skills
- **Learning Path**: Step-by-step guide to develop missing skills

#### Features
- **Add Skills to Profile**: One-click addition of required skills
- **Bulk Skill Addition**: Add all required skills at once
- **Progress Tracking**: Visual representation of skill gaps
- **Market Insights**: Statistics about skill demand in the market

## API Endpoints

### Profile Management
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update user profile
- `POST /api/profile/skills` - Add skills to profile
- `POST /api/upload-resume` - Upload resume file

### Recommendations
- `POST /api/recommendations` - Get internship recommendations
- `POST /api/extract-skills` - Extract skills from resume

### Goals
- `POST /api/goals` - Save career goal
- `POST /api/goal-requirements` - Get goal requirements and market analysis

## Navigation Structure

### Main Navigation
- **Home** (`/`) - Main landing page with multi-step form
- **Profile** (`/profile`) - User profile management
- **Recommendations** (`/recommendations`) - Quick recommendations
- **Career Goals** (`/goals`) - Goal setting and skill analysis

### User Flow
1. **First Time Users**: Start with profile creation
2. **Returning Users**: Can use profile data for quick recommendations
3. **Goal Setting**: Set career goals and get skill requirements
4. **Recommendations**: Get personalized internship matches

## Technical Implementation

### Frontend
- **Responsive Design**: Works on desktop and mobile
- **Real-time Validation**: Form validation with user feedback
- **Drag & Drop**: File upload with visual feedback
- **Notification System**: Success/error messages
- **Loading States**: Visual feedback during API calls

### Backend
- **Data Storage**: In-memory storage (can be replaced with database)
- **File Upload**: Secure file handling with unique naming
- **Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and user feedback

### Security Features
- **Unique Field Validation**: Prevents duplicate mobile/email/Aadhar
- **File Type Validation**: Only allows safe file types
- **File Size Limits**: Prevents large file uploads
- **Input Sanitization**: Clean user inputs

## Usage Instructions

### For Users
1. **Create Profile**: Visit `/profile` and fill in all required information
2. **Set Goals**: Go to `/goals` to set career objectives and get skill requirements
3. **Get Recommendations**: Use `/recommendations` for quick matches or use profile data
4. **Update Information**: Return to profile page anytime to update information

### For Developers
1. **Run the Application**: `python app.py`
2. **Access Profile**: Navigate to `http://localhost:5000/profile`
3. **Test Features**: Use the various forms to test functionality
4. **Check API**: Use browser dev tools to monitor API calls

## Future Enhancements
- **Database Integration**: Replace in-memory storage with proper database
- **User Authentication**: Add login/signup system
- **Advanced Analytics**: More detailed skill gap analysis
- **Recommendation History**: Track previous recommendations
- **Email Notifications**: Notify users of new matching internships
- **Social Features**: Share recommendations with others
