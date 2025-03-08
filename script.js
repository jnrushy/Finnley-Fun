import config from './config.js';

// Pet responses and personalities
const petResponses = {
    dog: {
        greetings: ["Woof! Hi friend!", "*Tail wagging intensifies*", "Ruff ruff! Let's play!"],
        happy: ["*Happy bouncing*", "I love you too!", "Can we play fetch?", "You're my best friend!"],
        confused: ["*Tilts head*", "Bork?", "Do you have treats?"],
        default: ["Woof woof!", "*Playful bark*", "*Licks face*"],
        smart: ["*Puts on tiny glasses* Let me help!", "I learned this in puppy school!", "Oh! Oh! I know this one!"]
    },
    cat: {
        greetings: ["Meow~", "*Purring*", "*Rubs against leg*"],
        happy: ["Purrrrr...", "*Happy cat noises*", "Meow meow!", "*Kneads paws*"],
        confused: ["Mrrp?", "*Flicks tail*", "*Squints eyes*"],
        default: ["Meow!", "*Stretches*", "*Grooms paw*"],
        smart: ["*Looks wise* Meow, let me explain...", "*Sits regally* As a cat, I know this:", "Watch and learn, human!"]
    },
    bunny: {
        greetings: ["*Nose twitches*", "*Hoppy bounces*", "*Curious peek*"],
        happy: ["*Happy binky*", "*Gentle purring*", "*Flops over happily*"],
        confused: ["*Perked ears*", "*Head tilt*", "*Curious hop*"],
        default: ["*Munches carrot*", "*Gentle hop*", "*Wiggles nose*"],
        smart: ["*Adjusts tiny carrot glasses* Oh! I know!", "*Twitches nose thoughtfully* Let me think...", "*Stands on hind legs* I can help with this!"]
    }
};

// Pet images (using emojis for now, can be replaced with actual images)
const petImages = {
    dog: "🐕",
    cat: "🐱",
    bunny: "🐰"
};

let selectedPet = null;
let speechSynthesis = window.speechSynthesis;

// Expand knowledge base with more fun facts
const knowledgeBase = {
    // Geography questions
    "capital of france": "Paris is the city of light and love, where the Eiffel Tower stands tall and proud!",
    "capital of japan": "Tokyo is a magical mix of old and new, where ancient temples meet neon lights!",
    "capital of australia": "Canberra is Australia's capital city, where kangaroos sometimes hop through the streets!",
    "capital of california": "Sacramento is California's capital city, though many people think it's Los Angeles or San Francisco!",
    "largest ocean": "The Pacific Ocean is so huge, you could fit all the continents inside it and still have room for more!",
    "longest river": "The mighty Nile River flows through Africa like a giant water snake, bringing life to the desert!",
    
    // Animal facts
    "what is a giraffe": "Giraffes are like living skyscrapers with spots! Their long necks help them munch on yummy tree leaves!",
    "what is a dolphin": "Dolphins are the acrobats of the ocean! They're super smart and love to play and do flips in the waves!",
    "what is a penguin": "Penguins are like little waiters in tuxedos who love to swim and slide on their bellies in the snow!",
    "what is an elephant": "Elephants are gentle giants with amazing memory! Their trunks are like a built-in water hose and snorkel!",
    "fastest animal": "The cheetah is the fastest animal on land! It can run as fast as a car on the highway - zoom zoom! 🐆",
    "biggest animal": "The blue whale is the biggest animal ever! It's so big, its heart is as big as a car! 🐋",
    "smallest animal": "The tiny bumblebee bat is one of the smallest mammals - it's as small as your thumb! 🦇",
    
    // Space facts
    "what is the sun": "The Sun is like a giant ball of fire in space, giving us light and warmth every day!",
    "what is the moon": "The Moon is Earth's best friend in space, making our oceans dance with tides!",
    "what are stars": "Stars are like tiny night-lights in space, twinkling like diamonds in the dark sky!",
    "biggest planet": "Jupiter is the biggest planet! It's so big, you could fit 1,000 Earths inside it! 🌟",
    "closest planet to sun": "Mercury is the closest planet to the Sun - it's super hot there! 🔥",
    
    // Fun science
    "why is the sky blue": "The sky is blue because sunlight plays a game of bounce with tiny air particles, and blue wins the game!",
    "how do rainbows form": "Rainbows appear when sunlight and raindrops have a dance party, splitting white light into beautiful colors!",
    "why do birds fly": "Birds fly by flapping their wings like nature's airplanes, using air to push themselves up into the sky!",
    "why do cats purr": "Cats purr because they're happy and relaxed - it's like their way of smiling! 😺",
    "why do dogs wag tails": "Dogs wag their tails to show they're happy - it's like they're saying 'I'm so excited to see you!' 🐕",
    
    // More geography
    "largest desert": "The Sahara Desert is super hot and sandy, but Antarctica is actually the biggest desert because it's so dry!",
    "deepest ocean": "The Mariana Trench is like an underwater Grand Canyon, so deep you could stack 13 Mount Everests inside!",
    "largest country": "Russia is so big, it stretches across two continents and has 11 different time zones!",
    "smallest country": "Vatican City is like a tiny kingdom inside Rome, smaller than most shopping malls!",
    "tallest mountain": "Mount Everest is the tallest mountain - it's so high that clouds have to go around it! ⛰️",
    
    // Math (keep these simple)
    "2+2": "4! Easy peasy! ✨",
    "5+3": "8! You're great at math! 🌟",
    "10-5": "5! High five! ✋",
    "4*3": "12! You're multiplying like a pro! 🎯",
    "8/2": "4! Division is fun! 🎈",
    
    // Fun facts
    "how many colors in rainbow": "There are 7 magical colors in a rainbow: Red, Orange, Yellow, Green, Blue, Indigo, and Violet! 🌈",
    "why do leaves change color": "Leaves change color in fall because they're putting on a beautiful goodbye show before winter! 🍁",
    "how do plants grow": "Plants grow by drinking water, eating sunlight, and breathing air - they're nature's magic trick! 🌱",
    "why is water wet": "Water is wet because its tiny molecules love to stick together and play - like tiny best friends! 💧",
    "how do fish breathe": "Fish breathe underwater using special gills - it's like having tiny underwater snorkels! 🐠"
};

