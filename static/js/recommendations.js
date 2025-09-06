// Global variables
let sectors = [];
let skills = [];
let selectedSkills = [];
let selectedSectors = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSectors();
    loadSkills();
    initializeEventListeners();
});

// Load sectors from API
async function loadSectors() {
    try {
        const response = await fetch('/api/sectors');
        sectors = await response.json();
        renderSectors();
    } catch (error) {
        console.error('Error loading sectors:', error);
    }
}

// Load skills from API
async function loadSkills() {
    try {
        const response = await fetch('/api/skills');
        skills = await response.json();
        renderSuggestedSkills();
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Skill management
    document.getElementById('addSkillBtn').addEventListener('click', addCustomSkill);
    document.getElementById('skillSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomSkill();
        }
    });
    
    // Form submission
    document.getElementById('quickRecommendationForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('useProfileBtn').addEventListener('click', useProfileData);
}

// Render sectors
function renderSectors() {
    const container = document.getElementById('sectorInterests');
    container.innerHTML = '';
    
    sectors.forEach(sector => {
        const sectorCard = document.createElement('div');
        sectorCard.className = 'sector-card';
        sectorCard.innerHTML = `
            <i class="fas fa-${getSectorIcon(sector.id)}"></i>
            <h3>${sector.name}</h3>
            <p>${sector.description}</p>
        `;
        
        sectorCard.addEventListener('click', () => toggleSector(sector.id, sectorCard));
        container.appendChild(sectorCard);
    });
}

// Get icon for sector
function getSectorIcon(sectorId) {
    const icons = {
        'technology': 'laptop-code',
        'government': 'landmark',
        'healthcare': 'heartbeat',
        'education': 'graduation-cap',
        'environment': 'leaf',
        'finance': 'coins',
        'social_work': 'hands-helping',
        'agriculture': 'seedling',
        'tourism': 'plane',
        'culture': 'palette'
    };
    return icons[sectorId] || 'briefcase';
}

// Toggle sector selection
function toggleSector(sectorId, element) {
    if (selectedSectors.includes(sectorId)) {
        selectedSectors = selectedSectors.filter(id => id !== sectorId);
        element.classList.remove('selected');
    } else {
        selectedSectors.push(sectorId);
        element.classList.add('selected');
    }
}

// Render suggested skills
function renderSuggestedSkills() {
    const container = document.getElementById('suggestedSkills');
    container.innerHTML = '';
    
    // Show first 12 skills as suggestions
    const suggestedSkills = skills.slice(0, 12);
    
    suggestedSkills.forEach(skill => {
        const skillElement = document.createElement('span');
        skillElement.className = 'suggested-skill';
        skillElement.textContent = skill;
        skillElement.addEventListener('click', () => addSkill(skill));
        container.appendChild(skillElement);
    });
}

// Add skill
function addSkill(skill) {
    if (!selectedSkills.includes(skill)) {
        selectedSkills.push(skill);
        renderSelectedSkills();
    }
}

// Add custom skill
function addCustomSkill() {
    const input = document.getElementById('skillSearch');
    const skill = input.value.trim();
    
    if (skill && !selectedSkills.includes(skill)) {
        selectedSkills.push(skill);
        renderSelectedSkills();
        input.value = '';
    }
}

// Remove skill
function removeSkill(skill) {
    selectedSkills = selectedSkills.filter(s => s !== skill);
    renderSelectedSkills();
}

