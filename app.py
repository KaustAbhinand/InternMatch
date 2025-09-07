from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
from recommendation_engine import InternshipRecommendationEngine
import os
import tempfile
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize recommendation engine
recommendation_engine = InternshipRecommendationEngine()

# User profiles storage (in production, use a proper database)
user_profiles = {}
user_goals = {}

# Create uploads directory
UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

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
        num_recommendations = data.get('num_recommendations', 20)  # Increased from 5 to show more internships
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
    """Extract comprehensive data from an uploaded resume (PDF/DOCX/TXT)."""
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'Missing file field: resume'}), 400

        resume_file = request.files['resume']
        if resume_file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
        file_extension = os.path.splitext(resume_file.filename)[1].lower()
        if file_extension not in allowed_extensions:
            return jsonify({'error': f'Unsupported file type. Allowed: {", ".join(allowed_extensions)}'}), 400

        # Save to a temp file to support various parsers
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp:
            resume_file.save(tmp.name)
            temp_path = tmp.name

        try:
            from skill_extractor import ResumeSkillExtractor
            extractor = ResumeSkillExtractor()
            
            # Extract comprehensive data
            extracted_data = extractor.extract_comprehensive_data(temp_path)
            
            # Log extraction results for debugging
            print(f"Resume extraction results:")
            print(f"  Skills found: {len(extracted_data['skills'])}")
            print(f"  Education: {extracted_data['education'][:100]}...")
            print(f"  Experience: {extracted_data['experience'][:100]}...")
            print(f"  Name: {extracted_data['name']}")
            print(f"  Email: {extracted_data['email']}")
            
            return jsonify(extracted_data)
            
        finally:
            try:
                os.remove(temp_path)
            except Exception:
                pass

    except Exception as e:
        print(f"Error in resume extraction: {e}")
        return jsonify({'error': f'Resume processing failed: {str(e)}'}), 500

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
        num_recommendations = int(request.form.get('num_recommendations', '20'))

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
        import os
        import sys
        
        # Ensure we're in the correct directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if current_dir not in sys.path:
            sys.path.insert(0, current_dir)
        
        from skill_extractor import SkillExtractor
        
        data = request.get_json()
        goal = data.get('goal', '')
        
        if not goal:
            return jsonify({'error': 'Goal is required'}), 400
        
        # Initialize skill extractor
        extractor = SkillExtractor()
        
        # Check if data was loaded successfully
        if not extractor.internships:
            print(f"Warning: No internship data loaded. Current directory: {os.getcwd()}")
            print(f"Script directory: {current_dir}")
            print(f"Data directory exists: {os.path.exists(os.path.join(current_dir, 'data'))}")
            
            return jsonify({
                'error': 'Unable to load internship data. Please check if data files exist.',
                'fallback': True,
                'debug_info': {
                    'current_dir': os.getcwd(),
                    'script_dir': current_dir,
                    'data_dir_exists': os.path.exists(os.path.join(current_dir, 'data'))
                }
            }), 500
        
        # Get market-based requirements
        requirements = extractor.get_market_demand_skills(goal)
        
        return jsonify(requirements)
        
    except ImportError as e:
        return jsonify({'error': f'Module import error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/profile', methods=['GET', 'POST'])
def manage_profile():
    """Get or update user profile"""
    try:
        if request.method == 'GET':
            # For demo purposes, return a default profile
            # In production, get from database based on user session
            user_id = request.args.get('user_id', 'default_user')
            profile = user_profiles.get(user_id, {})
            return jsonify(profile)
        
        elif request.method == 'POST':
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['full_name', 'mobile_number', 'email', 'aadhar_number', 
                             'college', 'location', 'education_level', 'experience_level']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({'error': f'Missing required field: {field}'}), 400
            
            # Check for unique fields
            user_id = request.args.get('user_id', 'default_user')
            
            # Check if mobile number is unique
            for uid, profile in user_profiles.items():
                if uid != user_id and profile.get('mobile_number') == data['mobile_number']:
                    return jsonify({'error': 'Mobile number already exists'}), 400
            
            # Check if email is unique
            for uid, profile in user_profiles.items():
                if uid != user_id and profile.get('email') == data['email']:
                    return jsonify({'error': 'Email already exists'}), 400
            
            # Check if aadhar is unique
            for uid, profile in user_profiles.items():
                if uid != user_id and profile.get('aadhar_number') == data['aadhar_number']:
                    return jsonify({'error': 'Aadhar number already exists'}), 400
            
            # Add timestamp
            data['updated_at'] = datetime.now().isoformat()
            
            # Save profile
            user_profiles[user_id] = data
            
            return jsonify({'message': 'Profile saved successfully', 'profile': data})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile/skills', methods=['POST'])
def update_profile_skills():
    """Add skills to user profile"""
    try:
        data = request.get_json()
        user_id = request.args.get('user_id', 'default_user')
        
        if 'skill' in data:
            # Add single skill
            skill = data['skill']
            if user_id not in user_profiles:
                user_profiles[user_id] = {'skills': []}
            if 'skills' not in user_profiles[user_id]:
                user_profiles[user_id]['skills'] = []
            if skill not in user_profiles[user_id]['skills']:
                user_profiles[user_id]['skills'].append(skill)
        
        elif 'skills' in data:
            # Add multiple skills
            skills = data['skills']
            if user_id not in user_profiles:
                user_profiles[user_id] = {'skills': []}
            if 'skills' not in user_profiles[user_id]:
                user_profiles[user_id]['skills'] = []
            for skill in skills:
                if skill not in user_profiles[user_id]['skills']:
                    user_profiles[user_id]['skills'].append(skill)
        
        return jsonify({'message': 'Skills updated successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """Upload user resume"""
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Return file URL
        resume_url = f"/static/uploads/{unique_filename}"
        
        return jsonify({
            'message': 'Resume uploaded successfully',
            'resume_url': resume_url,
            'resume_filename': file.filename
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals', methods=['POST'])
def save_goal():
    """Save user career goal"""
    try:
        data = request.get_json()
        user_id = request.args.get('user_id', 'default_user')
        
        if 'goal' not in data:
            return jsonify({'error': 'Goal is required'}), 400
        
        # Add timestamp
        data['created_at'] = datetime.now().isoformat()
        
        # Save goal
        user_goals[user_id] = data
        
        return jsonify({'message': 'Goal saved successfully', 'goal': data})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/profile')
def profile():
    """Profile page for user information management"""
    return render_template('profile.html')

@app.route('/goals')
def goals():
    """Career goals page for setting and analyzing goals"""
    return render_template('goals.html')

@app.route('/recommendations')
def recommendations():
    """Recommendations page for getting internship recommendations"""
    return render_template('recommendations.html')

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
