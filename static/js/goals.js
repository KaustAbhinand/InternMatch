// Global variables
let currentGoal = '';
let goalRequirements = null;
let userSkills = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    initializeEventListeners();
});

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const profile = await response.json();
            userSkills = profile.skills || [];
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    document.getElementById('analyzeGoalBtn').addEventListener('click', analyzeGoal);
    document.getElementById('addAllSkillsBtn').addEventListener('click', addAllSkillsToProfile);
    document.getElementById('saveGoalBtn').addEventListener('click', saveGoal);
    document.getElementById('getRecommendationsBtn').addEventListener('click', getRecommendations);
}

// Analyze goal requirements
async function analyzeGoal() {
    const goal = document.getElementById('career_goal').value;
    const description = document.getElementById('goal_description').value;
    
    if (!goal) {
        showNotification('Please select a career goal', 'error');
        return;
    }
    
    currentGoal = goal;
    showLoading(true);
    
    try {
        const response = await fetch('/api/goal-requirements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                goal: goal,
                description: description
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        goalRequirements = data;
        displayGoalResults(data);
        
    } catch (error) {
        console.error('Error analyzing goal:', error);
        showNotification('Failed to analyze goal requirements. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Display goal analysis results
function displayGoalResults(data) {
    const resultsDiv = document.getElementById('goalResults');
    resultsDiv.style.display = 'block';
    
    // Market Analysis
    displayMarketAnalysis(data.marketAnalysis || {});
    
    // Required Skills
    displayRequiredSkills(data.skills || []);
    
    // Learning Path
    displayLearningPath(data.learningPath || []);
    
    // Skill Gap Analysis
    displaySkillGapAnalysis(data.skills || []);
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Display market analysis
function displayMarketAnalysis(marketData) {
    document.getElementById('totalInternships').textContent = marketData.totalInternships || 0;
    document.getElementById('highDemandSkills').textContent = marketData.highDemandSkills?.length || 0;
    document.getElementById('avgMatchScore').textContent = `${marketData.avgMatchScore || 0}%`;
}

// Display required skills
function displayRequiredSkills(skills) {
    const container = document.getElementById('requiredSkills');
    container.innerHTML = '';
    
    skills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag goal-skill';
        skillTag.innerHTML = `
            ${skill}
            <button type="button" class="add-skill-btn" onclick="addSkillToProfile('${skill}')">
                <i class="fas fa-plus"></i>
            </button>
        `;
        container.appendChild(skillTag);
    });
}

// Display learning path
function displayLearningPath(learningPath) {
    const container = document.getElementById('learningSteps');
    container.innerHTML = '';
    
    learningPath.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'learning-step';
        stepDiv.innerHTML = `
            <div class="step-number">${index + 1}</div>
            <div class="step-content">${step}</div>
        `;
        container.appendChild(stepDiv);
    });
}

// Display skill gap analysis
function displaySkillGapAnalysis(requiredSkills) {
    const container = document.getElementById('skillGapAnalysis');
    
    const userSkillSet = new Set(userSkills);
    const requiredSkillSet = new Set(requiredSkills);
    
    const matchingSkills = requiredSkills.filter(skill => userSkillSet.has(skill));
    const missingSkills = requiredSkills.filter(skill => !userSkillSet.has(skill));
    
    const matchPercentage = Math.round((matchingSkills.length / requiredSkills.length) * 100);
    
    container.innerHTML = `
        <div class="gap-summary">
            <div class="gap-stat">
                <strong>${matchPercentage}%</strong>
                <span>Skills Match</span>
            </div>
            <div class="gap-stat">
                <strong>${matchingSkills.length}</strong>
                <span>Skills You Have</span>
            </div>
            <div class="gap-stat">
                <strong>${missingSkills.length}</strong>
                <span>Skills to Learn</span>
            </div>
        </div>
        
        <div class="gap-details">
            <div class="matching-skills">
                <h4><i class="fas fa-check-circle"></i> Skills You Already Have:</h4>
                <div class="skills-list">
                    ${matchingSkills.map(skill => `<span class="skill-tag existing-skill">${skill}</span>`).join('')}
                </div>
            </div>
            
            <div class="missing-skills">
                <h4><i class="fas fa-exclamation-triangle"></i> Skills You Need to Learn:</h4>
                <div class="skills-list">
                    ${missingSkills.map(skill => `<span class="skill-tag missing-skill">${skill}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Add skill to profile
async function addSkillToProfile(skill) {
    if (userSkills.includes(skill)) {
        showNotification('Skill already in your profile', 'info');
        return;
    }
    
    try {
        const response = await fetch('/api/profile/skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ skill: skill })
        });
        
        if (response.ok) {
            userSkills.push(skill);
            showNotification(`Added "${skill}" to your profile`, 'success');
            // Refresh skill gap analysis
            if (goalRequirements) {
                displaySkillGapAnalysis(goalRequirements.skills || []);
            }
        } else {
            throw new Error('Failed to add skill');
        }
    } catch (error) {
        console.error('Error adding skill:', error);
        showNotification('Failed to add skill to profile', 'error');
    }
}

// Add all skills to profile
async function addAllSkillsToProfile() {
    if (!goalRequirements || !goalRequirements.skills) {
        showNotification('No skills to add', 'error');
        return;
    }
    
    const skillsToAdd = goalRequirements.skills.filter(skill => !userSkills.includes(skill));
    
    if (skillsToAdd.length === 0) {
        showNotification('All skills are already in your profile', 'info');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/profile/skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ skills: skillsToAdd })
        });
        
        if (response.ok) {
            userSkills.push(...skillsToAdd);
            showNotification(`Added ${skillsToAdd.length} skills to your profile`, 'success');
            // Refresh skill gap analysis
            displaySkillGapAnalysis(goalRequirements.skills || []);
        } else {
            throw new Error('Failed to add skills');
        }
    } catch (error) {
        console.error('Error adding skills:', error);
        showNotification('Failed to add skills to profile', 'error');
    } finally {
        showLoading(false);
    }
}

// Save goal
async function saveGoal() {
    if (!currentGoal) {
        showNotification('Please select a career goal first', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                goal: currentGoal,
                description: document.getElementById('goal_description').value,
                requirements: goalRequirements
            })
        });
        
        if (response.ok) {
            showNotification('Career goal saved successfully!', 'success');
        } else {
            throw new Error('Failed to save goal');
        }
    } catch (error) {
        console.error('Error saving goal:', error);
        showNotification('Failed to save career goal', 'error');
    } finally {
        showLoading(false);
    }
}

// Get recommendations based on goal
async function getRecommendations() {
    if (!currentGoal) {
        showNotification('Please select a career goal first', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const candidateProfile = {
            career_goal: currentGoal,
            skills: userSkills,
            num_recommendations: 20  // Increased from 5 to show more internships
        };
        
        const response = await fetch('/api/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(candidateProfile)
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Store results and redirect
        sessionStorage.setItem('recommendations', JSON.stringify(data));
        window.location.href = '/results';
        
    } catch (error) {
        console.error('Error getting recommendations:', error);
        showNotification('Failed to get recommendations', 'error');
    } finally {
        showLoading(false);
    }
}

// Show loading spinner
function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
