#!/usr/bin/env python3
"""
PM Internship Scheme - AI Recommendation Engine
Simple runner script to start the application
"""

import os
import sys
from app import app
from sklearn.feature_extraction.text import TfidfVectorizer

def main():
    """Main function to run the application"""
    print("🚀 Starting PM Internship Scheme Recommendation Engine...")
    print("📱 Mobile-friendly AI-powered internship recommendations")
    print("🌐 Access at: http://localhost:5000")
    print("📊 Features: Smart matching, visual interface, easy integration")
    print("-" * 60)
    
    # Check if data files exist
    data_files = ['data/internships.json', 'data/sectors.json', 'data/skills.json']
    missing_files = [f for f in data_files if not os.path.exists(f)]
    
    if missing_files:
        print(f"❌ Missing data files: {', '.join(missing_files)}")
        print("Please ensure all data files are present before running the application.")
        sys.exit(1)
    
    print("✅ All data files found")
    print("🎯 Ready to help candidates find their perfect internships!")
    print("-" * 60)
    
    # Run the application
    try:
        app.run(
            debug=True,
            host='0.0.0.0',
            port=5000,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down PM Internship Scheme Recommendation Engine...")
        print("Thank you for using our service!")

if __name__ == '__main__':
    main()