// Function to get AI response for unknown questions
async function getAIResponse(question) {
    try {
        if (!config.HUGGING_FACE_API_KEY || config.HUGGING_FACE_API_KEY.includes('replace')) {
            console.log('No valid API key found');
            return null;
        }

        console.log('Attempting to send question to Hugging Face:', question);
        console.log('Using API key:', config.HUGGING_FACE_API_KEY.substring(0, 8) + '...');
        
        // Format the question to get a more natural response
        const formattedQuestion = `Answer this question in a fun and friendly way for kids: ${question}`;
        
        const response = await fetch(config.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.HUGGING_FACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: formattedQuestion,
                parameters: {
                    max_length: 100,
                    temperature: 0.8,
                    top_p: 0.9,
                    do_sample: true
                }
            })
        });

        if (!response.ok) {
            console.log(`API Response not ok: ${response.status}`);
            console.log('Response headers:', Object.fromEntries([...response.headers]));
            const errorText = await response.text();
            console.log('Error details:', errorText);
            return null;
        }

        const data = await response.json();
        console.log('AI Response:', data);

        // Handle the response format correctly
        if (Array.isArray(data) && data[0] && data[0].generated_text) {
            let aiResponse = data[0].generated_text;
            
            // Make the response more fun and child-friendly
            aiResponse = aiResponse
                .replace(/\.$/, '!') // Replace ending period with exclamation
                .replace(/\?$/, '?!') // Make questions more excited
                .replace(/^the /i, '') // Remove leading "the" if present
                .trim();
            
            // Add fun facts and embellishments based on keywords
            if (aiResponse.toLowerCase().includes('fast')) {
                aiResponse += ' Zoom zoom! 🏃';
            }
            if (aiResponse.toLowerCase().includes('animal')) {
                aiResponse += ' 🐾';
            }
            if (aiResponse.toLowerCase().includes('bird')) {
                aiResponse += ' Tweet tweet! 🐦';
            }
            if (aiResponse.toLowerCase().includes('water')) {
                aiResponse += ' Splash! 💦';
            }
            if (aiResponse.toLowerCase().includes('big')) {
                aiResponse += ' Wow, that\'s huge! 🌟';
            }
            
            // Add general enthusiasm
            if (!aiResponse.endsWith('!') && !aiResponse.endsWith('?!')) {
                aiResponse += '!';
            }
            
            // Add random fun emoji if none were added
            if (!aiResponse.includes('')) {
                const funEmojis = ['✨', '🌈', '🎈', '🌟', '💫', '🎉'];
                aiResponse += ' ' + funEmojis[Math.floor(Math.random() * funEmojis.length)];
            }
            
            return aiResponse;
        }
        return null;
    } catch (error) {
        console.error('AI Response Error:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return null;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const petButtons = document.querySelectorAll('.pet-button');
    const sendButton = document.getElementById('send-message');
    const speakButton = document.getElementById('speak-message');
    const userInput = document.getElementById('user-message');
    const petAvatar = document.getElementById('pet-avatar');
    const speechBubble = document.getElementById('pet-speech-bubble');

    // Pet selection
    petButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedPet = button.dataset.pet;
            petButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            
            // Update pet avatar
            petAvatar.textContent = petImages[selectedPet];
            petAvatar.classList.add('bounce');
            setTimeout(() => petAvatar.classList.remove('bounce'), 1000);

            // Welcome message
            const greeting = getRandomResponse(selectedPet, 'greetings');
            showPetResponse(greeting);
        });
    });

    // Send message
    sendButton.addEventListener('click', () => handleMessage());
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleMessage();
    });

    // Speak message
    speakButton.addEventListener('click', () => {
        const bubbleText = speechBubble.textContent;
        if (bubbleText && !speechBubble.classList.contains('hidden')) {
            speak(bubbleText);
        }
    });
});

