# Configuration file for PM Internship Scheme Recommendation Engine

# Flask Configuration
DEBUG = True
SECRET_KEY = 'pm-internship-recommendation-engine-2024'

# Recommendation Engine Configuration
MAX_RECOMMENDATIONS = 5
MIN_MATCH_SCORE = 0.1  # Minimum score to include in recommendations

# Scoring Weights
SCORING_WEIGHTS = {
    'education_level': 0.30,    # 30% weight for education match
    'skills': 0.25,             # 25% weight for skills match
    'sector_interests': 0.20,   # 20% weight for sector interest match
    'location': 0.15,           # 15% weight for location preference
    'experience_level': 0.10    # 10% weight for experience level match
}

# Data Files
DATA_FILES = {
    'internships': 'data/internships.json',
    'sectors': 'data/sectors.json',
    'skills': 'data/skills.json'
}

# UI Configuration
UI_CONFIG = {
    'max_skills_display': 12,
    'max_sectors_display': 10,
    'animation_duration': 300,  # milliseconds
    'auto_save_interval': 30000  # 30 seconds
}

# API Configuration
API_CONFIG = {
    'rate_limit': 100,  # requests per minute
    'timeout': 30,      # seconds
    'max_content_length': 16 * 1024 * 1024  # 16MB
}
