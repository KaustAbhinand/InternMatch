from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
from recommendation_engine import InternshipRecommendationEngine
import os
import tempfile

app = Flask(__name__)
CORS(app)

# Initialize recommendation engine
recommendation_engine = InternshipRecommendationEngine()

@app.route('/')
def index():
    """Main page with candidate input form"""
    return render_template('index.html')

@app.route('/api/sectors')
def get_sectors():
    """Get all available sectors"""
    try:
        with open('data/sectors.json', 'r', encoding='utf-8') as f:
            sectors = json.load(f)
        return jsonify(sectors)
    except FileNotFoundError:
        return jsonify([])

@app.route('/api/skills')
def get_skills():
    """Get all available skills"""
    try:
        with open('data/skills.json', 'r', encoding='utf-8') as f:
            skills = json.load(f)
        return jsonify(skills)
    except FileNotFoundError:
        return jsonify([])

@app.route('/api/internships')
def get_internships():
    """Get all internships"""
    try:
        with open('data/internships.json', 'r', encoding='utf-8') as f:
            internships = json.load(f)
        return jsonify(internships)
    except FileNotFoundError:
        return jsonify([])

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Get personalized internship recommendations"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['education_level', 'skills', 'sector_interests']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create candidate profile
        candidate_profile = {
            'education_level': data.get('education_level'),
            'skills': data.get('skills', []),
            'sector_interests': data.get('sector_interests', []),
            'location_preference': data.get('location_preference', ''),
            'remote_work_preference': data.get('remote_work_preference', False),
            'experience_level': data.get('experience_level', 'Beginner')
        }
        
        # Get recommendations
        num_recommendations = data.get('num_recommendations', 5)
        recommendations = recommendation_engine.get_recommendations(candidate_profile, num_recommendations)
        
        return jsonify({
            'recommendations': recommendations,
            'total_found': len(recommendations),
            'candidate_profile': candidate_profile
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions/sectors', methods=['POST'])
def get_sector_suggestions():
    """Get sector suggestions based on skills"""
    try:
        data = request.get_json()
        skills = data.get('skills', [])
        
        if not skills:
            return jsonify([])
        
        suggestions = recommendation_engine.get_sector_suggestions(skills)
        return jsonify(suggestions)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions/skills', methods=['POST'])
def get_skill_suggestions():
    """Get skill suggestions based on sector interests"""
    try:
        data = request.get_json()
        sector_interests = data.get('sector_interests', [])
        
        if not sector_interests:
            return jsonify([])
        
        suggestions = recommendation_engine.get_skill_suggestions(sector_interests)
        return jsonify(suggestions)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract-skills', methods=['POST'])
def extract_skills_from_resume():
    """Extract skills from an uploaded resume (PDF/DOCX/TXT)."""
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'Missing file field: resume'}), 400

        resume_file = request.files['resume']
        if resume_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Save to a temp file to support various parsers
        suffix = os.path.splitext(resume_file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            resume_file.save(tmp.name)
            temp_path = tmp.name

        try:
            from skill_extractor import ResumeSkillExtractor
            extractor = ResumeSkillExtractor()
            skills = extractor.extract_skills_from_file(temp_path)
        finally:
            try:
                os.remove(temp_path)
            except Exception:
                pass

        return jsonify({'skills': skills})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations/from-resume', methods=['POST'])
def recommendations_from_resume():
    """Upload resume and return recommendations using extracted skills.

    Expected multipart/form-data with:
    - resume: file
    - education_level: optional string
    - sector_interests: optional JSON array string or comma-separated string
    - location_preference: optional string
    - remote_work_preference: optional bool-like string ('true'/'false')
    - experience_level: optional string
    - num_recommendations: optional int-like string
    """
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'Missing file field: resume'}), 400

        resume_file = request.files['resume']
        if resume_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        suffix = os.path.splitext(resume_file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            resume_file.save(tmp.name)
            temp_path = tmp.name

        try:
            from skill_extractor import ResumeSkillExtractor
            extractor = ResumeSkillExtractor()
            extracted_skills = extractor.extract_skills_from_file(temp_path)
        finally:
            try:
                os.remove(temp_path)
            except Exception:
                pass

        # Parse other fields from form
        def parse_bool(val: str) -> bool:
            return str(val).lower() in ['1', 'true', 'yes', 'y']

        def parse_list(val: str):
            if not val:
                return []
            try:
                return json.loads(val)
            except Exception:
                return [x.strip() for x in str(val).split(',') if x.strip()]

        education_level = request.form.get('education_level') or ''
        sector_interests = parse_list(request.form.get('sector_interests', ''))
        location_preference = request.form.get('location_preference', '')
        remote_work_preference = parse_bool(request.form.get('remote_work_preference', 'false'))
        experience_level = request.form.get('experience_level', 'Beginner')
        num_recommendations = int(request.form.get('num_recommendations', '5'))

        candidate_profile = {
            'education_level': education_level,
            'skills': extracted_skills,
            'sector_interests': sector_interests,
            'location_preference': location_preference,
            'remote_work_preference': remote_work_preference,
            'experience_level': experience_level
        }

        recommendations = recommendation_engine.get_recommendations(candidate_profile, num_recommendations)
        return jsonify({
            'recommendations': recommendations,
            'total_found': len(recommendations),
            'candidate_profile': candidate_profile
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/goal-requirements', methods=['POST'])
def get_goal_requirements():
    """Get market-based goal requirements"""
    try:
        from skill_extractor import SkillExtractor
        
        data = request.get_json()
        goal = data.get('goal', '')
        
        if not goal:
            return jsonify({'error': 'Goal is required'}), 400
        
        # Initialize skill extractor
        extractor = SkillExtractor()
        
        # Get market-based requirements
        requirements = extractor.get_market_demand_skills(goal)
        
        return jsonify(requirements)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/results')
def results():
    """Results page to display recommendations"""
    return render_template('results.html')

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
