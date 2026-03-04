// Get order data from session storage
const orderDataStr = sessionStorage.getItem('orderData');
if (!orderDataStr) {
    window.location.href = 'index.html';
}

const orderData = JSON.parse(orderDataStr);
const { carModel, formData, pricing } = orderData;

// Current stage tracking
let currentStage = 'review';
const stages = ['review', 'discord', 'preparing', 'completed'];

// Update completed description based on delivery option
const completedDesc = formData.deliveryOption === 'showroom'
    ? 'Vůz je připraven k vyzvednutí v showroomu'
    : 'Vůz je již na vaší příjezdové cestě';
document.getElementById('completedDesc').textContent = completedDesc;

// Display order details
function displayOrderDetails() {
    const orderDetails = document.getElementById('orderDetails');
    orderDetails.innerHTML = `
        <div class="detail-row">
            <span>Model vozu:</span>
            <span>${carModel}</span>
        </div>
        <div class="detail-row">
            <span>Barva karoserie:</span>
            <span>${formData.carColor}</span>
        </div>
        <div class="detail-row">
            <span>Barva interiéru:</span>
            <span>${formData.interiorColor}</span>
        </div>
        <div class="detail-row">
            <span>Barva kol:</span>
            <span>${formData.wheelColor}</span>
        </div>
        <div class="detail-row">
            <span>Barva brzd:</span>
            <span>${formData.brakeCaliperColor}</span>
        </div>
        <div class="detail-row">
            <span>Carbon detaily:</span>
            <span>${formData.additionalCarbon ? 'Ano' : 'Ne'}</span>
        </div>
    `;
}

// Display pricing details
function displayPricingDetails() {
    const pricingDetails = document.getElementById('pricingDetails');
    
    let html = `
        <div class="detail-row">
            <span>Cena vozu:</span>
            <span>Bude doplněno při kontrole</span>
        </div>
    `;
    
    if (pricing.deliveryFee > 0) {
        html += `
            <div class="detail-row">
                <span>Showroom dodání:</span>
                <span>${pricing.deliveryFee.toLocaleString('cs-CZ')} Kč</span>
            </div>
        `;
    }
    
    html += `
        <div class="detail-row">
            <span>DPH (10%):</span>
            <span>${pricing.deliveryFee > 0 
                ? `${pricing.tax.toLocaleString('cs-CZ')} Kč + 10% z ceny vozu`
                : 'Bude vypočteno'
            }</span>
        </div>
        <div class="detail-row" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px;">
            <span style="font-weight: 600;">Celkem:</span>
            <span style="font-weight: 700; color: #2563eb; font-size: 18px;">
                ${pricing.deliveryFee > 0
                    ? `${pricing.total.toLocaleString('cs-CZ')} Kč + cena vozu`
                    : 'Bude doplněno'
                }
            </span>
        </div>
    `;
    
    html += `
        <div class="alert alert-info" style="margin-top: 12px;">
            <p style="font-size: 12px; margin: 0;">
                Finální cena bude potvrzena na Discordu po kontrole dostupnosti a specifikací vozu
            </p>
        </div>
    `;
    
    pricingDetails.innerHTML = html;
}

// Update progress
function updateProgress() {
    const currentIndex = stages.indexOf(currentStage);
    const progressFill = document.getElementById('progressFill');
    const percentage = (currentIndex / (stages.length - 1)) * 100;
    progressFill.style.width = `${percentage}%`;
    
    // Update stage icons
    stages.forEach((stage, index) => {
        const icon = document.getElementById(`stageIcon${capitalize(stage)}`);
        const dots = document.getElementById(`dots${capitalize(stage)}`);
        const stageElement = document.querySelector(`[data-stage="${stage}"]`);
        const title = stageElement.querySelector('.stage-title');
        const desc = stageElement.querySelector('.stage-desc');
        
        if (index < currentIndex) {
            // Completed
            icon.classList.add('completed');
            icon.classList.remove('active');
            dots.style.display = 'none';
            title.classList.remove('active');
            desc.classList.remove('active');
        } else if (index === currentIndex) {
            // Current
            icon.classList.add('active');
            icon.classList.remove('completed');
            dots.style.display = 'flex';
            title.classList.add('active');
            desc.classList.add('active');
        } else {
            // Future
            icon.classList.remove('active', 'completed');
            dots.style.display = 'none';
            title.classList.remove('active');
            desc.classList.remove('active');
        }
    });
    
    updateCurrentStageInfo();
}

// Update current stage info
function updateCurrentStageInfo() {
    const currentStageInfo = document.getElementById('currentStageInfo');
    
    const stageContent = {
        review: {
            icon: `<svg class="icon-lg stage-info-icon blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`,
            title: 'Kontrola objednávky probíhá',
            desc: 'Náš tým právě kontroluje dostupnost vozu a všechny specifikace. Tento proces obvykle trvá několik minut.'
        },
        discord: {
            icon: `<svg class="icon-lg stage-info-icon purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>`,
            title: 'Potvrzovací zpráva na cestě',
            desc: `Obdržíte zprávu na Discordu (${formData.discordUsername}) s potvrzením objednávky a finální cenou vozu. Prosím zkontrolujte své zprávy.`
        },
        preparing: {
            icon: `<svg class="icon-lg stage-info-icon orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>`,
            title: 'Váš vůz je připravován',
            desc: 'Vůz je právě konfigurován dle vašich specifikací a připravován k dodání. Brzy budete moci vyrazit na silnici!'
        },
        completed: {
            icon: `<svg class="icon-lg stage-info-icon green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`,
            title: 'Objednávka dokončena!',
            desc: formData.deliveryOption === 'showroom'
                ? 'Váš vůz je připraven k vyzvednutí v našem showroomu s mašlí a v perfektním stavu. Přijďte si pro něj, kdy budete chtít! Obdržíte závěrečnou zprávu na Discordu s detaily k převzetí.'
                : 'Váš vůz je již připraven na vaší příjezdové cestě. Můžete si ho převzít ihned! Obdržíte závěrečnou zprávu na Discordu s detaily k převzetí.'
        }
    };
    
    const content = stageContent[currentStage];
    currentStageInfo.innerHTML = `
        ${content.icon}
        <div class="stage-info-content">
            <h3>${content.title}</h3>
            <p>${content.desc}</p>
        </div>
    `;
}

// Helper function to capitalize
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Simulate order progression
function simulateProgress() {
    setTimeout(() => {
        currentStage = 'discord';
        updateProgress();
    }, 3000);
    
    setTimeout(() => {
        currentStage = 'preparing';
        updateProgress();
    }, 6000);
    
    setTimeout(() => {
        currentStage = 'completed';
        updateProgress();
        document.getElementById('backHomeSection').style.display = 'block';
    }, 9000);
}

// Initialize
displayOrderDetails();
displayPricingDetails();
updateProgress();
simulateProgress();
