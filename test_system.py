#!/usr/bin/env python3
"""
Test script for PM Internship Scheme Recommendation Engine
"""

import json
import sys
from recommendation_engine import InternshipRecommendationEngine

def test_recommendation_engine():
    """Test the recommendation engine with sample data"""
    print("🧪 Testing PM Internship Scheme Recommendation Engine...")
    print("-" * 60)
    
    try:
        # Initialize the engine
        engine = InternshipRecommendationEngine()
        print("✅ Recommendation engine initialized successfully")
        
        # Test data loading
        if not engine.internships:
            print("❌ No internships loaded")
            return False
        
        if not engine.sectors:
            print("❌ No sectors loaded")
            return False
            
        if not engine.skills:
            print("❌ No skills loaded")
            return False
        
        print(f"✅ Loaded {len(engine.internships)} internships")
        print(f"✅ Loaded {len(engine.sectors)} sectors")
        print(f"✅ Loaded {len(engine.skills)} skills")
        
        # Test recommendation with sample candidate
        sample_candidate = {
            'education_level': 'Graduate',
            'skills': ['Digital Marketing', 'Communication', 'Research'],
            'sector_interests': ['Technology', 'Government'],
            'location_preference': 'Mumbai',
            'remote_work_preference': True,
            'experience_level': 'Beginner'
        }
        
        print("\n🎯 Testing recommendations with sample candidate:")
        print(f"   Education: {sample_candidate['education_level']}")
        print(f"   Skills: {', '.join(sample_candidate['skills'])}")
        print(f"   Interests: {', '.join(sample_candidate['sector_interests'])}")
        print(f"   Location: {sample_candidate['location_preference']}")
        
        recommendations = engine.get_recommendations(sample_candidate, 3)
        
        if not recommendations:
            print("❌ No recommendations generated")
            return False
        
        print(f"\n✅ Generated {len(recommendations)} recommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec['title']} at {rec['organization']}")
            print(f"      Match Score: {rec['match_score']}%")
            print(f"      Location: {rec['location']}")
            print(f"      Sector: {rec['sector']}")
            if rec.get('match_reasons'):
                print(f"      Reasons: {', '.join(rec['match_reasons'][:2])}")
            print()
        
        # Test skill suggestions
        skill_suggestions = engine.get_skill_suggestions(['Technology', 'Government'])
        print(f"✅ Skill suggestions for Technology & Government: {len(skill_suggestions)} skills")
        
        # Test sector suggestions
        sector_suggestions = engine.get_sector_suggestions(['Digital Marketing', 'Research'])
        print(f"✅ Sector suggestions for Digital Marketing & Research: {len(sector_suggestions)} sectors")
        
        print("\n🎉 All tests passed! The recommendation engine is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

def test_data_integrity():
    """Test data file integrity"""
    print("\n🔍 Testing data file integrity...")
    
    data_files = {
        'internships': 'data/internships.json',
        'sectors': 'data/sectors.json',
        'skills': 'data/skills.json'
    }
    
    for name, filepath in data_files.items():
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not isinstance(data, list):
                print(f"❌ {name}: Data should be a list")
                return False
            
            if len(data) == 0:
                print(f"❌ {name}: Data file is empty")
                return False
            
            print(f"✅ {name}: {len(data)} items loaded successfully")
            
        except FileNotFoundError:
            print(f"❌ {name}: File not found at {filepath}")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ {name}: Invalid JSON - {str(e)}")
            return False
        except Exception as e:
            print(f"❌ {name}: Error loading data - {str(e)}")
            return False
    
    return True

def main():
    """Main test function"""
    print("🚀 PM Internship Scheme - System Test")
    print("=" * 60)
    
    # Test data integrity
    if not test_data_integrity():
        print("\n❌ Data integrity tests failed!")
        sys.exit(1)
    
    # Test recommendation engine
    if not test_recommendation_engine():
        print("\n❌ Recommendation engine tests failed!")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS PASSED!")
    print("✅ The PM Internship Scheme Recommendation Engine is ready to use!")
    print("🚀 Run 'python run.py' to start the application")
    print("🌐 Then visit http://localhost:5000 in your browser")

if __name__ == '__main__':
    main()
