// Dados do jogo - Frases com lacunas e palavras
const gameData = [
    {
        phrase: "A Inteligência Artificial é um ramo da ciência que estuda a criação de sistemas computacionais.",
        blanks: [1], // índice do blank na frase
        correct: ["Inteligência"]
    },
    {
        phrase: "As redes neurais artificiais são inspiradas no funcionamento do cérebro humano.",
        blanks: [1],
        correct: ["cérebro"]
    },
    {
        phrase: "O aprendizado de máquina permite que computadores melhorem o desempenho através de experiência.",
        blanks: [1],
        correct: ["experiência"]
    },
    {
        phrase: "Os algoritmos de Deep Learning usam múltiplas camadas para processar informações.",
        blanks: [1],
        correct: ["camadas"]
    },
    {
        phrase: "A ética em IA é fundamental para garantir o uso responsável da tecnologia.",
        blanks: [1],
        correct: ["responsável"]
    },
    {
        phrase: "Os modelos de linguagem usam redes neurais para processar e gerar texto.",
        blanks: [1],
        correct: ["linguagem"]
    }
];

// Variáveis globais
let allWords = [];
let draggedWord = null;
let currentBlank = null;
let gameState = {};

// Inicializar o jogo
function initGame() {
    // Coletar todas as palavras corretas e misturar
    allWords = [];
    gameData.forEach(item => {
        allWords.push(...item.correct);
    });
    
    // Adicionar palavras distraidoras
    const distractors = [
        "dados", "código", "internet", "software", "hardware", "banco", 
        "servidor", "cliente", "rede", "computador", "pixel", "tela",
        "mouse", "teclado", "monitor", "processador", "memória", "energia"
    ];
    
    // Embaralhar palavras distraidoras e adicionar algumas
    allWords.push(...distractors.sort(() => Math.random() - 0.5).slice(0, 6));
    
    // Embaralhar todas as palavras
    allWords = allWords.sort(() => Math.random() - 0.5);
    
    // Inicializar estado do jogo
    gameState = {};
    
    // Renderizar frases
    renderPhrases();
    
    // Renderizar palavras
    renderWords();
    
    // Atualizar placar
    updateScore();
}

// Renderizar as frases com lacunas
function renderPhrases() {
    const phrasesContainer = document.getElementById('phrasesContainer');
    phrasesContainer.innerHTML = '';
    
    gameData.forEach((item, index) => {
        const phraseDiv = document.createElement('div');
        phraseDiv.className = 'phrase';
        phraseDiv.id = `phrase-${index}`;
        
        const phraseText = item.phrase.split(' ');
        const p = document.createElement('p');
        
        let wordIndex = 0;
        phraseText.forEach((word, textIndex) => {
            // Procurar se há um blank aqui
            if (item.blanks.includes(wordIndex)) {
                const blank = document.createElement('div');
                blank.className = 'blank';
                blank.id = `blank-${index}-${wordIndex}`;
                blank.draggable = false;
                blank.innerHTML = 'Arraste uma palavra';
                blank.dataset.phraseIndex = index;
                blank.dataset.blankIndex = wordIndex;
                blank.dataset.correct = item.correct[item.blanks.indexOf(wordIndex)];
                
                blank.addEventListener('dragover', handleDragOver);
                blank.addEventListener('drop', handleDrop);
                blank.addEventListener('click', handleBlankClick);
                
                p.appendChild(blank);
                
                // Espaço após o blank
                const space = document.createTextNode(' ');
                p.appendChild(space);
            } else {
                const span = document.createElement('span');
                span.textContent = word + ' ';
                p.appendChild(span);
            }
            
            wordIndex++;
        });
        
        phraseDiv.appendChild(p);
        phrasesContainer.appendChild(phraseDiv);
    });
}

// Renderizar palavras disponíveis
function renderWords() {
    const wordsList = document.getElementById('wordsList');
    wordsList.innerHTML = '';
    
    allWords.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-item';
        wordDiv.id = `word-${index}`;
        wordDiv.draggable = true;
        wordDiv.textContent = word;
        wordDiv.dataset.word = word;
        
        // Verificar se a palavra já foi usada
        if (isWordUsed(word)) {
            wordDiv.classList.add('used');
            wordDiv.draggable = false;
        }
        
        wordDiv.addEventListener('dragstart', handleDragStart);
        wordDiv.addEventListener('dragend', handleDragEnd);
        
        wordsList.appendChild(wordDiv);
    });
}

