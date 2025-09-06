// Initialize results page
document.addEventListener('DOMContentLoaded', function() {
    loadRecommendations();
});

// Load and display recommendations
function loadRecommendations() {
    const recommendationsData = sessionStorage.getItem('recommendations');
    
    if (!recommendationsData) {
        showNoResults();
        return;
    }
    
    try {
        const data = JSON.parse(recommendationsData);
        displayRecommendations(data.recommendations);
    } catch (error) {
        console.error('Error parsing recommendations:', error);
        showNoResults();
    }
}

// Display recommendations
function displayRecommendations(recommendations) {
    const container = document.getElementById('resultsContainer');
    
    if (!recommendations || recommendations.length === 0) {
        showNoResults();
        return;
    }
    
    container.innerHTML = '';
    
    recommendations.forEach((internship, index) => {
        const card = createInternshipCard(internship, index + 1);
        container.appendChild(card);
    });
    
    // Add summary
    const summary = createSummaryCard(recommendations);
    container.insertBefore(summary, container.firstChild);
}

// Create internship card
function createInternshipCard(internship, rank) {
    const card = document.createElement('div');
    card.className = 'internship-card';
    
    const matchPercentage = Math.round(internship.match_score || 0);
    const matchColor = getMatchColor(matchPercentage);
    
    card.innerHTML = `
        <div class="internship-header">
            <div>
                <h3 class="internship-title">${internship.title}</h3>
                <p class="internship-organization">${internship.organization}</p>
            </div>
            <div class="match-score" style="background: ${matchColor}">
                ${matchPercentage}% Match
            </div>
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
                <i class="fas fa-rupee-sign"></i>
                <span>${internship.stipend}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-briefcase"></i>
                <span>${internship.sector}</span>
            </div>
            ${internship.remote_work ? `
            <div class="detail-item">
                <i class="fas fa-laptop"></i>
                <span>Remote Work Available</span>
            </div>
            ` : ''}
        </div>
        
        <div class="internship-description">
            ${internship.description}
        </div>
        
        <div class="skills-required">
            <h4><i class="fas fa-tools"></i> Required Skills:</h4>
            <div class="skills-tags">
                ${internship.skills_required.map(skill => 
                    `<span class="skill-tag-small">${skill}</span>`
                ).join('')}
            </div>
        </div>
        
        ${internship.match_reasons && internship.match_reasons.length > 0 ? `
        <div class="match-reasons">
            <h4><i class="fas fa-star"></i> Why this matches you:</h4>
            <ul>
                ${internship.match_reasons.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 20px;">
            <a href="#" class="apply-btn" onclick="applyToInternship(${internship.id})">
                <i class="fas fa-paper-plane"></i>
                Apply Now
            </a>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #718096;">
                Application Deadline: ${formatDate(internship.application_deadline)}
            </p>
        </div>
    `;
    
    return card;
}

// Create summary card
function createSummaryCard(recommendations) {
    const summary = document.createElement('div');
    summary.className = 'internship-card';
    summary.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    summary.style.color = 'white';
    summary.style.textAlign = 'center';
    
    const avgMatch = Math.round(
        recommendations.reduce((sum, rec) => sum + (rec.match_score || 0), 0) / recommendations.length
    );
    
    summary.innerHTML = `
        <h2 style="margin-bottom: 15px;">
            <i class="fas fa-trophy"></i>
            Your Personalized Results
        </h2>
        <p style="font-size: 1.1rem; margin-bottom: 20px;">
            We found ${recommendations.length} internships that match your profile
        </p>
        <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
            <div>
                <div style="font-size: 2rem; font-weight: bold;">${avgMatch}%</div>
                <div>Average Match</div>
            </div>
            <div>
                <div style="font-size: 2rem; font-weight: bold;">${recommendations.length}</div>
                <div>Recommendations</div>
            </div>
            <div>
                <div style="font-size: 2rem; font-weight: bold;">${new Set(recommendations.map(r => r.sector)).size}</div>
                <div>Different Sectors</div>
            </div>
        </div>
    `;
    
    return summary;
}

// Get match color based on percentage
function getMatchColor(percentage) {
    if (percentage >= 80) {
        return 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    } else if (percentage >= 60) {
        return 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)';
    } else {
        return 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Apply to internship
function applyToInternship(internshipId) {
    // In a real application, this would redirect to the actual application page
    alert(`This would redirect to the application page for internship ID: ${internshipId}\n\nIn a real implementation, this would integrate with the PM Internship Scheme portal.`);
}

// Show no results
function showNoResults() {
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
}

// Share results
function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'My Internship Recommendations',
            text: 'Check out my personalized internship recommendations from PM Internship Scheme!',
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Results link copied to clipboard!');
        });
    }
}

// Print results
function printResults() {
    window.print();
}

// Add print styles
const printStyles = `
    @media print {
        .header, .back-btn, .apply-btn, .form-navigation {
            display: none !important;
        }
        .internship-card {
            break-inside: avoid;
            margin-bottom: 20px;
        }
        body {
            background: white !important;
        }
    }
`;

// Add print styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = printStyles;
document.head.appendChild(styleSheet);
