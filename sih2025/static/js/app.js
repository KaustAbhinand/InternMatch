// Global variables
let currentStep = 1;
let totalSteps = 6;
let sectors = [];
let skills = [];
let selectedSkills = [];
let selectedSectors = [];
let careerGoal = '';
let inputMethod = ''; // 'manual' or 'resume'
let extractedResumeData = null;

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
    // Navigation buttons
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('prevBtn').addEventListener('click', prevStep);
    document.getElementById('submitBtn').addEventListener('click', submitForm);
    
    // Skill management
    document.getElementById('addSkillBtn').addEventListener('click', addCustomSkill);
    document.getElementById('skillSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomSkill();
        }
    });
    
    // Form validation
    document.getElementById('candidateForm').addEventListener('input', validateCurrentStep);
    
    // Career goal change handler
    document.getElementById('career_goal').addEventListener('change', handleCareerGoalChange);
    
    // Resume upload handler
    document.getElementById('resumeFile').addEventListener('change', handleResumeUpload);
    
    // Drag and drop handlers
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
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
    validateCurrentStep();
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
        validateCurrentStep();
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
        validateCurrentStep();
    }
}

// Remove skill
function removeSkill(skill) {
    selectedSkills = selectedSkills.filter(s => s !== skill);
    renderSelectedSkills();
    validateCurrentStep();
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

// Navigation functions
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            stepHistory.push(currentStep);
            updateStepDisplay();
        }
    }
}

function prevStep() {
    goBack();
}

// Store step history for proper navigation
let stepHistory = [1];

function navigateToStep(step) {
    if (step >= 1 && step <= totalSteps) {
        currentStep = step;
        stepHistory.push(step);
        updateStepDisplay();
    }
}

function goBack() {
    if (stepHistory.length > 1) {
        stepHistory.pop(); // Remove current step
        currentStep = stepHistory[stepHistory.length - 1]; // Go to previous step
        updateStepDisplay();
    }
}

