// Get car model from session storage
const carModel = sessionStorage.getItem('selectedCar');
if (!carModel) {
    window.location.href = 'index.html';
}

// Display car model
document.getElementById('carModelDisplay').textContent = carModel;

// Color options
const colorOptions = [
    { value: "černá", label: "Černá", hex: "#000000" },
    { value: "bílá", label: "Bílá", hex: "#FFFFFF" },
    { value: "červená", label: "Červená", hex: "#DC2626" },
    { value: "modrá", label: "Modrá", hex: "#2563EB" },
    { value: "stříbrná", label: "Stříbrná", hex: "#94A3B8" },
    { value: "šedá", label: "Šedá", hex: "#6B7280" },
    { value: "zelená", label: "Zelená", hex: "#16A34A" },
    { value: "zlatá", label: "Zlatá", hex: "#EAB308" }
];

// Form state
const formData = {
    robloxUsername: '',
    discordUsername: '',
    carColor: '',
    interiorColor: '',
    wheelColor: '',
    brakeCaliperColor: '',
    additionalCarbon: false,
    deliveryOption: 'driveway',
    discordVerified: false
};

// Initialize color pickers
function createColorPicker(containerId, label, dataKey) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <label class="color-label">${label}</label>
        <div class="color-grid" id="${containerId}Grid"></div>
    `;
    
    const grid = document.getElementById(`${containerId}Grid`);
    grid.innerHTML = colorOptions.map(color => `
        <div class="color-option" data-value="${color.value}">
            <div class="color-display" style="background-color: ${color.hex}"></div>
            <div class="color-name">${color.label}</div>
        </div>
    `).join('');

    grid.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            selectColor(dataKey, option.dataset.value);
        });
    });
}

// Select color
function selectColor(key, value) {
    formData[key] = value;
    
    // Update UI
    const containers = {
        carColor: 'carColorSection',
        interiorColor: 'interiorColorSection',
        wheelColor: 'wheelColorSection',
        brakeCaliperColor: 'brakeColorSection'
    };
    
    const containerId = containers[key];
    const grid = document.getElementById(`${containerId}Grid`);
    const options = grid.querySelectorAll('.color-option');
    
    options.forEach(option => {
        if (option.dataset.value === value) {
            option.classList.add('selected');
            if (!option.querySelector('.color-checkmark')) {
                option.innerHTML += `
                    <div class="color-checkmark">
                        <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                `;
            }
        } else {
            option.classList.remove('selected');
            const checkmark = option.querySelector('.color-checkmark');
            if (checkmark) checkmark.remove();
        }
    });
    
    updateSummary();
    validateForm();
}

// Initialize form
function initForm() {
    createColorPicker('carColorSection', 'Barva karoserie', 'carColor');
    createColorPicker('interiorColorSection', 'Barva interiéru', 'interiorColor');
    createColorPicker('wheelColorSection', 'Barva kol', 'wheelColor');
    createColorPicker('brakeColorSection', 'Barva brzdových třmenů', 'brakeCaliperColor');
    
    // Username inputs
    document.getElementById('robloxUsername').addEventListener('input', (e) => {
        formData.robloxUsername = e.target.value;
        validateForm();
    });

    document.getElementById('verifyBtn').addEventListener('click', openVerificationModal);
    
    document.getElementById('discordUsername').addEventListener('input', (e) => {
        formData.discordUsername = e.target.value;
        if (!formData.discordVerified) {
            validateForm();
        }
    });
    
    // Carbon toggle
    document.getElementById('carbonToggle').addEventListener('change', (e) => {
        formData.additionalCarbon = e.target.checked;
        updateSummary();
    });
    
    // Delivery options
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    deliveryOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            formData.deliveryOption = e.target.value;
            updatePricing();
            updateSummary();
        });
    });
}

// Verification modal
function openVerificationModal() {
    if (!formData.discordUsername.trim()) {
        showToast('Prosím zadejte Discord uživatelské jméno', 'error');
        return;
    }
    document.getElementById('verificationModal').classList.add('show');
}

function closeVerificationModal() {
    document.getElementById('verificationModal').classList.remove('show');
}

function confirmVerification() {
    formData.discordVerified = true;
    
    // Update UI
    document.getElementById('discordUsername').disabled = true;
    document.getElementById('verifyBtn').style.display = 'none';
    document.getElementById('verifiedBtn').style.display = 'flex';
    document.getElementById('verifiedMessage').style.display = 'flex';
    
    closeVerificationModal();
    showToast('Discord účet ověřen!', 'success');
    validateForm();
}

// Update pricing
function updatePricing() {
    const deliveryFee = formData.deliveryOption === 'showroom' ? 5000 : 0;
    const tax = deliveryFee * 0.1;
    const total = deliveryFee + tax;
    
    const deliveryFeeRow = document.getElementById('deliveryFeeRow');
    const deliveryFeeAmount = document.getElementById('deliveryFeeAmount');
    const taxAmount = document.getElementById('taxAmount');
    const totalAmount = document.getElementById('totalAmount');
    
    if (deliveryFee > 0) {
        deliveryFeeRow.style.display = 'flex';
        deliveryFeeAmount.textContent = `${deliveryFee.toLocaleString('cs-CZ')} Kč`;
        taxAmount.textContent = `${tax.toLocaleString('cs-CZ')} Kč + 10% z ceny vozu`;
        totalAmount.textContent = `${total.toLocaleString('cs-CZ')} Kč + cena vozu`;
    } else {
        deliveryFeeRow.style.display = 'none';
        taxAmount.textContent = 'Bude vypočteno';
        totalAmount.textContent = 'Bude doplněno';
    }
}

// Update summary
function updateSummary() {
    const summaryDetails = document.getElementById('summaryDetails');
    
    let html = `<div class="summary-row"><span>Model vozu:</span><span>${carModel}</span></div>`;
    
    if (formData.carColor) {
        html += `<div class="summary-row"><span>Barva karoserie:</span><span>${formData.carColor}</span></div>`;
    }
    if (formData.interiorColor) {
        html += `<div class="summary-row"><span>Barva interiéru:</span><span>${formData.interiorColor}</span></div>`;
    }
    if (formData.wheelColor) {
        html += `<div class="summary-row"><span>Barva kol:</span><span>${formData.wheelColor}</span></div>`;
    }
    if (formData.brakeCaliperColor) {
        html += `<div class="summary-row"><span>Barva brzd:</span><span>${formData.brakeCaliperColor}</span></div>`;
    }
    if (formData.additionalCarbon) {
        html += `<div class="summary-row"><span>Carbon detaily:</span><span style="color: #16a34a; font-weight: 600;">Ano</span></div>`;
    }
    
    summaryDetails.innerHTML = html;
}

function validateForm() {
    const isValid = 
        formData.robloxUsername.trim() &&
        formData.discordUsername.trim() &&
        formData.carColor &&
        formData.interiorColor &&
        formData.wheelColor &&
        formData.brakeCaliperColor &&
        formData.discordVerified;
    
    const submitBtn = document.getElementById('submitOrderBtn');
    const validationMsg = document.getElementById('formValidationMsg');
    
    submitBtn.disabled = !isValid;
    validationMsg.style.display = isValid ? 'none' : 'block';

    return !!isValid;
}

// Send to Discord webhook
async function sendToDiscord() {
    const webhookUrl = "https://discord.com/api/webhooks/1478845176846745730/33ZDeFi9nVuN2Kf5_jkDf8bLDCa2ggvqfz3CxrzMWoU-iBc5sULbcz65yv7v7fXVeQ1K";
    
    const deliveryFee = formData.deliveryOption === 'showroom' ? 5000 : 0;
    const tax = deliveryFee * 0.1;
    const total = deliveryFee + tax;
    
    const embed = {
        title: "🚗 Nová objednávka vozu - AUREX",
        color: 0x3b82f6,
        fields: [
            {
                name: "📋 Model vozu",
                value: carModel,
                inline: false
            },
            {
                name: "👤 Roblox uživatelské jméno",
                value: formData.robloxUsername,
                inline: true
            },
            {
                name: "💬 Discord uživatelské jméno",
                value: formData.discordUsername,
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: false
            },
            {
                name: "🎨 Barva karoserie",
                value: formData.carColor,
                inline: true
            },
            {
                name: "🪑 Barva interiéru",
                value: formData.interiorColor,
                inline: true
            },
            {
                name: "⚙️ Barva kol",
                value: formData.wheelColor,
                inline: true
            },
            {
                name: "🔴 Barva brzdových třmenů",
                value: formData.brakeCaliperColor,
                inline: true
            },
            {
                name: "✨ Dodatečný carbon",
                value: formData.additionalCarbon ? "✅ Ano" : "❌ Ne",
                inline: true
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: false
            },
            {
                name: "📦 Možnost dodání",
                value: formData.deliveryOption === "showroom" 
                    ? "🏢 Showroom s mašlí (+5 000 Kč)" 
                    : "🏠 Příjezdová cesta (+0 Kč)",
                inline: false
            },
            {
                name: "\u200B",
                value: "\u200B",
                inline: false
            },
            {
                name: "💰 Poplatek za dodání",
                value: `${deliveryFee.toLocaleString("cs-CZ")} Kč`,
                inline: true
            },
            {
                name: "💵 DPH (10%)",
                value: deliveryFee > 0 
                    ? `${tax.toLocaleString("cs-CZ")} Kč + 10% z ceny vozu`
                    : "Bude vypočteno po přidání ceny vozu",
                inline: true
            },
            {
                name: "💳 Celková cena",
                value: deliveryFee > 0
                    ? `${total.toLocaleString("cs-CZ")} Kč + cena vozu`
                    : "Bude doplněno při kontrole",
                inline: false
            }
        ],
        footer: {
            text: "AUREX Dealership | Objednávka vyžaduje kontrolu"
        },
        timestamp: new Date().toISOString()
    };

    const payload = {
        content: "## 🔔 **NOVÁ OBJEDNÁVKA**",
        embeds: [embed]
    };

    try {
        await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error("Failed to send to Discord:", error);
    }
}

// Form submission
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        showToast('Prosím vyplňte všechny povinné údaje', 'error');
        return;
    }
    
    // Send to Discord
    await sendToDiscord();
    
    // Save order data
    const deliveryFee = formData.deliveryOption === 'showroom' ? 5000 : 0;
    const tax = deliveryFee * 0.1;
    const total = deliveryFee + tax;
    
    sessionStorage.setItem('orderData', JSON.stringify({
        carModel,
        formData,
        pricing: { deliveryFee, tax, total }
    }));
    
    // Redirect to order status
    window.location.href = 'order-status.html';
});

// Toast notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
    
    toast.innerHTML = `
        <div class="toast-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${icon}
            </svg>
        </div>
        <div class="toast-message">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Go back
function goBack() {
    window.location.href = 'index.html';
}

// Initialize
initForm();
updatePricing();
updateSummary();
