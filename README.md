# InternMatch - PM Internship Scheme AI Recommendation Engine

A lightweight AI-based recommendation engine that suggests relevant internships to candidates based on their profile, academic background, interests, and location preferences. Designed specifically for first-generation learners and candidates from rural areas with limited digital exposure.

## 🎯 Problem Solved

The PM Internship Scheme receives applications from youth across India, including rural areas, tribal districts, urban slums, and remote colleges. Many candidates are first-generation learners with limited digital exposure and no prior internship experience. With hundreds of internships listed, it becomes difficult to identify which ones match their skills, interests, or aspirations.

## ✨ Features

- **Simple Candidate Input**: 4-step intuitive form capturing education, skills, sector interests, and location
- **Smart Recommendations**: Rule-based algorithm suggests 3-5 top internships with match scores
- **Mobile-Friendly UI**: Clean, responsive interface with visual cues and minimal text
- **Lightweight**: Easy to integrate with existing PM Internship Scheme portal
- **Accessibility**: Designed for users with low digital literacy
- **Visual Feedback**: Progress indicators, match scores, and clear explanations

## 🚀 Quick Start

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Test the system:**
```bash
python test_system.py
```

3. **Run the application:**
```bash
python run.py
```

4. **Open your browser and go to:** `http://localhost:5000`

## 📁 Project Structure

```
sih2025/
├── app.py                      # Main Flask application
├── recommendation_engine.py    # Core recommendation algorithm
├── run.py                      # Application runner
├── test_system.py             # System testing script
├── config.py                  # Configuration settings
├── requirements.txt           # Python dependencies
├── data/                      # Sample data
│   ├── internships.json      # 12 sample internships
│   ├── sectors.json          # 10 industry sectors
│   └── skills.json           # 50 relevant skills
├── templates/                 # HTML templates
│   ├── index.html            # Main form page
│   └── results.html          # Results display page
└── static/                   # Static assets
    ├── css/
    │   └── style.css         # Mobile-friendly styling
    └── js/
        ├── app.js            # Main application logic
        └── results.js        # Results page functionality
```

## 🧠 How It Works

1. **Candidate Input**: 4-step form collects:
   - Education level and experience
   - Skills (with auto-suggestions)
   - Sector interests (visual selection)
   - Location preferences

2. **Smart Matching**: Rule-based algorithm calculates match scores based on:
   - Education level match (30% weight)
   - Skills alignment (25% weight)
   - Sector interest match (20% weight)
   - Location preference (15% weight)
   - Experience level (10% weight)

3. **Personalized Results**: Returns 3-5 recommendations with:
   - Match percentage scores
   - Detailed explanations
   - Visual cards with all relevant information
   - Clear next steps

## 🎨 User Experience

- **Progressive Form**: Step-by-step input with progress indicators
- **Visual Selection**: Sector cards with icons and descriptions
- **Smart Suggestions**: Auto-suggest skills based on selected sectors
- **Mobile-First**: Responsive design works on all devices
- **Accessibility**: Large buttons, clear text, intuitive navigation

## 🔧 Technology Stack

- **Backend**: Flask (Python) - Lightweight and easy to deploy
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla) - No heavy frameworks
- **Algorithm**: Rule-based matching with scikit-learn for similarity
- **Data**: JSON-based storage for easy integration
- **Styling**: Custom CSS with mobile-first responsive design

## 📊 Sample Data

The system includes:
- **12 Sample Internships** across various sectors (Technology, Government, Healthcare, etc.)
- **10 Industry Sectors** with detailed descriptions and keywords
- **50 Relevant Skills** commonly required for internships

## 🔌 Integration

This system is designed to be easily integrated with the existing PM Internship Scheme portal:

1. **API Endpoints**: RESTful APIs for all functionality
2. **JSON Data**: Easy to replace with real internship data
3. **Modular Design**: Components can be integrated separately
4. **Lightweight**: Minimal resource requirements

## 🧪 Testing

Run the comprehensive test suite:
```bash
python test_system.py
```

Tests include:
- Data file integrity
- Recommendation engine functionality
- Sample candidate matching
- Skill and sector suggestions

## 🎯 Key Benefits

- **Reduces Application Mismatch**: Smart matching prevents irrelevant applications
- **Improves User Experience**: Simple, visual interface for all users
- **Increases Success Rate**: Better matches lead to higher acceptance rates
- **Saves Time**: Candidates see only relevant opportunities
- **Accessible**: Works for users with limited digital literacy

## 🚀 Deployment

The system is designed for easy deployment:

1. **Local Development**: Run `python run.py`
2. **Production**: Deploy Flask app to any hosting service
3. **Integration**: Use API endpoints to integrate with existing portal
4. **Scaling**: Add more internships and sectors as needed

## 📱 Mobile Compatibility

- Responsive design works on all screen sizes
- Touch-friendly interface with large buttons
- Optimized for slow internet connections
- Works offline for form completion

## 🔮 Future Enhancements

- Machine learning model for better recommendations
- Integration with real PM Internship Scheme data
- Multi-language support for regional languages
- Advanced filtering and search options
- User feedback system for continuous improvement