// Update step display
function updateStepDisplay() {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step${currentStep}`).classList.add('active');
    
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
    
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
    
    // Validate current step
    validateCurrentStep();
}

// Validate current step
function validateCurrentStep() {
    let isValid = true;
    
    switch (currentStep) {
        case 1:
            // Input method selection page
            isValid = true;
            break;
        case 2:
            // Profile step: require education and experience
            const education = document.getElementById('education_level').value;
            const experience = document.getElementById('experience_level').value;
            isValid = Boolean(education) && Boolean(experience);
            break;
        case 3:
            // Skills step: require at least 1 skill
            isValid = selectedSkills.length > 0;
            break;
        case 4:
            // Interests step: require at least 1 sector
            isValid = selectedSectors.length > 0;
            break;
        case 5:
            // Goal step is optional
            isValid = true;
            break;
        case 6:
            // Location step is optional
            isValid = true;
            break;
    }
    
    // Update next/submit button state
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (currentStep < totalSteps) {
        nextBtn.disabled = !isValid;
        nextBtn.style.opacity = isValid ? '1' : '0.5';
    } else {
        submitBtn.disabled = !isValid;
        submitBtn.style.opacity = isValid ? '1' : '0.5';
    }
    
    return isValid;
}

// Submit form
async function submitForm(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('candidateForm').style.display = 'none';
    
    try {
        // Prepare candidate profile
        const candidateProfile = {
            education_level: document.getElementById('education_level').value,
            experience_level: document.getElementById('experience_level').value,
            skills: selectedSkills,
            sector_interests: selectedSectors,
            career_goal: document.getElementById('career_goal').value,
            location_preference: document.getElementById('location_preference').value,
            remote_work_preference: document.getElementById('remote_work_preference').checked,
            num_recommendations: 5
        };
        
        // Get recommendations
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
        alert('Sorry, there was an error getting your recommendations. Please try again.');
        
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('candidateForm').style.display = 'block';
    }
}

// Auto-suggest skills based on sectors
function updateSkillSuggestions() {
    if (selectedSectors.length > 0) {
        // This would call the API to get skill suggestions
        // For now, we'll use a simple mapping
        const sectorSkillMap = {
            'technology': ['Programming', 'Web Development', 'Digital Marketing', 'Data Analysis'],
            'government': ['Research', 'Report Writing', 'Policy Analysis', 'Communication'],
            'healthcare': ['Data Analysis', 'Research', 'Healthcare Knowledge', 'Statistics'],
            'education': ['Teaching', 'Communication', 'Content Development', 'Technology'],
            'environment': ['Environmental Science', 'Research', 'Field Work', 'Documentation'],
            'finance': ['Finance', 'Data Analysis', 'Communication', 'Excel'],
            'social_work': ['Communication', 'Community Engagement', 'Social Work', 'Documentation'],
            'agriculture': ['Agriculture', 'Field Work', 'Data Collection', 'Technology'],
            'tourism': ['Communication', 'Marketing', 'Local Knowledge', 'Customer Service'],
            'culture': ['Research', 'History', 'Cultural Knowledge', 'Documentation']
        };
        
        const suggestedSkills = [];
        selectedSectors.forEach(sector => {
            if (sectorSkillMap[sector]) {
                suggestedSkills.push(...sectorSkillMap[sector]);
            }
        });
        
        // Update suggested skills display
        const container = document.getElementById('suggestedSkills');
        container.innerHTML = '';
        
        [...new Set(suggestedSkills)].slice(0, 12).forEach(skill => {
            const skillElement = document.createElement('span');
            skillElement.className = 'suggested-skill';
            skillElement.textContent = skill;
            skillElement.addEventListener('click', () => addSkill(skill));
            container.appendChild(skillElement);
        });
    }
}

// Career goal functionality
function handleCareerGoalChange() {
    const goal = document.getElementById('career_goal').value;
    careerGoal = goal;
    
    if (goal) {
        showGoalRequirements(goal);
    } else {
        hideGoalRequirements();
    }
    validateCurrentStep();
}

async function showGoalRequirements(goal) {
    const requirementsDiv = document.getElementById('goalRequirements');
    const requiredSkillsDiv = document.getElementById('requiredSkills');
    const learningStepsDiv = document.getElementById('learningSteps');
    
    // Show loading
    requirementsDiv.style.display = 'block';
    requiredSkillsDiv.innerHTML = '<div class="loading-text">Analyzing market data...</div>';
    learningStepsDiv.innerHTML = '';
    
    try {
        const goalData = await getGoalRequirements(goal);
        
        // Show required skills with market data
        requiredSkillsDiv.innerHTML = '';
        goalData.skills.forEach(skill => {
            const skillTag = document.createElement('div');
            skillTag.className = 'skill-tag goal-skill';
            skillTag.innerHTML = `
                ${skill}
                <button type="button" class="add-skill-btn" onclick="addSkill('${skill}')">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            requiredSkillsDiv.appendChild(skillTag);
        });
        
        // Show learning path with market insights
        learningStepsDiv.innerHTML = '';
        goalData.learningPath.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'learning-step';
            stepDiv.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-content">${step}</div>
            `;
            learningStepsDiv.appendChild(stepDiv);
        });
        
        // Show market analysis if available
        if (goalData.marketAnalysis) {
            const marketDiv = document.createElement('div');
            marketDiv.className = 'market-analysis';
            marketDiv.innerHTML = `
                <h4><i class="fas fa-chart-bar"></i> Market Analysis:</h4>
                <div class="market-stats">
                    <div class="stat">
                        <strong>${goalData.marketAnalysis.totalInternships}</strong>
                        <span>Total Internships Analyzed</span>
                    </div>
                    <div class="stat">
                        <strong>${goalData.marketAnalysis.highDemandSkills.length}</strong>
                        <span>High-Demand Skills</span>
                    </div>
                </div>
                <div class="high-demand-skills">
                    <strong>Most Demanded:</strong> ${goalData.marketAnalysis.highDemandSkills.join(', ')}
                </div>
            `;
            learningStepsDiv.appendChild(marketDiv);
        }
        
    } catch (error) {
        console.error('Error loading goal requirements:', error);
        requiredSkillsDiv.innerHTML = '<div class="error-text">Error loading market data. Please try again.</div>';
    }
}

function hideGoalRequirements() {
    document.getElementById('goalRequirements').style.display = 'none';
}

async function getGoalRequirements(goal) {
    try {
        // Call API to get real market data
        const response = await fetch('/api/goal-requirements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ goal: goal })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching goal requirements:', error);
        // Fallback to static data
        return getFallbackGoalRequirements(goal);
    }
}

function getFallbackGoalRequirements(goal) {
    const goalRequirements = {
        'Software Developer': {
            skills: ['Programming', 'Web Development', 'Database Management', 'Problem Solving', 'Team Work'],
            learningPath: [
                'Learn programming languages (Python, Java, JavaScript) - High demand in 80% of tech internships',
                'Master web development (HTML, CSS, JavaScript) - Required in 60% of tech roles',
                'Understand database management - Needed in 45% of software positions',
                'Practice problem-solving and algorithms - Essential for 70% of coding roles',
                'Build projects and contribute to open source - Shows practical experience'
            ],
            marketAnalysis: {
                totalInternships: 12,
                highDemandSkills: ['Programming', 'Web Development', 'Problem Solving'],
                skillFrequency: {'Programming': 8, 'Web Development': 6, 'Problem Solving': 10}
            }
        },
        'Data Analyst': {
            skills: ['Data Analysis', 'Excel', 'Statistics', 'Research', 'Critical Thinking'],
            learningPath: [
                'Master Excel and data manipulation - Required in 90% of data roles',
                'Learn statistics and data interpretation - Essential for 85% of analyst positions',
                'Practice with real datasets - Hands-on experience needed',
                'Learn data visualization tools (Tableau, Power BI) - In demand in 60% of roles',
                'Develop research and analytical skills - Core requirement for all analyst roles'
            ],
            marketAnalysis: {
                totalInternships: 12,
                highDemandSkills: ['Data Analysis', 'Research', 'Statistics'],
                skillFrequency: {'Data Analysis': 7, 'Research': 9, 'Statistics': 5}
            }
        },
        'Digital Marketer': {
            skills: ['Digital Marketing', 'Social Media', 'Content Writing', 'Analytics', 'Communication'],
            learningPath: [
                'Learn digital marketing fundamentals - Base requirement for all marketing roles',
                'Master social media platforms and strategies - Required in 75% of marketing internships',
                'Develop content creation and writing skills - Needed in 80% of content roles',
                'Understand analytics and performance metrics - Essential for 70% of marketing positions',
                'Learn SEO and SEM techniques - High demand in digital marketing'
            ],
            marketAnalysis: {
                totalInternships: 12,
                highDemandSkills: ['Digital Marketing', 'Communication', 'Content Writing'],
                skillFrequency: {'Digital Marketing': 6, 'Communication': 11, 'Content Writing': 4}
            }
        },
        'Government Officer': {
            skills: ['Research', 'Report Writing', 'Policy Analysis', 'Communication', 'Leadership'],
            learningPath: [
                'Develop strong research and analytical skills - Core requirement for 90% of government roles',
                'Learn about government policies and procedures - Essential for all public sector positions',
                'Improve communication and presentation skills - Required in 85% of government internships',
                'Understand public administration principles - Fundamental for government careers',
                'Learn report writing and documentation - Needed in 80% of policy roles'
            ],
            marketAnalysis: {
                totalInternships: 12,
                highDemandSkills: ['Research', 'Communication', 'Report Writing'],
                skillFrequency: {'Research': 8, 'Communication': 11, 'Report Writing': 6}
            }
        },
        'Healthcare Professional': {
            skills: ['Healthcare Knowledge', 'Data Analysis', 'Research', 'Communication', 'Empathy'],
            learningPath: [
                'Gain basic healthcare and medical knowledge - Required for all healthcare roles',
                'Learn about public health principles - Essential for 80% of healthcare positions',
                'Develop research and data analysis skills - Needed in 70% of healthcare internships',
                'Improve patient communication skills - Core requirement for healthcare roles',
                'Understand healthcare systems and policies - Important for public health roles'
            ],
            marketAnalysis: {
                totalInternships: 12,
                highDemandSkills: ['Healthcare Knowledge', 'Research', 'Data Analysis'],
                skillFrequency: {'Healthcare Knowledge': 3, 'Research': 8, 'Data Analysis': 7}
            }
        }
    };
    
    return goalRequirements[goal] || {
        skills: ['Communication', 'Problem Solving', 'Team Work', 'Time Management'],
        learningPath: [
            'Develop communication skills - Required in 95% of all internships',
            'Learn problem-solving and critical thinking - Essential for 90% of roles',
            'Master time management and organization - Needed in 85% of positions',
            'Build teamwork and collaboration skills - Required in 80% of internships',
            'Gain industry-specific knowledge through courses and practice'
        ],
        marketAnalysis: {
            totalInternships: 12,
            highDemandSkills: ['Communication', 'Problem Solving', 'Team Work'],
            skillFrequency: {'Communication': 11, 'Problem Solving': 9, 'Team Work': 8}
        }
    };
}

// Input method selection
function selectInputMethod(method) {
    inputMethod = method;
    
    if (method === 'manual') {
        // Go to manual profile step
        currentStep = 2;
        stepHistory = [1, 2];
        updateStepDisplay();
    } else if (method === 'resume') {
        // Go to resume upload step
        currentStep = 2;
        stepHistory = [1, 2];
        updateStepDisplay();
        showResumeStep();
    }
}

function showResumeStep() {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show resume step
    document.getElementById('resumeStep').classList.add('active');
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
            <p>Processing your resume...</p>
        </div>
    `;

    // Real resume processing via backend API
    try {
        const formData = new FormData();
        formData.append('resume', file);
        const resp = await fetch('/api/extract-skills', {
            method: 'POST',
            body: formData
        });
        const data = await resp.json();
        if (data.error) {
            throw new Error(data.error);
        }
        const skillsFromResume = Array.isArray(data.skills) ? data.skills : [];
        extractResumeData({
            name: 'Candidate',
            education: '',
            experience: '',
            skills: skillsFromResume,
            experience_level: document.getElementById('experience_level').value || 'Beginner',
            education_level: document.getElementById('education_level').value || 'Graduate'
        });
    } catch (err) {
        console.error('Resume extraction failed:', err);
        alert('Could not extract skills from the resume. You can continue by adding skills manually.');
        // Fall back to manual edit view
        editExtractedData();
        // Restore upload area content to allow retry
        resetResumeUpload();
    }
}

