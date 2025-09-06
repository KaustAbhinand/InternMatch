import json
import math
from typing import List, Dict, Any

# Optional imports for advanced features
try:
    import pandas as pd
    import numpy as np
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    print("Note: scikit-learn not available, using simplified matching algorithm")

class InternshipRecommendationEngine:
    def __init__(self):
        self.internships = []
        self.sectors = []
        self.skills = []
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.load_data()
        self.prepare_similarity_matrix()
    
    def load_data(self):
        """Load internship data, sectors, and skills from JSON files"""
        try:
            with open('data/internships.json', 'r', encoding='utf-8') as f:
                self.internships = json.load(f)
            
            with open('data/sectors.json', 'r', encoding='utf-8') as f:
                self.sectors = json.load(f)
            
            with open('data/skills.json', 'r', encoding='utf-8') as f:
                self.skills = json.load(f)
                
        except FileNotFoundError as e:
            print(f"Error loading data: {e}")
            self.internships = []
            self.sectors = []
            self.skills = []
    
    def prepare_similarity_matrix(self):
        """Prepare TF-IDF similarity matrix for skill-based matching"""
        if not self.internships or not HAS_SKLEARN:
            return
        
        # Create text representations of internships
        internship_texts = []
        for internship in self.internships:
            text = f"{internship['title']} {internship['description']} {' '.join(internship['skills_required'])} {internship['sector']}"
            internship_texts.append(text)
        
        # Fit TF-IDF vectorizer
        self.tfidf_matrix = self.vectorizer.fit_transform(internship_texts)
    
    def calculate_match_score(self, candidate_profile: Dict[str, Any], internship: Dict[str, Any]) -> float:
        """Calculate match score between candidate profile and internship"""
        score = 0.0
        max_score = 0.0
        
        # 1. Education Level Match (30% weight)
        education_weight = 0.3
        if candidate_profile.get('education_level') == internship.get('education_level'):
            score += education_weight * 1.0
        elif candidate_profile.get('education_level') == 'Post Graduate' and internship.get('education_level') == 'Graduate':
            score += education_weight * 0.8  # Higher education can apply for lower requirements
        max_score += education_weight
        
        # 2. Skills Match (25% weight)
        skills_weight = 0.25
        candidate_skills = set(candidate_profile.get('skills', []))
        required_skills = set(internship.get('skills_required', []))
        
        if required_skills:
            skills_match_ratio = len(candidate_skills.intersection(required_skills)) / len(required_skills)
            score += skills_weight * skills_match_ratio
        max_score += skills_weight
        
        # 3. Sector Interest Match (20% weight)
        sector_weight = 0.2
        candidate_interests = set(candidate_profile.get('sector_interests', []))
        internship_sector = internship.get('sector', '').lower()
        
        # Check if any of candidate's interests match the internship sector
        for interest in candidate_interests:
            if interest.lower() in internship_sector or internship_sector in interest.lower():
                score += sector_weight * 1.0
                break
        else:
            # Partial match using keywords
            for sector in self.sectors:
                if sector['id'].lower() == internship_sector:
                    for keyword in sector.get('keywords', []):
                        if any(keyword.lower() in interest.lower() for interest in candidate_interests):
                            score += sector_weight * 0.5
                            break
                    break
        max_score += sector_weight
        
        # 4. Location Preference Match (15% weight)
        location_weight = 0.15
        candidate_location = candidate_profile.get('location_preference', '').lower()
        internship_location = internship.get('location', '').lower()
        
        if candidate_location and internship_location:
            # Exact city match
            if candidate_location in internship_location or internship_location in candidate_location:
                score += location_weight * 1.0
            # State match
            elif any(state in internship_location for state in ['maharashtra', 'karnataka', 'tamil nadu', 'delhi', 'rajasthan', 'telangana', 'punjab', 'west bengal', 'haryana', 'goa']):
                if any(state in candidate_location for state in ['maharashtra', 'karnataka', 'tamil nadu', 'delhi', 'rajasthan', 'telangana', 'punjab', 'west bengal', 'haryana', 'goa']):
                    score += location_weight * 0.6
            # Remote work preference
            elif candidate_profile.get('remote_work_preference', False) and internship.get('remote_work', False):
                score += location_weight * 0.8
        max_score += location_weight
        
        # 5. Career Goal Match (15% weight)
        goal_weight = 0.15
        candidate_goal = candidate_profile.get('career_goal', '')
        if candidate_goal:
            # Check if internship title or description matches career goal
            internship_text = f"{internship.get('title', '')} {internship.get('description', '')}".lower()
            goal_keywords = {
                'Software Developer': ['software', 'developer', 'programming', 'coding', 'tech'],
                'Data Analyst': ['data', 'analyst', 'analytics', 'research', 'statistics'],
                'Digital Marketer': ['marketing', 'digital', 'social media', 'content', 'brand'],
                'Project Manager': ['project', 'manager', 'coordination', 'planning', 'leadership'],
                'UI/UX Designer': ['design', 'ui', 'ux', 'user interface', 'user experience'],
                'Business Analyst': ['business', 'analyst', 'strategy', 'consulting', 'analysis'],
                'Content Writer': ['content', 'writer', 'writing', 'blog', 'copy'],
                'Social Media Manager': ['social media', 'community', 'engagement', 'platform'],
                'Research Analyst': ['research', 'analyst', 'study', 'investigation', 'analysis'],
                'Government Officer': ['government', 'public', 'policy', 'administration', 'ministry'],
                'Healthcare Professional': ['healthcare', 'health', 'medical', 'hospital', 'public health'],
                'Education Specialist': ['education', 'teaching', 'learning', 'academic', 'school'],
                'Environmental Consultant': ['environment', 'sustainability', 'green', 'conservation'],
                'Financial Advisor': ['finance', 'financial', 'banking', 'investment', 'economic'],
                'Agriculture Specialist': ['agriculture', 'farming', 'rural', 'crop', 'agricultural']
            }
            
            if candidate_goal in goal_keywords:
                for keyword in goal_keywords[candidate_goal]:
                    if keyword in internship_text:
                        score += goal_weight * 0.3
                        break
                max_score += goal_weight
        
        # 6. Experience Level Match (10% weight)
        experience_weight = 0.1
        candidate_experience = candidate_profile.get('experience_level', 'Beginner')
        internship_experience = internship.get('experience_level', 'Beginner')
        
        if candidate_experience == internship_experience:
            score += experience_weight * 1.0
        elif candidate_experience == 'Intermediate' and internship_experience == 'Beginner':
            score += experience_weight * 0.8
        max_score += experience_weight
        
        # Normalize score
        if max_score > 0:
            return score / max_score
        return 0.0
    
    def get_recommendations(self, candidate_profile: Dict[str, Any], num_recommendations: int = 5) -> List[Dict[str, Any]]:
        """Get personalized internship recommendations for a candidate"""
        if not self.internships:
            return []
        
        # Calculate match scores for all internships
        scored_internships = []
        for internship in self.internships:
            match_score = self.calculate_match_score(candidate_profile, internship)
            # compute explicit skills match percentage
            candidate_skills = set(candidate_profile.get('skills', []))
            required_skills = set(internship.get('skills_required', []))
            skills_match_percentage = 0.0
            if required_skills:
                skills_match_percentage = (len(candidate_skills.intersection(required_skills)) / len(required_skills)) * 100.0
            scored_internships.append({
                'internship': internship,
                'match_score': match_score,
                'skills_match_percentage': round(skills_match_percentage, 1)
            })
        
        # Sort by match score (descending)
        scored_internships.sort(key=lambda x: x['match_score'], reverse=True)
        
        # Return top recommendations with match explanations
        recommendations = []
        for item in scored_internships[:num_recommendations]:
            if item['match_score'] > 0.1:  # Only include if there's some match
                recommendation = item['internship'].copy()
                recommendation['match_score'] = round(item['match_score'] * 100, 1)
                recommendation['skills_match_percentage'] = item['skills_match_percentage']
                recommendation['match_reasons'] = self.get_match_reasons(candidate_profile, item['internship'])
                recommendations.append(recommendation)
        
        return recommendations
    
    def get_match_reasons(self, candidate_profile: Dict[str, Any], internship: Dict[str, Any]) -> List[str]:
        """Generate human-readable reasons for the match"""
        reasons = []
        
        # Education match
        if candidate_profile.get('education_level') == internship.get('education_level'):
            reasons.append("Your education level matches the requirement")
        
        # Skills match
        candidate_skills = set(candidate_profile.get('skills', []))
        required_skills = set(internship.get('skills_required', []))
        matching_skills = candidate_skills.intersection(required_skills)
        if matching_skills:
            reasons.append(f"You have relevant skills: {', '.join(list(matching_skills)[:3])}")
        
        # Sector interest match
        candidate_interests = candidate_profile.get('sector_interests', [])
        internship_sector = internship.get('sector', '')
        if any(interest.lower() in internship_sector.lower() for interest in candidate_interests):
            reasons.append(f"Matches your interest in {internship_sector}")
        
        # Location match
        candidate_location = candidate_profile.get('location_preference', '')
        internship_location = internship.get('location', '')
        if candidate_location and internship_location:
            if candidate_location.lower() in internship_location.lower():
                reasons.append(f"Located in your preferred area: {internship_location}")
            elif candidate_profile.get('remote_work_preference', False) and internship.get('remote_work', False):
                reasons.append("Offers remote work as per your preference")
        
        # Career goal match
        candidate_goal = candidate_profile.get('career_goal', '')
        if candidate_goal:
            internship_text = f"{internship.get('title', '')} {internship.get('description', '')}".lower()
            goal_keywords = {
                'Software Developer': ['software', 'developer', 'programming', 'coding', 'tech'],
                'Data Analyst': ['data', 'analyst', 'analytics', 'research', 'statistics'],
                'Digital Marketer': ['marketing', 'digital', 'social media', 'content', 'brand'],
                'Project Manager': ['project', 'manager', 'coordination', 'planning', 'leadership'],
                'UI/UX Designer': ['design', 'ui', 'ux', 'user interface', 'user experience'],
                'Business Analyst': ['business', 'analyst', 'strategy', 'consulting', 'analysis'],
                'Content Writer': ['content', 'writer', 'writing', 'blog', 'copy'],
                'Social Media Manager': ['social media', 'community', 'engagement', 'platform'],
                'Research Analyst': ['research', 'analyst', 'study', 'investigation', 'analysis'],
                'Government Officer': ['government', 'public', 'policy', 'administration', 'ministry'],
                'Healthcare Professional': ['healthcare', 'health', 'medical', 'hospital', 'public health'],
                'Education Specialist': ['education', 'teaching', 'learning', 'academic', 'school'],
                'Environmental Consultant': ['environment', 'sustainability', 'green', 'conservation'],
                'Financial Advisor': ['finance', 'financial', 'banking', 'investment', 'economic'],
                'Agriculture Specialist': ['agriculture', 'farming', 'rural', 'crop', 'agricultural']
            }
            
            if candidate_goal in goal_keywords:
                for keyword in goal_keywords[candidate_goal]:
                    if keyword in internship_text:
                        reasons.append(f"Aligns with your career goal: {candidate_goal}")
                        break
        
        # Experience level
        if candidate_profile.get('experience_level') == internship.get('experience_level'):
            reasons.append("Suitable for your experience level")
        
        return reasons[:3]  # Return top 3 reasons
    
    def get_sector_suggestions(self, skills: List[str]) -> List[str]:
        """Suggest sectors based on candidate skills"""
        skill_sector_mapping = {
            'Digital Marketing': 'Technology',
            'Social Media': 'Technology',
            'Content Writing': 'Technology',
            'Analytics': 'Technology',
            'Research': 'Government',
            'Data Analysis': 'Healthcare',
            'Teaching': 'Education',
            'Communication': 'Social Work',
            'Finance': 'Finance',
            'Agriculture': 'Agriculture',
            'Environmental Science': 'Environment',
            'Tourism': 'Tourism',
            'History': 'Culture'
        }
        
        suggested_sectors = set()
        for skill in skills:
            if skill in skill_sector_mapping:
                suggested_sectors.add(skill_sector_mapping[skill])
        
        return list(suggested_sectors)
    
    def get_skill_suggestions(self, sector_interests: List[str]) -> List[str]:
        """Suggest skills based on sector interests"""
        sector_skill_mapping = {
            'Technology': ['Digital Marketing', 'Programming', 'Web Development', 'Data Analysis'],
            'Government': ['Research', 'Report Writing', 'Policy Analysis', 'Communication'],
            'Healthcare': ['Data Analysis', 'Research', 'Healthcare Knowledge', 'Statistics'],
            'Education': ['Teaching', 'Communication', 'Content Development', 'Technology'],
            'Environment': ['Environmental Science', 'Research', 'Field Work', 'Documentation'],
            'Finance': ['Finance', 'Data Analysis', 'Communication', 'Excel'],
            'Social Work': ['Communication', 'Community Engagement', 'Social Work', 'Documentation'],
            'Agriculture': ['Agriculture', 'Field Work', 'Data Collection', 'Technology'],
            'Tourism': ['Communication', 'Marketing', 'Local Knowledge', 'Customer Service'],
            'Culture': ['Research', 'History', 'Cultural Knowledge', 'Documentation']
        }
        
        suggested_skills = set()
        for sector in sector_interests:
            if sector in sector_skill_mapping:
                suggested_skills.update(sector_skill_mapping[sector])
        
        return list(suggested_skills)[:10]  # Return top 10 suggestions
