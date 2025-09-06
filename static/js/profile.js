// Global variables
let sectors = [];
let skills = [];
let selectedSkills = [];
let selectedSectors = [];
let currentResume = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSectors();
    loadSkills();
    loadUserProfile();
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

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const profile = await response.json();
            populateProfileForm(profile);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Populate form with profile data
function populateProfileForm(profile) {
    // Personal Information
    document.getElementById('full_name').value = profile.full_name || '';
    document.getElementById('mobile_number').value = profile.mobile_number || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('aadhar_number').value = profile.aadhar_number || '';
    document.getElementById('college').value = profile.college || '';
    document.getElementById('location').value = profile.location || '';
    
    // Education & Experience
    document.getElementById('education_level').value = profile.education_level || '';
    document.getElementById('experience_level').value = profile.experience_level || '';
    document.getElementById('field_of_study').value = profile.field_of_study || '';
    
    // Skills
    selectedSkills = profile.skills || [];
    renderSelectedSkills();
    
    // Sectors
    selectedSectors = profile.sector_interests || [];
    updateSectorSelection();
    
    // Preferences
    document.getElementById('location_preference').value = profile.location_preference || '';
    document.getElementById('remote_work_preference').checked = profile.remote_work_preference || false;
    
    // Resume
    if (profile.resume_url) {
        currentResume = profile.resume_url;
        showResumePreview(profile.resume_filename || 'Resume.pdf');
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
    
    // Resume upload
    document.getElementById('resumeFile').addEventListener('change', handleResumeUpload);
    
    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Action buttons
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('getRecommendationsBtn').addEventListener('click', getRecommendations);
    document.getElementById('setGoalsBtn').addEventListener('click', setCareerGoals);
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

// Update sector selection display
function updateSectorSelection() {
    document.querySelectorAll('.sector-card').forEach(card => {
        const sectorId = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '_');
        if (selectedSectors.includes(sectorId)) {
            card.classList.add('selected');
        }
    });
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

// Resume upload functionality
function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processResume(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processResume(files[0]);
    }
}

async function processResume(file) {
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file.');
        return;
    }
    
    if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
    }
    
    // Show loading
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-loading">
            <div class="spinner"></div>
            <p>Uploading your resume...</p>
        </div>
    `;

    try {
        const formData = new FormData();
        formData.append('resume', file);
        
        const response = await fetch('/api/upload-resume', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        currentResume = data.resume_url;
        showResumePreview(file.name);
        
    } catch (error) {
        console.error('Resume upload failed:', error);
        alert('Failed to upload resume. Please try again.');
        resetResumeUpload();
    }
}

function showResumePreview(filename) {
    const uploadArea = document.getElementById('uploadArea');
    const resumePreview = document.getElementById('resumePreview');
    const resumeInfo = document.getElementById('resumeInfo');
    
    uploadArea.style.display = 'none';
    resumePreview.style.display = 'block';
    
    resumeInfo.innerHTML = `
        <div class="resume-info-item">
            <i class="fas fa-file-pdf"></i>
            <span>${filename}</span>
        </div>
    `;
}

function resetResumeUpload() {
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('resumePreview').style.display = 'none';
    document.getElementById('resumeFile').value = '';
    currentResume = null;
    
    // Reset upload area content
    document.getElementById('uploadArea').innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h3>Upload Your Resume</h3>
        <p>Drag & Drop your resume here or click to browse</p>
        <button type="button" class="btn-primary" onclick="document.getElementById('resumeFile').click()">
            <i class="fas fa-folder-open"></i> Browse Files
        </button>
        <input type="file" id="resumeFile" accept=".pdf,.doc,.docx" style="display: none;">
        <p class="file-info">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
    `;
    
    // Re-attach event listeners
    document.getElementById('resumeFile').addEventListener('change', handleResumeUpload);
}

// Save profile
async function saveProfile() {
    if (!validateProfileForm()) {
        return;
    }
    
    showLoading(true);
    
    try {
        const profileData = {
            full_name: document.getElementById('full_name').value,
            mobile_number: document.getElementById('mobile_number').value,
            email: document.getElementById('email').value,
            aadhar_number: document.getElementById('aadhar_number').value,
            college: document.getElementById('college').value,
            location: document.getElementById('location').value,
            education_level: document.getElementById('education_level').value,
            experience_level: document.getElementById('experience_level').value,
            field_of_study: document.getElementById('field_of_study').value,
            skills: selectedSkills,
            sector_interests: selectedSectors,
            location_preference: document.getElementById('location_preference').value,
            remote_work_preference: document.getElementById('remote_work_preference').checked,
            resume_url: currentResume
        };
        
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        showNotification('Profile saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Failed to save profile. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Validate profile form
function validateProfileForm() {
    const requiredFields = [
        'full_name', 'mobile_number', 'email', 'aadhar_number',
        'college', 'location', 'education_level', 'experience_level'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showNotification(`Please fill in ${field.labels[0].textContent}`, 'error');
            field.focus();
            return false;
        }
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

// Get internship recommendations
async function getRecommendations() {
    if (!validateProfileForm()) {
        return;
    }
    
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
        
        // Store results and redirect
        sessionStorage.setItem('recommendations', JSON.stringify(data));
        window.location.href = '/results';
        
    } catch (error) {
        console.error('Error getting recommendations:', error);
        showNotification('Failed to get recommendations. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Set career goals
function setCareerGoals() {
    window.location.href = '/goals';
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
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
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