// Render selected skills
function renderSelectedSkills() {
    const container = document.getElementById('selectedSkills');
    container.innerHTML = '';
    
    selectedSkills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
            ${skill}
            <span class="remove" onclick="removeSkill('${skill}')">&times;</span>
        `;
        container.appendChild(skillTag);
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    await getRecommendations();
}

// Validate form
function validateForm() {
    const education = document.getElementById('education_level').value;
    const experience = document.getElementById('experience_level').value;
    
    if (!education || !experience) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    if (selectedSkills.length === 0) {
        showNotification('Please add at least one skill', 'error');
        return false;
    }
    
    if (selectedSectors.length === 0) {
        showNotification('Please select at least one sector interest', 'error');
        return false;
    }
    
    return true;
}

// Get recommendations
async function getRecommendations() {
    showLoading(true);
    
    try {
        const candidateProfile = {
            education_level: document.getElementById('education_level').value,
            experience_level: document.getElementById('experience_level').value,
            skills: selectedSkills,
            sector_interests: selectedSectors,
            location_preference: document.getElementById('location_preference').value,
            remote_work_preference: document.getElementById('remote_work_preference').checked,
            num_recommendations: 5
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
        
        displayResults(data);
        
    } catch (error) {
        console.error('Error getting recommendations:', error);
        showNotification('Failed to get recommendations. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Display results
function displayResults(data) {
    const resultsContainer = document.getElementById('resultsContainer');
    const recommendations = data.recommendations || [];
    
    if (recommendations.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No internships found</h3>
                <p>We couldn't find any internships matching your criteria. Try adjusting your preferences or skills.</p>
                <button type="button" class="btn-primary" onclick="resetForm()">
                    <i class="fas fa-edit"></i> Modify Search
                </button>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = `
            <div class="results-header">
                <h2><i class="fas fa-briefcase"></i> Your Personalized Recommendations</h2>
                <p>Found ${recommendations.length} internships matching your profile</p>
            </div>
            <div class="results-list">
                ${recommendations.map(internship => createInternshipCard(internship)).join('')}
            </div>
        `;
    }
    
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Create internship card
function createInternshipCard(internship) {
    const matchScore = Math.round(internship.match_score * 100);
    const skillsRequired = internship.skills_required || [];
    const matchReasons = internship.match_reasons || [];
    
    return `
        <div class="internship-card">
            <div class="internship-header">
                <div class="internship-title-section">
                    <h3 class="internship-title">${internship.title}</h3>
                    <p class="internship-organization">${internship.organization}</p>
                </div>
                <div class="match-score">${matchScore}% Match</div>
            </div>
            
            <div class="internship-details">
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${internship.location}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${internship.duration}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-graduation-cap"></i>
                    <span>${internship.education_level}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-star"></i>
                    <span>${internship.experience_level}</span>
                </div>
            </div>
            
            <div class="internship-description">
                ${internship.description}
            </div>
            
            <div class="skills-required">
                <h4>Required Skills:</h4>
                <div class="skills-tags">
                    ${skillsRequired.map(skill => `<span class="skill-tag-small">${skill}</span>`).join('')}
                </div>
            </div>
            
            ${matchReasons.length > 0 ? `
                <div class="match-reasons">
                    <h4>Why this matches you:</h4>
                    <ul>
                        ${matchReasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="internship-actions">
                <a href="${internship.apply_url || '#'}" class="apply-btn" target="_blank">
                    <i class="fas fa-external-link-alt"></i> Apply Now
                </a>
            </div>
        </div>
    `;
}

// Use profile data
async function useProfileData() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const profile = await response.json();
            
            // Populate form with profile data
            document.getElementById('education_level').value = profile.education_level || '';
            document.getElementById('experience_level').value = profile.experience_level || '';
            document.getElementById('location_preference').value = profile.location_preference || '';
            document.getElementById('remote_work_preference').checked = profile.remote_work_preference || false;
            
            // Set skills
            selectedSkills = profile.skills || [];
            renderSelectedSkills();
            
            // Set sectors
            selectedSectors = profile.sector_interests || [];
            updateSectorSelection();
            
            showNotification('Profile data loaded successfully!', 'success');
        } else {
            showNotification('No profile data found. Please create a profile first.', 'error');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

// Update sector selection display
function updateSectorSelection() {
    document.querySelectorAll('.sector-card').forEach(card => {
        const sectorId = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '_');
        if (selectedSectors.includes(sectorId)) {
            card.classList.add('selected');
        }
    });
}

// Reset form
function resetForm() {
    document.getElementById('quickRecommendationForm').reset();
    selectedSkills = [];
    selectedSectors = [];
    renderSelectedSkills();
    updateSectorSelection();
    document.getElementById('resultsContainer').style.display = 'none';
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