function extractResumeData(payload) {
    extractedResumeData = payload;
    displayExtractedData(payload);
}

function displayExtractedData(data) {
    const uploadArea = document.getElementById('uploadArea');
    const resumePreview = document.getElementById('resumePreview');
    const extractedInfo = document.getElementById('extractedInfo');
    
    // Hide upload area, show preview
    uploadArea.style.display = 'none';
    resumePreview.style.display = 'block';
    
    // Display extracted information
    extractedInfo.innerHTML = `
        <div class="extracted-field">
            <strong>Name:</strong> ${data.name}
        </div>
        <div class="extracted-field">
            <strong>Education:</strong> ${data.education}
        </div>
        <div class="extracted-field">
            <strong>Experience:</strong> ${data.experience}
        </div>
        <div class="extracted-field">
            <strong>Skills Found:</strong>
            <div class="extracted-skills">
                ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>
        <div class="extracted-actions">
            <button type="button" class="btn-primary" onclick="useExtractedData()">
                <i class="fas fa-check"></i> Use This Information
            </button>
            <button type="button" class="btn-secondary" onclick="editExtractedData()">
                <i class="fas fa-edit"></i> Edit Information
            </button>
        </div>
    `;
}

function useExtractedData() {
    if (extractedResumeData) {
        // Auto-fill form with extracted data
        document.getElementById('education_level').value = extractedResumeData.education_level;
        document.getElementById('experience_level').value = extractedResumeData.experience_level;
        
        // Add extracted skills
        selectedSkills = [...extractedResumeData.skills];
        renderSelectedSkills();
        
        // Move to next step
        currentStep = 3;
        stepHistory.push(3);
        updateStepDisplay();
    }
}

function editExtractedData() {
    // Go to manual entry step
    currentStep = 2;
    stepHistory = [1, 2];
    updateStepDisplay();
}

function resetResumeUpload() {
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('resumePreview').style.display = 'none';
    document.getElementById('resumeFile').value = '';
    extractedResumeData = null;
    
    // Reset upload area content
    document.getElementById('uploadArea').innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h3>Drag & Drop your resume here</h3>
        <p>or</p>
        <button type="button" class="btn-primary" onclick="document.getElementById('resumeFile').click()">
            <i class="fas fa-folder-open"></i> Browse Files
        </button>
        <input type="file" id="resumeFile" accept=".pdf,.doc,.docx" style="display: none;">
        <p class="file-info">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
    `;
    
    // Re-attach event listeners
    document.getElementById('resumeFile').addEventListener('change', handleResumeUpload);
}

// Add event listener for sector changes to update skill suggestions
document.addEventListener('DOMContentLoaded', function() {
    // This will be called after sectors are loaded
    setTimeout(() => {
        document.querySelectorAll('.sector-card').forEach(card => {
            card.addEventListener('click', () => {
                setTimeout(updateSkillSuggestions, 100);
            });
        });
    }, 1000);
});
