document.addEventListener('DOMContentLoaded', () => {
    const colorPalette = document.getElementById('color-palette');
    const tray = document.getElementById('tray');
    const mixButton = document.getElementById('mix-button');
    const colorNameInput = document.getElementById('color-name');
    const saveButton = document.getElementById('save-button');
    const gallery = document.getElementById('gallery');

    let selectedColors = [];
    let savedColors = JSON.parse(localStorage.getItem('savedColors') || '[]');

    function generatePaletteColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = Math.floor(Math.random() * 360);
            const saturation = Math.floor(Math.random() * 70) + 30; 
            const lightness = Math.floor(Math.random() * 70) + 20;   
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
    }

    const paletteColors = generatePaletteColors(100); 
    paletteColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
            toggleColorSelection(swatch, color);
        });
        colorPalette.appendChild(swatch);
    });

    function toggleColorSelection(swatch, color) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedColors = selectedColors.filter(c => c !== color);
            removeColorFromTray(color);
        } else if (selectedColors.length < 3) {
            swatch.classList.add('selected');
            selectedColors.push(color);
            addColorToTray(color);
        } else {
            alert("You can only select up to 3 colors to mix.");
        }
        updateMixButtonState();
    }

    function addColorToTray(color) {
        const trayColor = document.createElement('div');
        trayColor.classList.add('tray-color');
        trayColor.style.backgroundColor = color;
        trayColor.dataset.color = color; 
        tray.appendChild(trayColor);
    }

    function removeColorFromTray(color) {
        const trayColors = Array.from(tray.querySelectorAll('.tray-color'));
        const colorToRemove = trayColors.find(tc => tc.dataset.color === color);
        if (colorToRemove) {
            tray.removeChild(colorToRemove);
        }
    }

    function updateMixButtonState() {
        mixButton.disabled = selectedColors.length < 2;
        colorNameInput.disabled = selectedColors.length < 2;
        saveButton.disabled = selectedColors.length < 2;
        if (mixButton.disabled) {
            mixButton.textContent = 'Mix Colors'; 
        }
    }

    mixButton.addEventListener('click', () => {
        if (selectedColors.length >= 2) {
            const mixedColor = mixColors(selectedColors);
            tray.innerHTML = ''; 
            addColorToTray(mixedColor); 
            mixButton.textContent = 'Mixed!';
            mixButton.disabled = true; 
            colorNameInput.disabled = false;
            saveButton.disabled = false;
            colorNameInput.focus(); 
        }
    });

    function mixColors(colors) {
        let r = 0, g = 0, b = 0;
        colors.forEach(color => {
            const rgb = hslToRgb(color); 
            r += rgb[0];
            g += rgb[1];
            b += rgb[2];
        });
        r = Math.round(r / colors.length);
        g = Math.round(g / colors.length);
        b = Math.round(b / colors.length);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function hslToRgb(hslColor) {
        hslColor = hslColor.substring(4, hslColor.length-1); 
        let parts = hslColor.split(',');
        let h = parseInt(parts[0]);
        let s = parseInt(parts[1].replace('%','')) / 100;
        let l = parseInt(parts[2].replace('%','')) / 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c/2,
            r = 0,
            g = 0,
            b = 0;

        if(0 <= h && h < 60){
            r = c; g = x; b = 0;
        }else if(60 <= h && h < 120){
            r = x; g = c; b = 0;
        }else if(120 <= h && h < 180){
            r = 0; g = c; b = x;
        }else if(180 <= h && h < 240){
            r = 0; g = x; b = c;
        }else if(240 <= h && h < 300){
            r = x; g = 0; b = c;
        }else if(300 <= h && h < 360){
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return [r, g, b];
    }

    saveButton.addEventListener('click', () => {
        const colorName = colorNameInput.value.trim();
        if (colorName && tray.firstChild && tray.firstChild.style.backgroundColor) {
            const colorValue = tray.firstChild.style.backgroundColor;
            saveColor(colorName, colorValue);
            colorNameInput.value = ''; 
            mixButton.textContent = 'Mix Colors'; 
            updateMixButtonState(); 
            tray.innerHTML = '';
            selectedColors = [];
            document.querySelectorAll('.color-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));

        } else {
            alert("Please name your color before saving.");
        }
    });

    function saveColor(name, value) {
        savedColors.push({ name: name, color: value });
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        displayGallery(); 
    }

    function displayGallery() {
        gallery.innerHTML = ''; 
        if (savedColors.length === 0) {
            gallery.textContent = 'No colors saved yet.';
            return;
        }
        savedColors.forEach((savedColor, index) => {
            const galleryColorDiv = document.createElement('div');
            galleryColorDiv.classList.add('gallery-color');
            galleryColorDiv.style.backgroundColor = savedColor.color;

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedColor(index);
            });
            galleryColorDiv.appendChild(deleteButton);

            galleryColorDiv.addEventListener('click', () => {
                alert(`Color Name: ${savedColor.name}\nColor Value: ${savedColor.color}`);
            });

            gallery.appendChild(galleryColorDiv);
        });
    }

    function deleteSavedColor(index) {
        savedColors.splice(index, 1);
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        displayGallery(); 
    }

    displayGallery(); 
    updateMixButtonState(); 


    const animalPalette = document.getElementById('animal-palette');
    const animalTray = document.getElementById('animal-tray');
    const mixAnimalButton = document.getElementById('mix-animal-button');
    const animalNameInput = document.getElementById('animal-name');
    const saveAnimalButton = document.getElementById('save-animal-button');
    const animalGallery = document.getElementById('animal-gallery');

    let selectedAnimals = [];
    let savedAnimals = JSON.parse(localStorage.getItem('savedAnimals') || '[]');

    const animalList = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Snake', 'Lizard', 'Turtle', 'Horse', 'Cow', 'Pig', 'Chicken', 'Duck', 'Sheep', 'Goat', 'Llama', 'Alpaca', 'Donkey', 'Mule', 'Fox', 'Wolf', 'Bear', 'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Gorilla', 'Panda', 'Koala', 'Kangaroo', 'Beaver', 'Otter', 'Seal', 'Walrus', 'Penguin', 'Owl', 'Eagle', 'Hawk', 'Falcon', 'Swan', 'Goose', 'Crow', 'Raven', 'Parrot'];

    function generateAnimalPalette(animals) {
        animals.forEach(animal => {
            const swatch = document.createElement('div');
            swatch.classList.add('animal-swatch');
            swatch.textContent = animal;
            swatch.addEventListener('click', () => {
                toggleAnimalSelection(swatch, animal);
            });
            animalPalette.appendChild(swatch);
        });
    }

    function toggleAnimalSelection(swatch, animal) {
        if (swatch.classList.contains('selected')) {
            swatch.classList.remove('selected');
            selectedAnimals = selectedAnimals.filter(a => a !== animal);
            removeAnimalFromTray(animal);
        } else if (selectedAnimals.length < 3) {
            swatch.classList.add('selected');
            selectedAnimals.push(animal);
            addAnimalToTray(animal);
        } else {
            alert("You can only select up to 3 animals to mix.");
        }
        updateMixAnimalButtonState();
    }

    function addAnimalToTray(animal) {
        const trayAnimal = document.createElement('div');
        trayAnimal.classList.add('tray-animal');
        trayAnimal.textContent = animal;
        trayAnimal.dataset.animal = animal; 
        animalTray.appendChild(trayAnimal);
    }

    function removeAnimalFromTray(animal) {
        const trayAnimals = Array.from(animalTray.querySelectorAll('.tray-animal'));
        const animalToRemove = trayAnimals.find(ta => ta.dataset.animal === animal);
        if (animalToRemove) {
            animalTray.removeChild(animalToRemove);
        }
    }

    function updateMixAnimalButtonState() {
        mixAnimalButton.disabled = selectedAnimals.length < 2;
        animalNameInput.disabled = selectedAnimals.length < 2;
        saveAnimalButton.disabled = selectedAnimals.length < 2;
        if (mixAnimalButton.disabled) {
            mixAnimalButton.textContent = 'Mix Animals'; 
        }
    }

    mixAnimalButton.addEventListener('click', () => {
        if (selectedAnimals.length >= 2) {
            const mixedAnimal = mixAnimals(selectedAnimals);
            animalTray.innerHTML = ''; 
            const mixedAnimalDisplay = document.createElement('div');
            mixedAnimalDisplay.classList.add('tray-animal');
            mixedAnimalDisplay.textContent = mixedAnimal;
            animalTray.appendChild(mixedAnimalDisplay);
            mixAnimalButton.textContent = 'Mixed!';
            mixAnimalButton.disabled = true; 
            animalNameInput.disabled = false;
            saveAnimalButton.disabled = false;
            animalNameInput.focus(); 
        }
    });

    function mixAnimals(animals) {
        return animals.join('-'); 
    }

    saveAnimalButton.addEventListener('click', () => {
        const animalName = animalNameInput.value.trim();
        if (animalName && animalTray.firstChild && animalTray.firstChild.textContent) {
            const animalValue = animalTray.firstChild.textContent;
            saveAnimal(animalName, animalValue);
            animalNameInput.value = '';
            mixAnimalButton.textContent = 'Mix Animals';
            updateMixAnimalButtonState();
            animalTray.innerHTML = '';
            selectedAnimals = [];
            document.querySelectorAll('.animal-swatch.selected').forEach(swatch => swatch.classList.remove('selected'));
        } else {
            alert("Please name your animal before saving.");
        }
    });

    function saveAnimal(name, value) {
        savedAnimals.push({ name: name, animal: value });
        localStorage.setItem('savedAnimals', JSON.stringify(savedAnimals));
        displayAnimalGallery();
    }

    function displayAnimalGallery() {
        animalGallery.innerHTML = '';
        if (savedAnimals.length === 0) {
            animalGallery.textContent = 'No animals saved yet.';
            return;
        }
        savedAnimals.forEach((savedAnimal, index) => {
            const galleryAnimalDiv = document.createElement('div');
            galleryAnimalDiv.classList.add('gallery-animal');
            galleryAnimalDiv.textContent = savedAnimal.animal;

            const deleteButton = document.createElement('div');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                deleteSavedAnimal(index);
            });
            galleryAnimalDiv.appendChild(deleteButton);

            galleryAnimalDiv.addEventListener('click', () => {
                alert(`Animal Name: ${savedAnimal.name}\nMixed Animal: ${savedAnimal.animal}`);
            });

            animalGallery.appendChild(galleryAnimalDiv);
        });
    }

    function deleteSavedAnimal(index) {
        savedAnimals.splice(index, 1);
        localStorage.setItem('savedAnimals', JSON.stringify(savedAnimals));
        displayAnimalGallery();
    }

    generateAnimalPalette(animalList);
    displayAnimalGallery();
    updateMixAnimalButtonState();
});