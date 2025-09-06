#!/usr/bin/env python3
"""
Demo script for PM Internship Scheme Recommendation Engine
Shows the system capabilities with different candidate profiles
"""

from recommendation_engine import InternshipRecommendationEngine
import json

def demo_candidate_profiles():
    """Demonstrate the system with different candidate profiles"""
    
    print("🎯 PM Internship Scheme - AI Recommendation Engine Demo")
    print("=" * 70)
    
    # Initialize the engine
    engine = InternshipRecommendationEngine()
    
    # Demo candidate profiles
    candidates = [
        {
            "name": "Priya - Rural Graduate",
            "profile": {
                "education_level": "Graduate",
                "skills": ["Teaching", "Communication", "Local Language"],
                "sector_interests": ["Education", "Social Work"],
                "location_preference": "Rajasthan",
                "remote_work_preference": False,
                "experience_level": "Beginner"
            }
        },
        {
            "name": "Arjun - Tech Enthusiast",
            "profile": {
                "education_level": "Graduate",
                "skills": ["Programming", "Web Development", "Digital Marketing"],
                "sector_interests": ["Technology"],
                "location_preference": "Bangalore",
                "remote_work_preference": True,
                "experience_level": "Beginner"
            }
        },
        {
            "name": "Sita - Healthcare Aspirant",
            "profile": {
                "education_level": "Post Graduate",
                "skills": ["Data Analysis", "Research", "Healthcare Knowledge"],
                "sector_interests": ["Healthcare", "Government"],
                "location_preference": "Delhi",
                "remote_work_preference": True,
                "experience_level": "Intermediate"
            }
        },
        {
            "name": "Rajesh - Agriculture Graduate",
            "profile": {
                "education_level": "Graduate",
                "skills": ["Agriculture", "Field Work", "Data Collection"],
                "sector_interests": ["Agriculture", "Environment"],
                "location_preference": "Punjab",
                "remote_work_preference": False,
                "experience_level": "Beginner"
            }
        }
    ]
    
    for candidate in candidates:
        print(f"\n👤 Candidate: {candidate['name']}")
        print("-" * 50)
        
        profile = candidate['profile']
        print(f"📚 Education: {profile['education_level']}")
        print(f"🛠️  Skills: {', '.join(profile['skills'])}")
        print(f"❤️  Interests: {', '.join(profile['sector_interests'])}")
        print(f"📍 Location: {profile['location_preference']}")
        print(f"💻 Remote Work: {'Yes' if profile['remote_work_preference'] else 'No'}")
        
        # Get recommendations
        recommendations = engine.get_recommendations(profile, 3)
        
        print(f"\n🎯 Top {len(recommendations)} Recommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec['title']}")
            print(f"   🏢 Organization: {rec['organization']}")
            print(f"   📍 Location: {rec['location']}")
            print(f"   🎯 Match Score: {rec['match_score']}%")
            print(f"   💰 Stipend: {rec['stipend']}")
            print(f"   ⏱️  Duration: {rec['duration']}")
            if rec.get('match_reasons'):
                print(f"   ✅ Why it matches: {', '.join(rec['match_reasons'][:2])}")
        
        print("\n" + "="*70)

def demo_skill_suggestions():
    """Demonstrate skill suggestion feature"""
    print("\n🔧 Skill Suggestion Demo")
    print("-" * 30)
    
    engine = InternshipRecommendationEngine()
    
    sectors = ["Technology", "Healthcare", "Agriculture"]
    for sector in sectors:
        suggestions = engine.get_skill_suggestions([sector])
        print(f"\n📋 Skills for {sector} sector:")
        print(f"   {', '.join(suggestions[:5])}")

def demo_sector_suggestions():
    """Demonstrate sector suggestion feature"""
    print("\n🏭 Sector Suggestion Demo")
    print("-" * 30)
    
    engine = InternshipRecommendationEngine()
    
    skill_sets = [
        ["Digital Marketing", "Social Media"],
        ["Research", "Data Analysis"],
        ["Teaching", "Communication"]
    ]
    
    for skills in skill_sets:
        suggestions = engine.get_sector_suggestions(skills)
        print(f"\n📋 Sectors for skills {', '.join(skills)}:")
        print(f"   {', '.join(suggestions)}")

def main():
    """Main demo function"""
    try:
        demo_candidate_profiles()
        demo_skill_suggestions()
        demo_sector_suggestions()
        
        print("\n🎉 Demo completed successfully!")
        print("🚀 The PM Internship Scheme Recommendation Engine is working perfectly!")
        print("📱 Visit http://localhost:5000 to try the interactive interface")
        
    except Exception as e:
        print(f"❌ Demo failed: {str(e)}")

if __name__ == '__main__':
    main()
