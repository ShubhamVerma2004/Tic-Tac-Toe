    document.addEventListener('DOMContentLoaded', () => {
            // DOM Elements
            const cells = document.querySelectorAll('[data-cell]');
            const board = document.getElementById('game-board');
            const winningMessageElement = document.getElementById('winning-message');
            const winningMessageTextElement = document.getElementById('winning-message-text');
            const restartButton = document.getElementById('restart-btn');
            const newGameButton = document.getElementById('new-game-btn');
            const playAgainButton = document.getElementById('play-again-btn');
            const playerScoreElement = document.getElementById('player-score');
            const computerScoreElement = document.getElementById('computer-score');
            const playerInfoElement = document.getElementById('player-info');
            const computerInfoElement = document.getElementById('computer-info');
            const difficultyButtons = document.querySelectorAll('.difficulty-btn');
            const gamesPlayedElement = document.getElementById('games-played');
            const winRateElement = document.getElementById('win-rate');
            const streakElement = document.getElementById('streak');
            const themeToggle = document.getElementById('theme-toggle');
            const helpBtn = document.getElementById('help-btn');
            const tutorialOverlay = document.getElementById('tutorial-overlay');
            const closeTutorial = document.getElementById('close-tutorial');
            const soundToggle = document.getElementById('sound-toggle');
            const placeSound = document.getElementById('place-sound');
            const winSound = document.getElementById('win-sound');
            const loseSound = document.getElementById('lose-sound');
            const drawSound = document.getElementById('draw-sound');

            // Game Variables
            let isPlayerTurn = true;
            let gameActive = true;
            let playerScore = 0;
            let computerScore = 0;
            let gamesPlayed = 0;
            let playerWins = 0;
            let currentStreak = 0;
            let currentDifficulty = 'easy';
            let moveHistory = [];
            let gameStateHistory = [];
            let soundEnabled = true;
            
            // Symbols
            const PLAYER_SYMBOL = 'x';
            const COMPUTER_SYMBOL = 'circle';
            
            // Winning Combinations
            const WINNING_COMBINATIONS = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];

            // Check for saved preferences
            function loadPreferences() {
                const savedTheme = localStorage.getItem('theme');
                const savedSound = localStorage.getItem('sound');
                
                if (savedTheme === 'light') {
                    document.body.classList.add('light-mode');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                }
                
                if (savedSound === 'off') {
                    soundEnabled = false;
                    soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    soundEnabled = true;
                    soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            }

            // Initialize the game
            function initGame() {
                cells.forEach(cell => {
                    cell.classList.remove(PLAYER_SYMBOL);
                    cell.classList.remove(COMPUTER_SYMBOL);
                    cell.classList.remove('winning-cell');
                    cell.removeEventListener('click', handleCellClick);
                    cell.addEventListener('click', handleCellClick, { once: true });
                });
                
                setBoardHoverClass();
                gameActive = true;
                isPlayerTurn = true;
                updateActivePlayer();
                winningMessageElement.classList.remove('show');
                moveHistory = [];
                gameStateHistory = [getCurrentGameState()];
            }

            // Start a new game (reset scores)
            function newGame() {
                playerScore = 0;
                computerScore = 0;
                gamesPlayed = 0;
                playerWins = 0;
                currentStreak = 0;
                updateScores();
                updateStats();
                initGame();
            }

            // Get current game state
            function getCurrentGameState() {
                return Array.from(cells).map(cell => {
                    if (cell.classList.contains(PLAYER_SYMBOL)) return 'X';
                    if (cell.classList.contains(COMPUTER_SYMBOL)) return 'O';
                    return '';
                });
            }

            // Handle cell click
            function handleCellClick(e) {
                if (!gameActive) return;
                
                const cell = e.target;
                const currentClass = isPlayerTurn ? PLAYER_SYMBOL : COMPUTER_SYMBOL;
                const cellIndex = Array.from(cells).indexOf(cell);
                
                // Record move
                moveHistory.push({
                    player: isPlayerTurn ? 'human' : 'computer',
                    position: cellIndex,
                    difficulty: currentDifficulty,
                    timestamp: new Date().toISOString()
                });
                
                placeMark(cell, currentClass);
                
                // Play sound
                if (soundEnabled) {
                    placeSound.currentTime = 0;
                    placeSound.play().catch(e => console.log("Audio play prevented:", e));
                }
                
                // Check for win or draw
                if (checkWin(currentClass)) {
                    endGame(false);
                } else if (isDraw()) {
                    endGame(true);
                } else {
                    // Switch turns
                    if (isPlayerTurn) {
                        isPlayerTurn = false;
                        updateActivePlayer();
                        
                        // Computer's turn with a delay for better UX
                        if (gameActive) {
                            setTimeout(() => {
                                computerMove();
                            }, 800);
                        }
                    }
                }
                
                // Save game state
                gameStateHistory.push(getCurrentGameState());
            }

            // Place mark on the board
            function placeMark(cell, currentClass) {
                cell.classList.add(currentClass);
            }

            // Switch board hover class based on turn
            function setBoardHoverClass() {
                board.classList.remove(PLAYER_SYMBOL);
                board.classList.remove(COMPUTER_SYMBOL);
                
                if (isPlayerTurn) {
                    board.classList.add(PLAYER_SYMBOL);
                } else {
                    board.classList.add(COMPUTER_SYMBOL);
                }
            }

            // Check for win
            function checkWin(currentClass) {
                return WINNING_COMBINATIONS.some(combination => {
                    return combination.every(index => {
                        return cells[index].classList.contains(currentClass);
                    });
                });
            }

            // Check for draw
            function isDraw() {
                return [...cells].every(cell => {
                    return cell.classList.contains(PLAYER_SYMBOL) || cell.classList.contains(COMPUTER_SYMBOL);
                });
            }

            // End the game
            function endGame(draw) {
                if (!gameActive) return;
                
                gameActive = false;
                gamesPlayed++;
                
                if (draw) {
                    winningMessageTextElement.textContent = 'Quantum Entanglement!';
                    winningMessageTextElement.style.color = 'white';
                    currentStreak = 0;
                    if (soundEnabled) {
                        drawSound.currentTime = 0;
                        drawSound.play().catch(e => console.log("Audio play prevented:", e));
                    }
                } else {
                    if (isPlayerTurn) {
                        winningMessageTextElement.textContent = 'Victory!';
                        winningMessageTextElement.style.color = '#25F4EE';
                        playerScore++;
                        playerWins++;
                        currentStreak++;
                        if (soundEnabled) {
                            winSound.currentTime = 0;
                            winSound.play().catch(e => console.log("Audio play prevented:", e));
                        }
                    } else {
                        winningMessageTextElement.textContent = 'AI Dominates!';
                        winningMessageTextElement.style.color = '#FE2C55';
                        computerScore++;
                        currentStreak = 0;
                        if (soundEnabled) {
                            loseSound.currentTime = 0;
                            loseSound.play().catch(e => console.log("Audio play prevented:", e));
                        }
                    }
                }
                
                updateScores();
                updateStats();
                winningMessageElement.classList.add('show');
                
                // Analytics logging
                logGameResult(draw);
            }

            // Computer's move
            function computerMove() {
                if (!gameActive) return;
                
                let move;
                
                switch (currentDifficulty) {
                    case 'easy':
                        move = getRandomMove();
                        break;
                    case 'medium':
                        // 70% chance to make a smart move, 30% random
                        move = Math.random() < 0.7 ? getSmartMove() : getRandomMove();
                        break;
                    case 'hard':
                        // Always make the best possible move with alpha-beta pruning
                        move = getBestMoveWithABPruning();
                        break;
                    case 'quantum':
                        // Quantum-inspired algorithm with probabilistic moves
                        move = getQuantumMove();
                        break;
                    default:
                        move = getRandomMove();
                }
                
                setTimeout(() => {
                    if (move !== undefined && gameActive) {
                        const cell = cells[move];
                        placeMark(cell, COMPUTER_SYMBOL);
                        
                        // Record move
                        moveHistory.push({
                            player: 'computer',
                            position: move,
                            difficulty: currentDifficulty,
                            timestamp: new Date().toISOString()
                        });
                        
                        if (soundEnabled) {
                            placeSound.currentTime = 0;
                            placeSound.play().catch(e => console.log("Audio play prevented:", e));
                        }
                        
                        if (checkWin(COMPUTER_SYMBOL)) {
                            endGame(false);
                        } else if (isDraw()) {
                            endGame(true);
                        } else {
                            isPlayerTurn = true;
                            updateActivePlayer();
                            setBoardHoverClass();
                        }
                        
                        // Save game state
                        gameStateHistory.push(getCurrentGameState());
                    }
                }, 500);
            }

            // Get a random available move
            function getRandomMove() {
                const availableCells = [...cells].filter(cell => {
                    return !cell.classList.contains(PLAYER_SYMBOL) && !cell.classList.contains(COMPUTER_SYMBOL);
                });
                
                if (availableCells.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableCells.length);
                    return [...cells].indexOf(availableCells[randomIndex]);
                }
                
                return undefined;
            }

            // Get a smart move (blocks player wins or takes winning moves)
            function getSmartMove() {
                // Check for computer win first
                for (let i = 0; i < cells.length; i++) {
                    if (!cells[i].classList.contains(PLAYER_SYMBOL) && !cells[i].classList.contains(COMPUTER_SYMBOL)) {
                        cells[i].classList.add(COMPUTER_SYMBOL);
                        if (checkWin(COMPUTER_SYMBOL)) {
                            cells[i].classList.remove(COMPUTER_SYMBOL);
                            return i;
                        }
                        cells[i].classList.remove(COMPUTER_SYMBOL);
                    }
                }
                
                // Check for player win to block
                for (let i = 0; i < cells.length; i++) {
                    if (!cells[i].classList.contains(PLAYER_SYMBOL) && !cells[i].classList.contains(COMPUTER_SYMBOL)) {
                        cells[i].classList.add(PLAYER_SYMBOL);
                        if (checkWin(PLAYER_SYMBOL)) {
                            cells[i].classList.remove(PLAYER_SYMBOL);
                            return i;
                        }
                        cells[i].classList.remove(PLAYER_SYMBOL);
                    }
                }
                
                // Try to take center if available
                if (!cells[4].classList.contains(PLAYER_SYMBOL) && !cells[4].classList.contains(COMPUTER_SYMBOL)) {
                    return 4;
                }
                
                // Try to take a corner
                const corners = [0, 2, 6, 8];
                const availableCorners = corners.filter(index => {
                    return !cells[index].classList.contains(PLAYER_SYMBOL) && !cells[index].classList.contains(COMPUTER_SYMBOL);
                });
                
                if (availableCorners.length > 0) {
                    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
                }
                
                // Take any available cell
                return getRandomMove();
            }

            // Minimax algorithm with Alpha-Beta pruning
            function getBestMoveWithABPruning() {
                let bestScore = -Infinity;
                let bestMove;
                let alpha = -Infinity;
                let beta = Infinity;
                
                for (let i = 0; i < cells.length; i++) {
                    if (!cells[i].classList.contains(PLAYER_SYMBOL) && !cells[i].classList.contains(COMPUTER_SYMBOL)) {
                        cells[i].classList.add(COMPUTER_SYMBOL);
                        const score = minimaxAB(cells, 0, false, alpha, beta);
                        cells[i].classList.remove(COMPUTER_SYMBOL);
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = i;
                            alpha = Math.max(alpha, bestScore);
                            if (beta <= alpha) break; // Alpha-beta pruning
                        }
                    }
                }
                
                return bestMove;
            }

            // Minimax with Alpha-Beta pruning helper
            function minimaxAB(board, depth, isMaximizing, alpha, beta) {
                const boardState = Array.from(board).map(cell => {
                    if (cell.classList.contains(PLAYER_SYMBOL)) return 'X';
                    if (cell.classList.contains(COMPUTER_SYMBOL)) return 'O';
                    return '';
                });
                
                // Terminal states
                if (checkWin(COMPUTER_SYMBOL)) return 10 - depth;
                if (checkWin(PLAYER_SYMBOL)) return depth - 10;
                if (isDraw()) return 0;
                
                if (isMaximizing) {
                    let bestScore = -Infinity;
                    for (let i = 0; i < boardState.length; i++) {
                        if (boardState[i] === '') {
                            board[i].classList.add(COMPUTER_SYMBOL);
                            const score = minimaxAB(board, depth + 1, false, alpha, beta);
                            board[i].classList.remove(COMPUTER_SYMBOL);
                            bestScore = Math.max(score, bestScore);
                            alpha = Math.max(alpha, bestScore);
                            if (beta <= alpha) break; // Prune
                        }
                    }
                    return bestScore;
                } else {
                    let bestScore = Infinity;
                    for (let i = 0; i < boardState.length; i++) {
                        if (boardState[i] === '') {
                            board[i].classList.add(PLAYER_SYMBOL);
                            const score = minimaxAB(board, depth + 1, true, alpha, beta);
                            board[i].classList.remove(PLAYER_SYMBOL);
                            bestScore = Math.min(score, bestScore);
                            beta = Math.min(beta, bestScore);
                            if (beta <= alpha) break; // Prune
                        }
                    }
                    return bestScore;
                }
            }

            // Quantum-inspired move algorithm
            function getQuantumMove() {
                // 10% chance to make a random move (quantum uncertainty)
                if (Math.random() < 0.1) {
                    return getRandomMove();
                }
                
                // Otherwise use a combination of strategies
                const strategies = [
                    () => getBestMoveWithABPruning(), // Optimal move
                    () => getSmartMove(), // Smart but not perfect
                    () => { // Pattern-based moves
                        const patterns = [
                            // Fork opportunities
                            [[0,1,2], [0,3,6]], [[0,1,2], [2,5,8]],
                            [[6,7,8], [0,3,6]], [[6,7,8], [2,5,8]],
                            [[0,4,8], [2,4,6]]
                        ];
                        
                        for (const pattern of patterns) {
                            const [combo1, combo2] = pattern;
                            const intersection = combo1.filter(x => combo2.includes(x));
                            if (intersection.length > 0) {
                                const pos = intersection[0];
                                if (!cells[pos].classList.contains(PLAYER_SYMBOL) && 
                                    !cells[pos].classList.contains(COMPUTER_SYMBOL)) {
                                    return pos;
                                }
                            }
                        }
                        return null;
                    }
                ];
                
                // Try each strategy in order
                for (const strategy of strategies) {
                    const move = strategy();
                    if (move !== null && move !== undefined) {
                        return move;
                    }
                }
                
                // Fallback to random if no strategy worked
                return getRandomMove();
            }

            // Update scores display
            function updateScores() {
                playerScoreElement.textContent = playerScore;
                computerScoreElement.textContent = computerScore;
            }

            // Update game statistics
            function updateStats() {
                gamesPlayedElement.textContent = gamesPlayed;
                const winRate = gamesPlayed > 0 ? Math.round((playerWins / gamesPlayed) * 100) : 0;
                winRateElement.textContent = `${winRate}%`;
                streakElement.textContent = currentStreak;
            }

            // Update active player indicator
            function updateActivePlayer() {
                if (isPlayerTurn) {
                    playerInfoElement.classList.add('active');
                    computerInfoElement.classList.remove('active');
                } else {
                    playerInfoElement.classList.remove('active');
                    computerInfoElement.classList.add('active');
                }
                setBoardHoverClass();
            }

            // Log game result for analytics
            function logGameResult(draw) {
                const result = {
                    timestamp: new Date().toISOString(),
                    difficulty: currentDifficulty,
                    result: draw ? 'draw' : (isPlayerTurn ? 'win' : 'loss'),
                    moves: moveHistory,
                    gameStates: gameStateHistory,
                    duration: moveHistory.length > 0 ? 
                        new Date(moveHistory[moveHistory.length-1].timestamp) - new Date(moveHistory[0].timestamp) : 0
                };
                
                // In a real app, you would send this to a server
                console.log('Game result:', result);
            }

            // Toggle theme
            function toggleTheme() {
                document.body.classList.toggle('light-mode');
                const isLight = document.body.classList.contains('light-mode');
                
                if (isLight) {
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                    localStorage.setItem('theme', 'light');
                } else {
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                    localStorage.setItem('theme', 'dark');
                }
            }

            // Toggle sound
            function toggleSound() {
                soundEnabled = !soundEnabled;
                
                if (soundEnabled) {
                    soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    localStorage.setItem('sound', 'on');
                    
                    // Play a test sound to confirm
                    placeSound.currentTime = 0;
                    placeSound.play().catch(e => console.log("Audio test prevented:", e));
                } else {
                    soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    localStorage.setItem('sound', 'off');
                }
            }

            // Show tutorial
            function showTutorial() {
                tutorialOverlay.classList.add('show');
            }

            // Hide tutorial
            function hideTutorial() {
                tutorialOverlay.classList.remove('show');
            }

            // Event Listeners
            restartButton.addEventListener('click', initGame);
            newGameButton.addEventListener('click', newGame);
            playAgainButton.addEventListener('click', initGame);
            themeToggle.addEventListener('click', toggleTheme);
            soundToggle.addEventListener('click', toggleSound);
            helpBtn.addEventListener('click', showTutorial);
            closeTutorial.addEventListener('click', hideTutorial);
            
            difficultyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    difficultyButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    currentDifficulty = button.dataset.difficulty;
                    
                    // If it's computer's turn when difficulty changes, make a move
                    if (!isPlayerTurn && gameActive) {
                        setTimeout(() => {
                            computerMove();
                        }, 500);
                    }
                });
            });

            // Close tutorial when clicking outside
            tutorialOverlay.addEventListener('click', (e) => {
                if (e.target === tutorialOverlay) {
                    hideTutorial();
                }
            });

            // Load preferences and start the game
            loadPreferences();
            
            // Initialize audio elements
            [placeSound, winSound, loseSound, drawSound].forEach(audio => {
                audio.load();
            });
            
            initGame();
        });