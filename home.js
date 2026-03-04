// Popular cars data
const popularCars = [
    "Porsche 911 Turbo S",
    "Lamborghini Huracán",
    "Ferrari F8 Tributo",
    "McLaren 720S",
    "Audi R8 V10",
    "BMW M4 Competition"
];

// Elements
const carInput = document.getElementById('carInput');
const searchBox = document.getElementById('searchBox');
const submitBtn = document.getElementById('submitBtn');
const carSearchForm = document.getElementById('carSearchForm');
const suggestionsGrid = document.getElementById('suggestionsGrid');

// Initialize suggestions
function initSuggestions() {
    suggestionsGrid.innerHTML = popularCars.map(car => `
        <button type="button" class="suggestion-item" onclick="selectCar('${car}')">
            <div class="suggestion-icon">
                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </div>
            <span class="suggestion-text">${car}</span>
        </button>
    `).join('');
}

// Select car from suggestions
function selectCar(carName) {
    carInput.value = carName;
    updateSubmitButton();
}

// Update submit button state
function updateSubmitButton() {
    submitBtn.disabled = !carInput.value.trim();
}

// Focus handling
carInput.addEventListener('focus', () => {
    searchBox.classList.add('focused');
});

carInput.addEventListener('blur', () => {
    searchBox.classList.remove('focused');
});

// Input handling
carInput.addEventListener('input', updateSubmitButton);

// Form submission
carSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const carModel = carInput.value.trim();
    if (carModel) {
        sessionStorage.setItem('selectedCar', carModel);
        window.location.href = 'checkout.html';
    }
});

// Initialize
initSuggestions();
