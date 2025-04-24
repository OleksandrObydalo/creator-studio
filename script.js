document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const colorGrid = document.getElementById('colorGrid');
    const selectedColorsContainer = document.getElementById('selectedColors');
    const mixColorsBtn = document.getElementById('mixColorsBtn');
    const resultColorDiv = document.getElementById('resultColor');
    const colorNameInput = document.getElementById('colorName');
    const saveColorBtn = document.getElementById('saveColorBtn');
    const colorGallery = document.getElementById('colorGallery');

    // State
    const selectedColors = [];
    const savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];
    let mixedColor = null;

    // Base colors to choose from
    const baseColors = [
        '#FF0000', '#FF3300', '#FF6600', '#FF9900', '#FFCC00', // Reds to Yellows
        '#FFFF00', '#CCFF00', '#99FF00', '#66FF00', '#33FF00', // Yellows to Greens
        '#00FF00', '#00FF33', '#00FF66', '#00FF99', '#00FFCC', // Greens
        '#00FFFF', '#00CCFF', '#0099FF', '#0066FF', '#0033FF', // Cyans to Blues
        '#0000FF', '#3300FF', '#6600FF', '#9900FF', '#CC00FF', // Blues to Purples
        '#FF00FF', '#FF00CC', '#FF0099', '#FF0066', '#FF0033', // Magentas to Pinks
        '#FFFFFF', '#E0E0E0', '#C0C0C0', '#A0A0A0', '#808080', // Whites to Grays
        '#606060', '#404040', '#202020', '#000000', '#800000'  // Grays to Blacks, plus some extras
    ];

    // Functions
    function initializeColorPalette() {
        baseColors.forEach(color => {
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch';
            colorSwatch.style.backgroundColor = color;
            colorSwatch.dataset.color = color;
            colorSwatch.addEventListener('click', () => selectColor(color, colorSwatch));
            colorGrid.appendChild(colorSwatch);
        });
    }

    function selectColor(color, swatch) {
        if (selectedColors.includes(color)) {
            // Deselect if already selected
            selectedColors.splice(selectedColors.indexOf(color), 1);
            swatch.classList.remove('selected');
        } else if (selectedColors.length < 3) {
            // Select if we have less than 3 colors
            selectedColors.push(color);
            swatch.classList.add('selected');
        }

        updateSelectedColorsDisplay();
        updateMixButton();
    }

    function updateMixButton() {
        mixColorsBtn.disabled = selectedColors.length < 2;
    }

    function updateSelectedColorsDisplay() {
        selectedColorsContainer.innerHTML = '';
        
        selectedColors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'selected-color';
            colorDiv.style.backgroundColor = color;
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-color';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => {
                selectedColors.splice(selectedColors.indexOf(color), 1);
                document.querySelector(`.color-swatch[data-color="${color}"]`).classList.remove('selected');
                updateSelectedColorsDisplay();
                updateMixButton();
            });
            
            colorDiv.appendChild(removeBtn);
            selectedColorsContainer.appendChild(colorDiv);
        });
    }

    function mixColors() {
        if (selectedColors.length < 2) return;

        // Convert hex to RGB and calculate the average
        let r = 0, g = 0, b = 0;
        
        selectedColors.forEach(color => {
            const hex = color.replace('#', '');
            const bigint = parseInt(hex, 16);
            r += (bigint >> 16) & 255;
            g += (bigint >> 8) & 255;
            b += bigint & 255;
        });
        
        // Average the RGB values
        r = Math.round(r / selectedColors.length);
        g = Math.round(g / selectedColors.length);
        b = Math.round(b / selectedColors.length);
        
        // Convert back to hex
        mixedColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        
        // Display the mixed color
        resultColorDiv.innerHTML = '';
        resultColorDiv.style.backgroundColor = mixedColor;
        resultColorDiv.style.border = 'none';
        
        // Enable save button and clear name input
        saveColorBtn.disabled = false;
        colorNameInput.value = '';
    }

    function saveColor() {
        if (!mixedColor) return;
        
        const colorName = colorNameInput.value.trim() || `Mix #${savedColors.length + 1}`;
        
        savedColors.push({
            color: mixedColor,
            name: colorName
        });
        
        // Save to localStorage
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        
        // Reset the mixing area
        resetMixingArea();
        
        // Update the gallery
        updateColorGallery();
    }

    function resetMixingArea() {
        // Clear selected colors
        selectedColors.length = 0;
        document.querySelectorAll('.color-swatch.selected').forEach(swatch => {
            swatch.classList.remove('selected');
        });
        
        updateSelectedColorsDisplay();
        
        // Reset result area
        mixedColor = null;
        resultColorDiv.style.backgroundColor = '';
        resultColorDiv.style.border = '1px dashed #ccc';
        resultColorDiv.innerHTML = 'Mix colors to see the result';
        
        // Disable buttons
        mixColorsBtn.disabled = true;
        saveColorBtn.disabled = true;
        
        // Clear input
        colorNameInput.value = '';
    }

    function updateColorGallery() {
        colorGallery.innerHTML = '';
        
        if (savedColors.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-gallery';
            emptyMessage.textContent = 'Your saved colors will appear here';
            colorGallery.appendChild(emptyMessage);
            return;
        }
        
        savedColors.forEach((savedColor, index) => {
            const colorCard = document.createElement('div');
            colorCard.className = 'saved-color';
            
            const colorSample = document.createElement('div');
            colorSample.className = 'color-sample';
            colorSample.style.backgroundColor = savedColor.color;
            
            const colorInfo = document.createElement('div');
            colorInfo.className = 'color-info';
            
            const colorName = document.createElement('div');
            colorName.className = 'color-name';
            colorName.textContent = savedColor.name;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.addEventListener('click', () => deleteColor(index));
            
            colorInfo.appendChild(colorName);
            colorInfo.appendChild(deleteBtn);
            
            colorCard.appendChild(colorSample);
            colorCard.appendChild(colorInfo);
            
            colorGallery.appendChild(colorCard);
        });
    }

    function deleteColor(index) {
        savedColors.splice(index, 1);
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        updateColorGallery();
    }

    // Event Listeners
    mixColorsBtn.addEventListener('click', mixColors);
    saveColorBtn.addEventListener('click', saveColor);

    // Initialize
    initializeColorPalette();
    updateColorGallery();
    
    // Set initial state for result area
    resultColorDiv.innerHTML = 'Mix colors to see the result';
});

