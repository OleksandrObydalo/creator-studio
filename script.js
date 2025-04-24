document.addEventListener('DOMContentLoaded', () => {
    // Tab elements
    const tabs = {
        color: { btn: document.getElementById('colorTabBtn'), content: document.getElementById('colorTab') },
        animal: { btn: document.getElementById('animalTabBtn'), content: document.getElementById('animalTab') },
        character: { btn: document.getElementById('characterTabBtn'), content: document.getElementById('characterTab') },
        movieMix: { btn: document.getElementById('movieMixTabBtn'), content: document.getElementById('movieMixTab') },
    };

    // Color mixer elements
    const colorGrid = document.getElementById('colorGrid');
    const selectedColorsContainer = document.getElementById('selectedColors');
    const mixColorsBtn = document.getElementById('mixColorsBtn');
    const resultColorDiv = document.getElementById('resultColor');
    const colorNameInput = document.getElementById('colorName');
    const saveColorBtn = document.getElementById('saveColorBtn');
    const colorGallery = document.getElementById('colorGallery');

    // Animal mixer elements
    const animalGrid = document.getElementById('animalGrid');
    const selectedAnimalsContainer = document.getElementById('selectedAnimals');
    const mixAnimalsBtn = document.getElementById('mixAnimalsBtn');
    const resultAnimalDiv = document.getElementById('resultAnimal');
    const animalNameInput = document.getElementById('animalName');
    const saveAnimalBtn = document.getElementById('saveAnimalBtn');
    const animalGallery = document.getElementById('animalGallery');

    // Character Creator elements
    const characterGrid = document.getElementById('characterGrid');
    const selectedCharactersContainer = document.getElementById('selectedCharacters');
    const mixCharactersBtn = document.getElementById('mixCharactersBtn');
    const resultCharacterDiv = document.getElementById('resultCharacter');
    const characterNameInput = document.getElementById('characterName');
    const saveCharacterBtn = document.getElementById('saveCharacterBtn');
    const characterGallery = document.getElementById('characterGallery');

    // Movie Mixer elements
    const movieMixGrid = document.getElementById('movieMixGrid');
    const selectedMoviesMixContainer = document.getElementById('selectedMoviesMix');
    const mixMoviesMixBtn = document.getElementById('mixMoviesMixBtn');
    const resultMovieMixDiv = document.getElementById('resultMovieMix');
    const movieMixNameInput = document.getElementById('movieMixName');
    const saveMovieMixBtn = document.getElementById('saveMovieMixBtn');
    const movieMixGallery = document.getElementById('movieMixGallery');

    // State
    const selectedColors = [];
    const savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];
    let mixedColor = null;

    const selectedAnimals = []; // stores { emoji, name }
    const savedAnimals = JSON.parse(localStorage.getItem('savedAnimals')) || []; // stores { name, prompt, imageUrl }
    let mixedAnimalPrompt = null;
    let mixedAnimalImageUrl = null;

    const selectedCharacters = []; // stores strings (traits)
    const savedCharacters = JSON.parse(localStorage.getItem('savedCharacters')) || []; // stores { name, prompt, imageUrl }
    let mixedCharacterPrompt = null;
    let mixedCharacterImageUrl = null;

    const selectedMoviesMix = []; // stores strings (titles)
    const savedMovieMixes = JSON.parse(localStorage.getItem('savedMovieMixes')) || []; // stores { name, prompt, imageUrl }
    let mixedMovieMixPrompt = null;
    let mixedMovieMixImageUrl = null;

    // --- General Tab Functionality ---
    // Add active class to the first tab on load
    tabs.color.btn.classList.add('active');
    tabs.color.content.style.display = 'grid';

    function switchTab(activeTabId) {
        for (const tabId in tabs) {
            const tab = tabs[tabId];
            if (tabId === activeTabId) {
                tab.btn.classList.add('active');
                tab.content.style.display = 'grid'; // Assuming main-content uses grid
            } else {
                tab.btn.classList.remove('active');
                tab.content.style.display = 'none';
            }
        }
    }

    for (const tabId in tabs) {
        tabs[tabId].btn.addEventListener('click', () => switchTab(tabId));
    }

    // --- Common AI Image Generation Logic ---
    async function generateImage(prompt, resultDiv, saveBtn) {
        resultDiv.innerHTML = '<p>Generating image... <span class="loader"></span></p>';
        resultDiv.style.color = '#555';
        resultDiv.style.fontStyle = 'italic';
        resultDiv.style.border = '1px dashed #ccc';
        resultDiv.style.backgroundColor = 'transparent';
        resultDiv.style.display = 'flex';
        resultDiv.style.alignItems = 'center';
        resultDiv.style.justifyContent = 'center';
        resultDiv.style.textAlign = 'center';
        resultDiv.style.backgroundImage = 'none'; // Clear any previous background image

        saveBtn.disabled = true; // Disable save while generating

        let imageUrl = null; // Initialize imageUrl here

        try {
            const result = await websim.imageGen({
                prompt: prompt,
                width: 512,
                height: 512
                // aspect_ratio: '1:1' // Can use aspect ratio instead of width/height
            });

            imageUrl = result.url; // Assign the generated URL
            resultDiv.innerHTML = ''; // Clear loading text
            resultDiv.style.border = 'none';
            resultDiv.style.backgroundColor = 'transparent'; // Clear background if needed

            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.borderRadius = '8px';
            img.alt = prompt; // Add alt text
            img.style.objectFit = 'contain'; // Ensure image fits

            resultDiv.appendChild(img);

        } catch (error) {
            console.error("AI image generation failed:", error);
            resultDiv.innerHTML = '<p>Image generation failed. Try again!</p>';
            resultDiv.style.color = 'red';
            resultDiv.style.fontStyle = 'normal';
            resultDiv.style.border = '1px dashed red';
            imageUrl = null; // Ensure imageUrl is null on failure
        } finally {
             // Specific handlers will re-enable save button based on whether imageUrl is null
        }
         return imageUrl; // Return the generated URL or null
    }

    // Helper function to create a remove button
    function createRemoveButton(onClick) {
        const removeBtn = document.createElement('div');
        removeBtn.className = 'remove-color'; // Reuse color remove style/class
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', onClick);
        return removeBtn;
    }

    // Helper function to create a delete button
    function createDeleteButton(onClick) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️'; // Use trash can emoji
        deleteBtn.addEventListener('click', onClick);
        return deleteBtn;
    }

    // Helper function to delete an item from storage
    function deleteItem(type, index) {
        switch (type) {
            case 'colors':
                savedColors.splice(index, 1);
                localStorage.setItem('savedColors', JSON.stringify(savedColors));
                updateColorGallery();
                break;
            case 'animals':
                savedAnimals.splice(index, 1);
                localStorage.setItem('savedAnimals', JSON.stringify(savedAnimals));
                updateAnimalGallery();
                break;
             case 'characters':
                savedCharacters.splice(index, 1);
                localStorage.setItem('savedCharacters', JSON.stringify(savedCharacters));
                updateCharacterGallery();
                break;
            case 'movieMixes':
                savedMovieMixes.splice(index, 1);
                localStorage.setItem('savedMovieMixes', JSON.stringify(savedMovieMixes));
                updateMovieMixGallery();
                break;
            default:
                console.error(`Unknown type ${type} for deleteItem`);
        }
    }

    // --- COLOR MIXER FUNCTIONS ---
    const baseColors = [
        '#FF0000', '#E60000', '#CC0000', '#B30000', '#990000', '#800000', '#660000', '#4D0000', '#330000', '#1A0000', // Dark Reds
        '#FF3300', '#FF6600', '#FF9900', '#FFCC00', '#FFFF00', '#CCFF00', '#99FF00', '#66FF00', '#33FF00', '#00FF00', // Reds to Greens
        '#00E600', '#00CC00', '#00B300', '#009900', '#008000', '#006600', '#004D00', '#003300', '#001A00', // Dark Greens
        '#00FF33', '#00FF66', '#00FF99', '#00FFCC', '#00FFFF', '#00CCFF', '#0099FF', '#0066FF', '#0033FF', '#0000FF', // Greens to Blues
        '#0000E6', '#0000CC', '#0000B3', '#000099', '#000080', '#000066', '#00004D', '#000033', '#00001A', // Dark Blues
        '#3300FF', '#6600FF', '#9900FF', '#CC00FF', '#FF00FF', '#FF00CC', '#FF0099', '#FF0066', '#FF0033', // Blues to Magentas
        '#FF33CC', '#FF66FF', '#FF99CC', '#FFCCFF', '#FFCCE6', '#FFCCB3', '#FFCC80', '#FFCC4D', '#FFCC1A', // Pinks/Light Magentas
        '#FFFFFF', '#F8F8FF', '#F0F8FF', '#E6E6FA', '#D8BFD8', '#DDA0DD', '#EE82EE', '#FF00FF', // Whites and Light Purples
        '#EEE8AA', '#F0E68C', '#DAA520', '#B8860B', '#A52A2A', '#8B4513', '#D2691E', '#CD5C5C', // Golds/Browns/Reds
        '#F5F5DC', '#FAEBD7', '#FFEBCD', '#FFDEAD', '#C4A484', '#DEB887', '#A0522D', '#BC8F8F', // Beiges/Tans/Browns
        '#00FFFF', '#AFEEEE', '#7FFFD4', '#40E0D0', '#48D1CC', '#00CED1', '#5F9EA0', '#20B2AA', // Cyans/Teals
        '#7CFC00', '#ADFF2F', '#98FB98', '#90EE90', '#8FBC8F', '#32CD32', '#008000', '#006400', // Greens
        '#B0E0E6', '#ADD8E6', '#87CEFA', '#87CEEB', '#6495ED', '#4682B4', '#1E90FF', '#00BFFF', // Blues
        '#4169E1', '#0000CD', '#00008B', '#191970', '#483D8B', '#6A5ACD', '#7B68EE', '#8470FF', // Blues/Purples
        '#BA55D3', '#9932CC', '#8A2BE2', '#9400D3', '#9932CC', '#8B008B', '#4B0082', // Purples
        '#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#DC143C', '#C71585', '#FF007F', // Pinks/Deep Pinks
        '#2F4F4F', '#696969', '#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC', '#E8E8E8', '#F5F5F5', '#000000', // Grays/Black
        '#556B2F', '#6B8E23', '#8FBC8F', '#3CB371', '#2E8B57', '#3CB371', '#2E8B57', '#8FBC8F', '#6B8E23', '#556B2F', // Olive/Dark Greens
        '#8B0000', '#A52A2A', '#B22222', '#CD5C5C', '#DC143C', '#C71585', '#DB7093', '#FF69B4', '#FFB6C1', '#FFC0CB', // Reds/Rosy Reds/Pinks
        '#800080', '#4B0082', '#9400D3', '#9932CC', '#BA55D3', '#8A2BE2', '#BF00FF', '#DA70D6', '#EE82EE', '#DDA0DD', // Purples
        '#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00', '#FFFFE0', '#FFFACD', '#FAFAD2', '#FFEFD5', '#FFDAB9', // Oranges/Yellows/Light Yellows
        '#F08080', '#FA8072', '#E9967A', '#F0E68C', '#DAA520', '#B8860B', '#CD853F', '#D2691E', '#8B4513', '#A0522D', // Salmon/Tan/Browns
        '#66CDBB', '#48D1CC', '#00CED1', '#20B2AA', '#5F9EA0', '#008B8B', '#008080', '#00FFFF', '#E0FFFF', '#AFEEEE', // Cyan/Teal
        '#708090', '#778899', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC', '#E8E8E8', '#F5F5F5', '#FFFFFF', '#000000', // Slategray/Grays/White/Black
        '#F5F5DC', '#FFEBCD', '#FAEBD7', '#FAF0E6', '#FFF5EE', '#F5FFFA', '#F0FFF0', '#F0FFFF', '#F8F8FF', '#FFF0F5' // Off Whites/Pastels
    ];

    function initializeColorPalette() {
        colorGrid.innerHTML = '';
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
        const index = selectedColors.indexOf(color);
        if (index > -1) {
            selectedColors.splice(index, 1);
            swatch.classList.remove('selected');
        } else if (selectedColors.length < 3) {
            selectedColors.push(color);
            swatch.classList.add('selected');
        } else {
            alert("You can only select up to 3 colors to mix.");
        }
        updateSelectedColorsDisplay();
        updateMixButtonState('color');
        resetResultArea('color'); // Reset result when selection changes
         saveColorBtn.disabled = true; // Disable save until mixed again
    }

    function updateSelectedColorsDisplay() {
        selectedColorsContainer.innerHTML = '';
        selectedColors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'selected-color';
            colorDiv.style.backgroundColor = color;
            const removeBtn = createRemoveButton(() => {
                selectColor(color, colorGrid.querySelector(`.color-swatch[data-color="${color}"]`));
            });
            colorDiv.appendChild(removeBtn);
            selectedColorsContainer.appendChild(colorDiv);
        });
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.replace('#', ''), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    }

    function rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    function mixColors() {
        if (selectedColors.length < 2) return;
        let r = 0, g = 0, b = 0;
        selectedColors.forEach(color => {
            const rgb = hexToRgb(color);
            r += rgb[0]; g += rgb[1]; b += rgb[2];
        });
        r = Math.round(r / selectedColors.length);
        g = Math.round(g / selectedColors.length);
        b = Math.round(b / selectedColors.length);
        mixedColor = rgbToHex(r, g, b);

        resultColorDiv.innerHTML = '';
        resultColorDiv.style.backgroundColor = mixedColor;
        resultColorDiv.style.border = '2px solid #007bff';
        resultColorDiv.style.color = 'transparent'; // Hide text

        saveColorBtn.disabled = false;
        colorNameInput.value = '';
    }

    function saveColor() {
        if (!mixedColor) return;
        const colorName = colorNameInput.value.trim() || `Color Mix #${savedColors.length + 1}`;
        savedColors.push({ color: mixedColor, name: colorName });
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        resetMixingArea('color');
        updateColorGallery();
    }

    function updateColorGallery() {
        colorGallery.innerHTML = '';
        if (savedColors.length === 0) {
            colorGallery.innerHTML = '<p class="empty-gallery">Your saved colors will appear here</p>';
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
            const deleteBtn = createDeleteButton(() => deleteItem('colors', index));
            colorInfo.appendChild(colorName);
            colorInfo.appendChild(deleteBtn);
            colorCard.appendChild(colorSample);
            colorCard.appendChild(colorInfo);
            colorGallery.appendChild(colorCard);
        });
    }

    // --- ANIMAL MIXER FUNCTIONS ---
    const animalMap = new Map([
        ['🐶', 'Dog'], ['🐱', 'Cat'], ['🐦', 'Bird'], ['🐠', 'Fish'], ['🦁', 'Lion'],
        ['🐅', 'Tiger'], ['🐘', 'Elephant'], ['🦒', 'Giraffe'], ['🐒', 'Monkey'], ['🦓', 'Zebra'],
        ['🐼', 'Panda'], ['🐨', 'Koala'], ['🦘', 'Kangaroo'], ['🐧', 'Penguin'], ['🐻', 'Bear'],
        ['🐺', 'Wolf'], ['🦊', 'Fox'], ['🐰', 'Rabbit'], ['🦌', 'Deer'], ['🐿️', 'Squirrel'],
        ['🐊', 'Alligator'], ['🐢', 'Turtle'], ['🐍', 'Snake'], ['🦉', 'Owl'], ['🦅', 'Eagle'],
        ['🐬', 'Dolphin'], ['🐳', 'Whale'], ['🦈', 'Shark'], ['🐙', 'Octopus'], ['🦀', 'Crab'], ['🦞', 'Lobster'], ['🦐', 'Shrimp'], ['🦑', 'Squid'], ['🐚', 'Seashell'],
        ['🦄', 'Unicorn'], ['🐉', 'Dragon'], ['🦋', 'Butterfly'], ['🕷️', 'Spider'], ['🐝', 'Bee'], ['🐞', 'Ladybug'], ['🐜', 'Ant'], ['🦗', 'Cricket'], ['🦂', 'Scorpion'], ['🦟', 'Mosquito'], ['🪰', 'Fly'], ['🐛', 'Bug'], ['🐛', 'Caterpillar'], ['🐌', 'Snail'],
        ['🦖', 'T-Rex'], ['🦕', 'Sauropod'], ['🐾', 'Paw Print'], ['🌳', 'Forest Animal'], ['🌊', 'Sea Creature'], ['🏜️', 'Desert Animal'], ['🏔️', 'Mountain Animal'], // Conceptual/Mythical
        ['🦍', 'Gorilla'], [' orangutan', ' Orangutan'], ['🦧', 'Orangutan'], ['🐒', 'Monkey'],
        ['🐴', 'Horse'], ['🐎', 'Racehorse'], ['🦄', 'Unicorn'], ['🦓', 'Zebra'], ['🦌', 'Deer'], ['🦬', 'Bison'], ['🐄', 'Cow'], ['🐂', 'Ox'], ['🐃', 'Water Buffalo'], ['🐖', 'Pig'], ['🐗', 'Boar'], ['🐏', 'Ram'], ['🐑', 'Sheep'], ['🐐', 'Goat'],
        ['🐪', 'Camel'], ['🐫', 'Two-Hump Camel'], ['🦙', 'Llama'], ['🦒', 'Giraffe'], ['🐘', 'Elephant'], ['🦣', 'Mammoth'], ['🦏', 'Rhinoceros'], ['🦛', 'Hippopotamus'],
        ['🐁', 'Mouse'], ['🐀', 'Rat'], ['🐹', 'Hamster'], ['🐿️', 'Chipmunk'], ['🦔', 'Hedgehog'], ['🦦', 'Otter'], ['🦫', 'Beaver'], ['🦨', 'Skunk'], ['🦡', 'Badger'],
        ['🐩', 'Poodle'], ['🐕', 'Dog'], ['🐺', 'Wolf'], ['🦊', 'Fox'], [' racoon', ' Racoon'], ['🐾', 'Paw Prints'],
        ['🦥', 'Sloth'], ['🦎', 'Lizard'], ['🐍', 'Snake'], ['🐢', 'Turtle'], ['🐊', 'Crocodile'], ['🐸', 'Frog'], ['🐉', 'Dragon'],
        ['🦢', 'Swan'], ['🦆', 'Duck'], ['🦉', 'Owl'], ['🦅', 'Eagle'], ['🕊️', 'Dove'], ['🦜', 'Parrot'], ['🦩', 'Flamingo'], ['🦃', 'Turkey'], ['🐓', 'Rooster'], ['🐔', 'Chicken'], ['🐣', 'Chick'], ['🐧', 'Penguin'], ['🐦', 'Small Bird']
    ]);
    const animalEmojis = Array.from(animalMap.keys());

    function initializeAnimalPalette() {
        animalGrid.innerHTML = '';
        animalEmojis.forEach(emoji => {
            const animalSwatch = document.createElement('div');
            animalSwatch.className = 'animal-swatch';
            animalSwatch.textContent = emoji;
            animalSwatch.dataset.emoji = emoji; // Store emoji for easy lookup
            animalSwatch.title = animalMap.get(emoji); // Add tooltip
            animalSwatch.addEventListener('click', () => selectAnimal(emoji, animalSwatch));
            animalGrid.appendChild(animalSwatch);
        });
    }

    function selectAnimal(emoji, swatch) {
        const animalName = animalMap.get(emoji);
        const existingIndex = selectedAnimals.findIndex(item => item.emoji === emoji);

        if (existingIndex > -1) {
            selectedAnimals.splice(existingIndex, 1);
            swatch.classList.remove('selected');
        } else if (selectedAnimals.length < 3) {
            selectedAnimals.push({ emoji, name: animalName });
            swatch.classList.add('selected');
        } else {
            alert("You can only select up to 3 animals to mix.");
        }
        updateSelectedAnimalsDisplay();
        updateMixButtonState('animal');
        resetResultArea('animal');
    }

    function updateSelectedAnimalsDisplay() {
        selectedAnimalsContainer.innerHTML = '';
        selectedAnimals.forEach(animalObj => {
            const animalDiv = document.createElement('div');
            animalDiv.className = 'selected-animal';
            animalDiv.textContent = animalObj.emoji;
            animalDiv.title = animalObj.name; // Add tooltip
            const removeBtn = createRemoveButton(() => {
                selectAnimal(animalObj.emoji, animalGrid.querySelector(`.animal-swatch[data-emoji="${animalObj.emoji}"]`));
            });
            animalDiv.appendChild(removeBtn);
            selectedAnimalsContainer.appendChild(animalDiv);
        });
    }

    async function mixAnimals() {
        if (selectedAnimals.length < 2) return;
        const names = selectedAnimals.map(animal => animal.name);
        mixedAnimalPrompt = `A creature that is a mix of ${names.join(' and ')}. Make it look like a unique fantastical animal hybrid. Digital art, full body, simple background.`;

        mixedAnimalImageUrl = await generateImage(mixedAnimalPrompt, resultAnimalDiv, saveAnimalBtn);
        if (mixedAnimalImageUrl) {
            saveAnimalBtn.disabled = false;
            animalNameInput.value = '';
        } else {
            saveAnimalBtn.disabled = true;
        }
    }

    function saveAnimal() {
        if (!mixedAnimalImageUrl) return;
        const animalName = animalNameInput.value.trim() || `Animal Mix #${savedAnimals.length + 1}`;
        savedAnimals.push({ name: animalName, prompt: mixedAnimalPrompt, imageUrl: mixedAnimalImageUrl });
        localStorage.setItem('savedAnimals', JSON.stringify(savedAnimals));
        resetMixingArea('animal');
        updateAnimalGallery();
    }

    function updateAnimalGallery() {
        animalGallery.innerHTML = '';
        if (savedAnimals.length === 0) {
            animalGallery.innerHTML = '<p class="empty-gallery">Your saved animals will appear here</p>';
            return;
        }
        savedAnimals.forEach((savedAnimal, index) => {
            const animalCard = document.createElement('div');
            animalCard.className = 'saved-animal-card';
            const animalSample = document.createElement('div');
            animalSample.className = 'animal-sample';
            if (savedAnimal.imageUrl) {
                const img = document.createElement('img');
                img.src = savedAnimal.imageUrl;
                img.alt = savedAnimal.name;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                animalSample.appendChild(img);
            } else {
                animalSample.textContent = savedAnimal.prompt || 'No image generated'; // Fallback
            }

            const animalInfo = document.createElement('div');
            animalInfo.className = 'animal-info';
            const animalName = document.createElement('div');
            animalName.className = 'animal-name';
            animalName.textContent = savedAnimal.name;
            const deleteBtn = createDeleteButton(() => deleteItem('animals', index));
            animalInfo.appendChild(animalName);
            animalInfo.appendChild(deleteBtn);
            animalCard.appendChild(animalSample);
            animalCard.appendChild(animalInfo);
            animalGallery.appendChild(animalCard);
        });
    }

    // --- CHARACTER CREATOR FUNCTIONS ---
    const characterTraits = [
        "Mysterious", "Brave", "Shy", "Bold", "Magical", "Techy", "Ancient", "Futuristic",
        "Kind", "Grumpy", "Curious", "Loyal", "Witty", "Clumsy", "Powerful", "Weak",
        "Human", "Elf", "Dwarf", "Alien", "Robot", "Ghost", "Vampire", "Werewolf", "Zombie", "Orc", "Goblin", "Fairy", "Mermaid", "Angel", "Demon",
        "Flying", "Swimming", "Strong", "Fast", "Invisible", "Telepathic", "Shapeshifter", "Healer", "Sorcerer", "Warrior", "Rogue", "Bard", "Cleric", "Paladin", "Necromancer", "Psion", "Artificer",
        "Fire Elemental", "Water Elemental", "Earth Elemental", "Air Elemental", "Shadow", "Light", "Plant", "Ice", "Lightning", "Poison",
        "Steampunk", "Cyberpunk", "Fantasy Knight", "Space Pirate", "Detective", "Wizard", "Bard", "Ninja", "Samurai", "Cowboy", "Superhero", "Villain", "Explorer", "Scholar", "Engineer", "Artist", "Musician",
        "Tiny", "Giant", "Muscular", "Slim", "Four-Eyed", "Winged", "Horned", "Scaled", "Furry", "Feathered", "Aquatic", "Ethereal", "Mechanical", "Undead",
        "Wearing a Hat", "Carrying a Sword", "Holding a Staff", "With a Robot Companion", "Glowing Eyes", "Wearing Armor", "Wearing a Cape", "Has a Pet", "Covered in Tattoos", "Missing a Limb",
        "Silent", "Talkative", "Energetic", "Lazy", "Lucky", "Cursed", "Optimistic", "Pessimistic", "Stoic", "Dramatic", "Calm", "Hyperactive", "Forgetful", "Genius", "Foolish", "Naive", "Cynical"
    ];

    function initializeCharacterPalette() {
        characterGrid.innerHTML = '';
        characterTraits.forEach(trait => {
            const traitSwatch = document.createElement('div');
            traitSwatch.className = 'character-swatch'; // Use dedicated class
            traitSwatch.textContent = trait;
            traitSwatch.dataset.trait = trait; // Store trait
            traitSwatch.addEventListener('click', () => selectCharacterTrait(trait, traitSwatch));
            characterGrid.appendChild(traitSwatch);
        });
    }

    function selectCharacterTrait(trait, swatch) {
        const index = selectedCharacters.indexOf(trait);

        if (index > -1) {
            selectedCharacters.splice(index, 1);
            swatch.classList.remove('selected');
        } else if (selectedCharacters.length < 3) {
            selectedCharacters.push(trait);
            swatch.classList.add('selected');
        } else {
            alert("You can only select up to 3 traits to create a character.");
        }
        updateSelectedCharactersDisplay();
        updateMixButtonState('character');
        resetResultArea('character');
    }

     function updateSelectedCharactersDisplay() {
        selectedCharactersContainer.innerHTML = '';
        selectedCharacters.forEach(trait => {
            const traitDiv = document.createElement('div');
            traitDiv.className = 'tray-character'; // Use dedicated class
            traitDiv.textContent = trait;
            const removeBtn = createRemoveButton(() => {
                selectCharacterTrait(trait, characterGrid.querySelector(`.character-swatch[data-trait="${trait}"]`)); // Use character-swatch selector
            });
            traitDiv.appendChild(removeBtn);
            selectedCharactersContainer.appendChild(traitDiv);
        });
    }

    async function mixCharacters() {
        if (selectedCharacters.length < 2) return;
        const traits = selectedCharacters.join(' and ');
        mixedCharacterPrompt = `Create a unique cartoon character design that embodies the traits: ${traits}. Ensure the design is cohesive and visually interesting. Full body portrait, simple background.`;

        mixedCharacterImageUrl = await generateImage(mixedCharacterPrompt, resultCharacterDiv, saveCharacterBtn);
        if (mixedCharacterImageUrl) {
            saveCharacterBtn.disabled = false;
            characterNameInput.value = '';
        } else {
            saveCharacterBtn.disabled = true;
        }
    }

    function saveCharacter() {
         if (!mixedCharacterImageUrl) return;
        const characterName = characterNameInput.value.trim() || `Character #${savedCharacters.length + 1}`;
        savedCharacters.push({ name: characterName, prompt: mixedCharacterPrompt, imageUrl: mixedCharacterImageUrl });
        localStorage.setItem('savedCharacters', JSON.stringify(savedCharacters));
        resetMixingArea('character');
        updateCharacterGallery();
    }

    function updateCharacterGallery() {
         characterGallery.innerHTML = '';
        if (savedCharacters.length === 0) {
            characterGallery.innerHTML = '<p class="empty-gallery">Your saved characters will appear here</p>';
            return;
        }
        savedCharacters.forEach((savedCharacter, index) => {
            const characterCard = document.createElement('div');
            characterCard.className = 'saved-character-card'; // Use dedicated class
             const characterSample = document.createElement('div');
            characterSample.className = 'character-sample'; // Use dedicated class
            if (savedCharacter.imageUrl) {
                const img = document.createElement('img');
                img.src = savedCharacter.imageUrl;
                img.alt = savedCharacter.name;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                 img.style.objectFit = 'contain';
                characterSample.appendChild(img);
            } else {
                characterSample.textContent = savedCharacter.prompt || 'No image generated'; // Fallback
            }

            const characterInfo = document.createElement('div');
            characterInfo.className = 'character-info'; // Use dedicated class
            const characterName = document.createElement('div');
            characterName.className = 'character-name'; // Use dedicated class
            characterName.textContent = savedCharacter.name;
            const deleteBtn = createDeleteButton(() => deleteItem('characters', index));
            characterInfo.appendChild(characterName);
            characterInfo.appendChild(deleteBtn);
            characterCard.appendChild(characterSample);
            characterCard.appendChild(characterInfo);
            characterGallery.appendChild(characterCard);
        });
    }

    // --- MOVIE MIXER FUNCTIONS ---
    const movieTitles = [
        "Star Wars", "Harry Potter", "Lord of the Rings", "Jurassic Park", "Indiana Jones",
        "Matrix", "Marvel Cinematic Universe", "DC Extended Universe", "Pirates of the Caribbean",
        "Back to the Future", "Ghostbusters", "Terminator", "Alien", "Predator",
        "Avatar", "Titanic", "Inception", "Interstellar", "Dune", "Mad Max",
        "The Godfather", "Pulp Fiction", "Fight Club", "Forrest Gump", "Shawshank Redemption",
        "ET", "The Goonies", "Gremlins", "Beetlejuice", "Edward Scissorhands", "Big Trouble in Little China", "Labyrinth", "Dark Crystal",
        "Toy Story", "Lion King", "Finding Nemo", "Shrek", "How to Train Your Dragon", "Spirited Away", "My Neighbor Totoro", "Princess Mononoke", "Akira", "Ghost in the Shell",
        "Frozen", "Moana", "Zootopia", "Spider-Man", "Batman", "Superman", "Guardians of the Galaxy", "The Avengers", "Wonder Woman", "Aquaman", "The Flash",
        "Deadpool", "X-Men", "Spider-Man: Into the Spider-Verse", "Frozen II", "Encanto", "Coco", "Up", "Wall-E", "Ratatouille", "Monsters, Inc.", "Finding Dory", "Incredibles", "Cars", "The Princess Bride",
        "The Dark Knight", "Joker", "Arrival", "Blade Runner 2049", "Gravity",
        "Parasite", "Train to Busan", "Godzilla", "King Kong", "Pacific Rim",
        "Men in Black", "Independence Day", "Stargate", "Close Encounters of the Third Kind",
        "Die Hard", "Lethal Weapon", "Mission: Impossible", "James Bond", "Bourne Identity",
        "Ocean's Eleven", "National Treasure", "The Mummy", "Jurassic World", "Pirates of the Caribbean: The Curse of the Black Pearl"
    ];

    function initializeMovieMixPalette() {
        movieMixGrid.innerHTML = '';
        movieTitles.forEach(title => {
            const movieSwatch = document.createElement('div');
            movieSwatch.className = 'movie-mix-swatch'; // Use dedicated class
            movieSwatch.textContent = title;
            movieSwatch.dataset.title = title; // Store title
            movieSwatch.addEventListener('click', () => selectMovieMix(title, movieSwatch));
            movieMixGrid.appendChild(movieSwatch);
        });
    }

    function selectMovieMix(title, swatch) {
        const index = selectedMoviesMix.indexOf(title);

        if (index > -1) {
            selectedMoviesMix.splice(index, 1);
            swatch.classList.remove('selected');
        } else if (selectedMoviesMix.length < 3) {
            selectedMoviesMix.push(title);
            swatch.classList.add('selected');
        } else {
            alert("You can only select up to 3 movies to mix.");
        }
        updateSelectedMoviesMixDisplay();
        updateMixButtonState('movieMix');
        resetResultArea('movieMix');
    }

    function updateSelectedMoviesMixDisplay() {
        selectedMoviesMixContainer.innerHTML = '';
        selectedMoviesMix.forEach(title => {
            const movieDiv = document.createElement('div');
            movieDiv.className = 'tray-movie-mix'; // Use dedicated class
            movieDiv.textContent = title;
            const removeBtn = createRemoveButton(() => {
                selectMovieMix(title, movieMixGrid.querySelector(`.movie-mix-swatch[data-title="${title}"]`)); // Use movie-mix-swatch selector
            });
            movieDiv.appendChild(removeBtn);
            selectedMoviesMixContainer.appendChild(movieDiv);
        });
    }

    async function mixMoviesMix() {
        if (selectedMoviesMix.length < 2) return;
        const titles = selectedMoviesMix.join(' and ');
        mixedMovieMixPrompt = `Create a movie poster or scene that visually blends the styles, characters, or themes of the following movies: ${titles}. Make it look like a unique crossover concept. High detail, cinematic style.`;

        mixedMovieMixImageUrl = await generateImage(mixedMovieMixPrompt, resultMovieMixDiv, saveMovieMixBtn);
        if (mixedMovieMixImageUrl) {
            saveMovieMixBtn.disabled = false;
            movieMixNameInput.value = '';
        } else {
            saveMovieMixBtn.disabled = true;
        }
    }

    function saveMovieMix() {
         if (!mixedMovieMixImageUrl) return;
        const movieMixName = movieMixNameInput.value.trim() || `Movie Mix #${savedMovieMixes.length + 1}`;
        savedMovieMixes.push({ name: movieMixName, prompt: mixedMovieMixPrompt, imageUrl: mixedMovieMixImageUrl });
        localStorage.setItem('savedMovieMixes', JSON.stringify(savedMovieMixes));
        resetMixingArea('movieMix');
        updateMovieMixGallery();
    }

    function updateMovieMixGallery() {
         movieMixGallery.innerHTML = '';
        if (savedMovieMixes.length === 0) {
            movieMixGallery.innerHTML = '<p class="empty-gallery">Your saved movie mixes will appear here</p>';
            return;
        }
        savedMovieMixes.forEach((savedMovieMix, index) => {
            const movieMixCard = document.createElement('div');
            movieMixCard.className = 'saved-movie-mix-card'; // Use dedicated class
             const movieMixSample = document.createElement('div');
            movieMixSample.className = 'movie-mix-sample'; // Use dedicated class
            if (savedMovieMix.imageUrl) {
                const img = document.createElement('img');
                img.src = savedMovieMix.imageUrl;
                img.alt = savedMovieMix.name;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                 img.style.objectFit = 'contain';
                movieMixSample.appendChild(img);
            } else {
                movieMixSample.textContent = savedMovieMix.prompt || 'No image generated'; // Fallback
            }

            const movieMixInfo = document.createElement('div');
            movieMixInfo.className = 'movie-mix-info'; // Use dedicated class
            const movieMixName = document.createElement('div');
            movieMixName.className = 'movie-mix-name'; // Use dedicated class
            movieMixName.textContent = savedMovieMix.name;
            const deleteBtn = createDeleteButton(() => deleteItem('movieMixes', index));
            movieMixInfo.appendChild(movieMixName);
            movieMixInfo.appendChild(deleteBtn);
            movieMixCard.appendChild(movieMixSample);
            movieMixCard.appendChild(movieMixInfo);
            movieMixGallery.appendChild(movieMixCard);
        });
    }

    function updateMixButtonState(type) {
        if (type === 'color') {
            mixColorsBtn.disabled = selectedColors.length < 2;
        } else if (type === 'animal') {
            mixAnimalsBtn.disabled = selectedAnimals.length < 2;
        } else if (type === 'character') {
            mixCharactersBtn.disabled = selectedCharacters.length < 2;
        } else if (type === 'movieMix') {
            mixMoviesMixBtn.disabled = selectedMoviesMix.length < 2;
        }
    }

    function resetMixingArea(type) {
        if (type === 'color') {
            selectedColors.length = 0;
            document.querySelectorAll('.color-swatch.selected').forEach(swatch => {
                swatch.classList.remove('selected');
            });
            updateSelectedColorsDisplay();
            mixedColor = null;
            resultColorDiv.style.backgroundColor = '';
            resultColorDiv.style.border = '1px dashed #ccc';
            resultColorDiv.innerHTML = 'Mix colors to see the result';
            resultColorDiv.style.color = '#aaa';
            mixColorsBtn.disabled = true;
            saveColorBtn.disabled = true;
            colorNameInput.value = '';
        } else if (type === 'animal') {
            selectedAnimals.length = 0;
            document.querySelectorAll('.animal-swatch.selected').forEach(swatch => {
                swatch.classList.remove('selected');
            });
            updateSelectedAnimalsDisplay();
            mixedAnimalPrompt = null;
            mixedAnimalImageUrl = null;
            resultAnimalDiv.innerHTML = 'Mix animals to see the result';
            resultAnimalDiv.style.fontStyle = 'italic';
            resultAnimalDiv.style.color = '#aaa';
            mixAnimalsBtn.disabled = true;
            saveAnimalBtn.disabled = true;
            animalNameInput.value = '';
        } else if (type === 'character') {
            selectedCharacters.length = 0;
            document.querySelectorAll('.character-swatch.selected').forEach(swatch => {
                swatch.classList.remove('selected');
            });
            updateSelectedCharactersDisplay();
            mixedCharacterPrompt = null;
            mixedCharacterImageUrl = null;
            resultCharacterDiv.innerHTML = 'Mix characters to see the result';
            resultCharacterDiv.style.fontStyle = 'italic';
            resultCharacterDiv.style.color = '#aaa';
            mixCharactersBtn.disabled = true;
            saveCharacterBtn.disabled = true;
            characterNameInput.value = '';
        } else if (type === 'movieMix') {
            selectedMoviesMix.length = 0;
            document.querySelectorAll('.movie-mix-swatch.selected').forEach(swatch => {
                swatch.classList.remove('selected');
            });
            updateSelectedMoviesMixDisplay();
            mixedMovieMixPrompt = null;
            mixedMovieMixImageUrl = null;
            resultMovieMixDiv.innerHTML = 'Mix movie mixes to see the result';
            resultMovieMixDiv.style.fontStyle = 'italic';
            resultMovieMixDiv.style.color = '#aaa';
            mixMoviesMixBtn.disabled = true;
            saveMovieMixBtn.disabled = true;
            movieMixNameInput.value = '';
        }
    }

    function resetResultArea(type) {
        if (type === 'color') {
            mixedColor = null;
            resultColorDiv.style.backgroundColor = '';
            resultColorDiv.style.border = '1px dashed #ccc';
            resultColorDiv.innerHTML = 'Mix colors to see the result';
            resultColorDiv.style.color = '#aaa';
        } else if (type === 'animal') {
            mixedAnimalPrompt = null;
            mixedAnimalImageUrl = null;
            resultAnimalDiv.innerHTML = 'Mix animals to see the result';
            resultAnimalDiv.style.fontStyle = 'italic';
            resultAnimalDiv.style.color = '#aaa';
        } else if (type === 'character') {
            mixedCharacterPrompt = null;
            mixedCharacterImageUrl = null;
            resultCharacterDiv.innerHTML = 'Mix characters to see the result';
            resultCharacterDiv.style.fontStyle = 'italic';
            resultCharacterDiv.style.color = '#aaa';
        } else if (type === 'movieMix') {
            mixedMovieMixPrompt = null;
            mixedMovieMixImageUrl = null;
            resultMovieMixDiv.innerHTML = 'Mix movie mixes to see the result';
            resultMovieMixDiv.style.fontStyle = 'italic';
            resultMovieMixDiv.style.color = '#aaa';
        }
    }

    // Event Listeners
    mixColorsBtn.addEventListener('click', mixColors);
    saveColorBtn.addEventListener('click', saveColor);
    mixAnimalsBtn.addEventListener('click', mixAnimals);
    saveAnimalBtn.addEventListener('click', saveAnimal);
    mixCharactersBtn.addEventListener('click', mixCharacters);
    saveCharacterBtn.addEventListener('click', saveCharacter);
    mixMoviesMixBtn.addEventListener('click', mixMoviesMix);
    saveMovieMixBtn.addEventListener('click', saveMovieMix);

    // Initialize color palette
    initializeColorPalette();
    updateColorGallery();

    // Initialize animal palette
    initializeAnimalPalette();
    updateAnimalGallery();

    // Initialize character palette
    initializeCharacterPalette();
    updateCharacterGallery();

    // Initialize movie mix palette
    initializeMovieMixPalette();
    updateMovieMixGallery();
});