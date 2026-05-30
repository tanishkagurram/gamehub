<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gen Z Vibe Check Treasure Hunt</title>
    <!-- Load Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom styles for aesthetic */
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #1f2937 0%, #0f172a 100%);
            color: #f3f4f6;
            min-height: 100vh;
        }
        .game-card {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            border: 2px solid #4f46e5;
            animation: fadeIn 0.8s ease-out;
        }
        .btn-primary {
            transition: all 0.2s ease-in-out;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.5);
        }
        .trap-text {
            color: #f87171;
            font-weight: 700;
            animation: shake 0.5s;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    </style>
</head>
<body class="flex items-center justify-center p-4">

    <div id="gameContainer" class="game-card bg-gray-800 p-8 rounded-xl w-full max-w-lg text-center">
        <!-- Game Content will be injected here -->
    </div>

    <script>
        // --- GAME LOGIC ---

        // Helper function for exponential backoff retry (not strictly needed for this simple game, but good practice for API calls)
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        // Game state variables
        let currentStage = 0;
        const stages = [
            {
                prompt: "Welcome to the Vibe Check Treasure Hunt. The treasure is a fat stack of digital clout. Are you ready to proceed? (No cap.)",
                meme: "✨",
                choices: [
                    { text: "Bet, I'm ready", target: 1 },
                    { text: "I'm good, thanks", target: 'trap_quit' }
                ]
            },
            {
                prompt: "Stage 1: The Meme Maze. You see two doors. One has 'Cheugy Vibes' and the other has 'Main Character Energy'. Which one is the right path?",
                meme: "🚪",
                choices: [
                    { text: "Cheugy Vibes (Left)", target: 'trap_cheugy' },
                    { text: "Main Character Energy (Right)", target: 2 }
                ]
            },
            {
                prompt: "Stage 2: The Social Media Scroll. Your feed is stuck. To unlock the next path, what is the official Gen Z response to something painfully awkward or cringe?",
                meme: "💀",
                choices: [
                    { text: "That's Awkward!", target: 'trap_old' },
                    { text: "I'm screaming 😭", target: 3 },
                    { text: "Hard Pass", target: 'trap_hardpass' }
                ]
            },
            {
                prompt: "Stage 3: The Coffee Trap. You've earned a break. A barista asks for your order. What's the only acceptable drink order that proves you are, in fact, the final boss?",
                meme: "☕️",
                choices: [
                    { text: "Black Coffee", target: 'trap_boomer' },
                    { text: "Water, no ice.", target: 4 }, // The ultimate subtle flex/joke
                    { text: "A Pumpkin Spice Latte", target: 'trap_psl' }
                ]
            },
            {
                prompt: "Final Stage: The Treasure! You have successfully passed the Vibe Check and achieved peak Main Character status. Your digital clout score is 10/10. You win!",
                meme: "🏆",
                choices: [
                    { text: "Claim your clout (Start Over)", target: 0 }
                ]
            }
        ];

        // Trap definitions
        const traps = {
            'trap_quit': {
                prompt: "Trap! Sike. You thought you could just leave? That's not the assignment. Restart the game and commit to the grind. Your vibe check failed.",
                meme: "❌",
                color: "bg-red-600",
                button: "Try Again (Drip Check)",
                target: 0
            },
            'trap_cheugy': {
                prompt: "Trap! Oof. Picking 'Cheugy Vibes' automatically fails the challenge. That's a huge L. Your reward is hearing a 10-hour loop of the 'Baby Shark' song. Sorry, not sorry.",
                meme: "🦈",
                color: "bg-yellow-600",
                button: "Restart the Mission",
                target: 0
            },
            'trap_old': {
                prompt: "Trap! That's what your dad says. The correct answer was a mix of intense laughter and crying emojis. You're giving major boomer energy right now. This is awkward.",
                meme: "👴",
                color: "bg-red-700",
                button: "Vibe Check Redo",
                target: 0
            },
            'trap_psl': {
                prompt: "Trap! PSL is so basic. You're doing too much. The real flex is minimal effort. You are now required to film a perfectly choreographed TikTok dance.",
                meme: "💃",
                color: "bg-pink-600",
                button: "Not Me (Restart)",
                target: 0
            },
            'trap_hardpass': {
                prompt: "Trap! 'Hard Pass' is acceptable, but it's not the *official* cringe response. The trap is a mandatory 3-hour phone call with a telemarketer about their extended warranty.",
                meme: "📞",
                color: "bg-red-500",
                button: "Escape the Call (Restart)",
                target: 0
            },
            'trap_boomer': {
                prompt: "Trap! Black coffee? You're acting like you have responsibilities. Gen Z knows how to maximize minimal effort. Go sit in the corner and reflect on your life choices.",
                meme: "🛋️",
                color: "bg-gray-700",
                button: "I'm Better Than This (Restart)",
                target: 0
            }
        };

        const gameContainer = document.getElementById('gameContainer');

        // Function to render the current stage or trap
        function render(id) {
            gameContainer.innerHTML = ''; // Clear previous content
            
            let data, isTrap = false;
            
            if (typeof id === 'number') {
                data = stages[id];
            } else if (typeof id === 'string' && id.startsWith('trap_')) {
                data = traps[id];
                isTrap = true;
            } else {
                console.error("Invalid stage ID.");
                return;
            }

            const cardClasses = isTrap ? `bg-red-900 border-red-400 p-8 rounded-xl w-full max-w-lg text-center game-card ${data.color}` : 'bg-gray-800 p-8 rounded-xl w-full max-w-lg text-center game-card';

            const newContent = document.createElement('div');
            newContent.className = cardClasses;
            newContent.innerHTML = `
                <div class="text-6xl mb-6 animate-pulse">${data.meme}</div>
                <h1 class="text-3xl font-extrabold mb-4 ${isTrap ? 'trap-text' : 'text-indigo-400'}">${isTrap ? 'TRAP ALERT! (Major L)' : `Stage ${currentStage + 1} Vibe Check`}</h1>
                <p class="text-xl mb-8 leading-relaxed">${data.prompt}</p>
                <div id="choices" class="space-y-4">
                    <!-- Buttons go here -->
                </div>
            `;
            
            gameContainer.appendChild(newContent);
            
            const choicesContainer = document.getElementById('choices');
            
            // If it's a trap, only show one button to restart
            if (isTrap) {
                const button = document.createElement('button');
                button.className = 'w-full py-3 px-6 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold btn-primary focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50';
                button.textContent = data.button;
                button.onclick = () => { currentStage = data.target; render(currentStage); };
                choicesContainer.appendChild(button);
                return;
            }

            // If it's a regular stage, show all choices
            data.choices.forEach(choice => {
                const button = document.createElement('button');
                button.className = 'w-full py-3 px-6 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold btn-primary focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50';
                button.textContent = choice.text;
                button.onclick = () => handleChoice(choice.target);
                choicesContainer.appendChild(button);
            });
        }

        // Function to handle button clicks
        function handleChoice(target) {
            if (typeof target === 'number') {
                // Successful move to the next stage
                currentStage = target;
                render(currentStage);
            } else if (typeof target === 'string' && target.startsWith('trap_')) {
                // Hit a trap
                render(target);
            } else {
                console.error("Unknown target.");
            }
        }

        // Initialize the game
        document.addEventListener('DOMContentLoaded', () => {
            render(currentStage);
        });

    </script>
</body>
</html>