// Update handleMessage function to work with knowledge base
async function handleMessage() {
    const userInput = document.getElementById('user-message');
    const message = userInput.value.trim().toLowerCase();

    if (!selectedPet) {
        showPetResponse("Please select a pet first!");
        return;
    }

    if (message) {
        const repeatMessage = `You said: "${message}"\n\n`;
        
        let response = "";
        const smartIntro = getRandomResponse(selectedPet, 'smart');
        
        try {
            if (message.match(/^[0-9+\-*/\s]+$/)) {
                try {
                    const result = eval(message);
                    response = `${smartIntro}\n${message} = ${result}`;
                } catch {
                    response = getRandomResponse(selectedPet, 'confused');
                }
            }
            else if (message.includes("what") || message.includes("where") || message.includes("how") || message.includes("why") || message.includes("?")) {
                let cleanQuestion = message
                    .replace(/what is|what's|where is|where's|how|why|is|the|tell|me|can|you|please|\?/g, '')
                    .trim();
                
                // Try to find the answer in our knowledge base
                let found = false;
                for (let key in knowledgeBase) {
                    if (message.includes(key) || key.includes(cleanQuestion)) {
                        response = `${smartIntro}\n${knowledgeBase[key]}`;
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    // Fun fallback responses based on question type
                    if (message.includes('how many') || message.includes('how far') || message.includes('how long')) {
                        response = `${smartIntro}\nThat's a great counting question! Let's use our imagination to figure it out together! 🎯`;
                    } else if (message.includes('why')) {
                        response = `${smartIntro}\nThat's such a thoughtful question! I love wondering about things too! 🤔`;
                    } else if (message.includes('where')) {
                        response = `${smartIntro}\nOh, what an adventure it would be to find that place! I love exploring! 🗺️`;
                    } else if (message.includes('what')) {
                        response = `${smartIntro}\nThat's something fun to learn about! Let's discover it together! ✨`;
                    } else if (message.includes('how')) {
                        response = `${smartIntro}\nThat's a great question! I bet we could figure it out with some creativity! 🌟`;
                    } else {
                        const dontKnowResponses = [
                            "That's a super interesting question! Let's learn about it together! 🎈",
                            "Wow, you're really curious! I love how you think about cool things! ✨",
                            "What a great question! I bet we could find the answer in a book! 📚",
                            "That's a tricky one, but I love how you're always asking such clever questions! 🌟"
                        ];
                        response = `${smartIntro}\n${dontKnowResponses[Math.floor(Math.random() * dontKnowResponses.length)]}`;
                    }
                }
            } else {
                let responseType = 'default';
                if (message.includes('love') || message.includes('good')) {
                    responseType = 'happy';
                }
                response = getRandomResponse(selectedPet, responseType);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            response = `${getRandomResponse(selectedPet, 'confused')} (Oops, my brain got a little tangled!)`;
        }

        showPetResponse(repeatMessage + response);
        userInput.value = '';

        const petAvatar = document.getElementById('pet-avatar');
        petAvatar.classList.add('bounce');
        setTimeout(() => petAvatar.classList.remove('bounce'), 1000);
    }
}

// Get random response based on pet type and response category
function getRandomResponse(petType, responseType) {
    const responses = petResponses[petType][responseType];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Show pet's response in speech bubble
function showPetResponse(response) {
    const speechBubble = document.getElementById('pet-speech-bubble');
    speechBubble.textContent = response;
    speechBubble.classList.remove('hidden');
}

// Text-to-speech function
function speak(text) {
    // Stop any ongoing speech
    speechSynthesis.cancel();

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Adjust voice settings based on pet type
    utterance.pitch = selectedPet === 'dog' ? 1.5 : 
                      selectedPet === 'cat' ? 1.2 : 1.8;
    utterance.rate = selectedPet === 'bunny' ? 1.2 : 1;
    
    // Speak the text
    speechSynthesis.speak(utterance);
}
