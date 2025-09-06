#!/usr/bin/env python3
"""
Installation script for PM Internship Scheme Recommendation Engine
Handles dependency installation with fallback options
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    print("🚀 Installing PM Internship Scheme Recommendation Engine...")
    print("=" * 60)
    
    # Essential packages
    essential_packages = [
        "flask==2.3.3",
        "flask-cors==4.0.0",
        "python-dotenv==1.0.0"
    ]
    
    # Optional packages (may fail on some systems)
    optional_packages = [
        "pandas==2.0.3",
        "scikit-learn==1.3.2",
        "numpy==1.24.3"
    ]
    
    print("📦 Installing essential packages...")
    for package in essential_packages:
        print(f"   Installing {package}...")
        if install_package(package):
            print(f"   ✅ {package} installed successfully")
        else:
            print(f"   ❌ Failed to install {package}")
            return False
    
    print("\n📦 Installing optional packages...")
    optional_success = True
    for package in optional_packages:
        print(f"   Installing {package}...")
        if install_package(package):
            print(f"   ✅ {package} installed successfully")
        else:
            print(f"   ⚠️  {package} installation failed (will use simplified mode)")
            optional_success = False
    
    print("\n" + "=" * 60)
    if optional_success:
        print("🎉 All packages installed successfully!")
        print("🚀 You can now run: python run.py")
    else:
        print("⚠️  Some optional packages failed to install.")
        print("✅ Essential packages are installed - the system will work in simplified mode")
        print("🚀 You can now run: python run.py")
        print("\n💡 To install optional packages later, try:")
        print("   pip install --upgrade pip")
        print("   pip install pandas scikit-learn numpy")
    
    print("\n🌐 The application will be available at: http://localhost:5000")
    return True

if __name__ == '__main__':
    main()