// Verificar se uma palavra já foi usada
function isWordUsed(word) {
    return Object.values(gameState).some(state => state.word === word);
}

// Handlers de Drag and Drop
function handleDragStart(e) {
    draggedWord = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.target.style.transform = 'scale(1.05)';
}

function handleDrop(e) {
    e.preventDefault();
    e.target.style.transform = 'scale(1)';
    
    if (!draggedWord) return;
    
    const blank = e.target.closest('.blank');
    if (!blank) return;
    
    const phraseIndex = blank.dataset.phraseIndex;
    const blankIndex = blank.dataset.blankIndex;
    const correctWord = blank.dataset.correct;
    const word = draggedWord.dataset.word;
    
    // Limpar blank anterior se houver
    if (gameState[`${phraseIndex}-${blankIndex}`]) {
        delete gameState[`${phraseIndex}-${blankIndex}`];
    }
    
    // Adicionar palavra ao blank
    gameState[`${phraseIndex}-${blankIndex}`] = {
        word: word,
        correct: correctWord,
        isCorrect: word === correctWord
    };
    
    // Atualizar visual do blank
    blank.textContent = word;
    blank.classList.add('filled');
    if (word !== correctWord) {
        blank.classList.add('incorrect');
    } else {
        blank.classList.remove('incorrect');
    }
    
    // Atualizar palavras
    renderWords();
    updateScore();
}

// Limpar um blank ao clicá-lo
function handleBlankClick(e) {
    const blank = e.target;
    const phraseIndex = blank.dataset.phraseIndex;
    const blankIndex = blank.dataset.blankIndex;
    
    if (gameState[`${phraseIndex}-${blankIndex}`]) {
        delete gameState[`${phraseIndex}-${blankIndex}`];
        blank.textContent = 'Arraste uma palavra';
        blank.classList.remove('filled', 'incorrect');
        renderWords();
        updateScore();
    }
}

// Atualizar placar
function updateScore() {
    const totalBlanks = gameData.reduce((sum, item) => sum + item.blanks.length, 0);
    const correctCount = Object.values(gameState).filter(state => state.isCorrect).length;
    
    document.getElementById('score').textContent = `Acertos: ${correctCount} / ${totalBlanks}`;
}

// Verificar respostas
function checkAnswers() {
    const totalBlanks = gameData.reduce((sum, item) => sum + item.blanks.length, 0);
    const correctCount = Object.values(gameState).filter(state => state.isCorrect).length;
    const filledCount = Object.keys(gameState).length;
    
    const resultMessage = document.getElementById('resultMessage');
    
    if (filledCount === 0) {
        resultMessage.textContent = '⚠️ Preencha pelo menos uma frase!';
        resultMessage.className = 'result-message show error';
        return;
    }
    
    if (filledCount !== totalBlanks) {
        resultMessage.textContent = `⚠️ Você preencheu ${filledCount} de ${totalBlanks} lacunas. Complete todas!`;
        resultMessage.className = 'result-message show partial';
        return;
    }
    
    if (correctCount === totalBlanks) {
        resultMessage.textContent = '🎉 Parabéns! Você acertou todas as frases!';
        resultMessage.className = 'result-message show success';
    } else {
        resultMessage.textContent = `❌ Nem tudo está correto. Você acertou ${correctCount} de ${totalBlanks}. Tente novamente!`;
        resultMessage.className = 'result-message show error';
    }
}

// Resetar jogo
function resetGame() {
    gameState = {};
    document.getElementById('resultMessage').className = 'result-message';
    document.getElementById('resultMessage').textContent = '';
    
    // Limpar todos os blanks
    document.querySelectorAll('.blank').forEach(blank => {
        blank.textContent = 'Arraste uma palavra';
        blank.classList.remove('filled', 'incorrect');
    });
    
    renderWords();
    updateScore();
}

// Event Listeners dos Botões
document.getElementById('checkBtn').addEventListener('click', checkAnswers);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Inicializar jogo ao carregar a página
window.addEventListener('load', initGame);

// Prevenir comportamento padrão de drag and drop em alguns elementos
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});
