// Escucha cuando el contenido del documento HTML ha sido completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    const players = []; // Arreglo para almacenar los nombres de los jugadores
    const playerElements = []; // Arreglo para almacenar los elementos HTML de los jugadores
    let currentPlayer = null; // Almacena el jugador que está en turno
    let points = {}; // Objeto para almacenar los puntos negativos de cada jugador
    const minPlayers = 3; // Número mínimo de jugadores
    const maxPlayers = 6; // Número máximo de jugadores
    let assignedKeys = {};  // Objeto para asignar teclas a cada jugador
    let stepCounters = {};  // Objeto para contar los pasos de cada jugador
    let keyPressHandlerActive = true; // Bandera para activar o desactivar los eventos de teclado

    // Referencias a elementos del DOM
    const playersContainer = document.getElementById('players'); // Contenedor donde se muestran los jugadores
    const messageElement = document.getElementById('message'); // Elemento donde se muestra mensajes
    const startButton = document.getElementById('startButton'); // Botón para iniciar el juego
    const stopButton = document.getElementById('stopButton'); // Botón para detener el juego
    const scoreList = document.getElementById('scoreList'); // Lista donde se muestran los puntajes
    const scoreBoard = document.getElementById('scoreBoard'); // Contenedor del tablero (puntajes)
    const rulesSection = document.getElementById('rules'); // Sección que muestra las reglas del juego

    // Teclas disponibles para asignar a los jugadores
    const availableKeys = ['a', 's', 'd', 'f', 'g', 'h'];
    scoreBoard.style.display = 'none';

    // Evento que se activa cuando se hace clic en el botón de inicio
    startButton.addEventListener('click', () => {
        rulesSection.style.display = 'none'; 
        scoreBoard.style.display = 'block';
        startGame(); // Inicia el juego

        // Evento que se activa cuando se hace clic en el botón de regreso
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        
        // Reiniciar el juego
        resetGame();
        });
    });

    // Evento que se activa cuando se hace clic en el botón de detener
    stopButton.addEventListener('click', stopGame);

    // Evento que se activa cuando se hace clic en el botón de regreso
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        resetGame();
    });

    function startGame() {
         // Al iniciar el juego, ocultamos la sección de reglas y mostramos el área de juego
    document.getElementById('rules').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    
    // Mostramos el botón de regreso al iniciar el juego
    backButton.style.display = 'block';


        // Solicita el número de jugadores
        const numPlayers = prompt(`Ingrese el número de jugadores (entre ${minPlayers} y ${maxPlayers}):`);
        // Valida que el número de jugadores esté dentro del rango permitido
            if (numPlayers < minPlayers || numPlayers > maxPlayers) {
                alert(`El número de jugadores debe estar entre ${minPlayers} y ${maxPlayers}.`); // Muestra un mensaje de error
                return; // Termina la función si el número de jugadores es inválido
            }
    
        playersContainer.innerHTML = ''; // Limpia el contenedor de jugadores previos
        players.length = 0; // Limpia el arreglo de jugadores previos
        points = {}; // Reinicia los puntos de los jugadores
        stepCounters = {}; // Reinicia el contador de pasos
        assignedKeys = {}; // Reinicia las teclas asignadas
        scoreList.innerHTML = ''; // Limpia los puntajes previos
        keyPressHandlerActive = true; // Reinicia la bandera de control de teclado
    
        // Bucle para agregar jugadores
        for (let i = 0; i < numPlayers; i++) {
            let playerName;
            // Bucle para asegurar que los jugadores no tengan el mismo nombre o que el nombre esté vacío
            do {
                playerName = prompt(`Ingrese el nombre del jugador ${i + 1}:`); // No usamos .trim()
                if (!playerName) {
                    alert('El nombre no puede estar vacío. Por favor, ingrese un nombre válido.');
                } else if (players.includes(playerName)) {
                    alert('El nombre ya está tomado. Por favor, elige otro nombre.');
                }
            } while (!playerName || players.includes(playerName)); // Repite si el nombre está vacío o ya está en uso
    
            players.push(playerName); // Agrega el jugador al arreglo
            points[playerName] = 0; // Inicializa los puntos del jugador en 0
            stepCounters[playerName] = 0; // Inicializa el contador de pasos del jugador en 0
    
            // Asigna una tecla única a cada jugador
            const assignedKey = availableKeys[i];
            assignedKeys[playerName] = assignedKey.toLowerCase(); // Asigna la tecla a minúscula
            alert(`${playerName}, tu tecla asignada es "${assignedKey}".`); // Muestra un mensaje con la tecla asignada
    
            // Crea un elemento HTML para el jugador
            const playerElement = document.createElement('div');
            playerElement.classList.add('player'); // Añade una clase CSS al elemento
            playerElement.textContent = playerName; // Establece el nombre del jugador como texto
            playerElement.addEventListener('click', () => selectPlayer(playerName)); // Agrega un evento de clic para seleccionar al jugador
            playersContainer.appendChild(playerElement); // Añade el elemento del jugador al contenedor
            playerElements.push(playerElement); // Almacena el elemento en el arreglo de elementos de jugadores
    
            // Crea un elemento de lista para el puntaje del jugador
            const scoreItem = document.createElement('li'); 
            scoreItem.id = `score-${playerName}`; // Establece un ID único para el elemento de puntaje
            scoreItem.textContent = `${playerName}: 0 puntos negativos`; // Muestra el puntaje inicial
            scoreList.appendChild(scoreItem); // Añade el elemento de puntaje a la lista
        }
    
        arrangePlayersInCircle(); // Organiza a los jugadores en un círculo
        messageElement.textContent = 'Elige un jugador para declarar la guerra.'; // Mensaje inicial
        currentPlayer = null; // Reinicia el jugador actual
        stopButton.style.display = 'block'; // Muestra el botón de detener
        startButton.style.display = 'none'; // Oculta el botón de iniciar
    
        // Asigna eventos de teclado para cada jugador
        if (keyPressHandlerActive) {
            document.addEventListener('keydown', handleKeyPress); // Escucha los eventos de teclado
        }
    }
    

    let initialPositions = {}; // Objeto para almacenar las posiciones iniciales de los jugadores

    function arrangePlayersInCircle() {
        const radius = 200; // Radio del círculo donde se organizan los jugadores
        const centerX = playersContainer.clientWidth / 2; // Coordenada X del centro del contenedor
        const centerY = playersContainer.clientHeight / 2; // Coordenada Y del centro del contenedor
        const angleStep = (2 * Math.PI) / players.length; // Paso angular entre los jugadores
    
        // Bucle para colocar a cada jugador en su posición en el círculo
        playerElements.forEach((playerElement, index) => {
            const angle = index * angleStep; // Ángulo para cada jugador
            const x = centerX + radius * Math.cos(angle); // Posición X
            const y = centerY + radius * Math.sin(angle); // Posición Y
            
    
            // Guarda la posición inicial del jugador
            initialPositions[players[index]] = { left: x, top: y };
    
            playerElement.style.left = `${x}px`; // Establece la posición X del jugador
            playerElement.style.top = `${y}px`; // Establece la posición Y del jugador
            playerElement.dataset.angle = angle;  // Guarda el ángulo original en un atributo de datos
        });
    }

    function handleKeyPress(event) {
        if (!keyPressHandlerActive) return; // Evita que los jugadores se muevan si está desactivado

        const keyPressed = event.key.toLowerCase(); // Obtiene la tecla presionada y la convierte a minúscula
        players.forEach(player => {
            if (assignedKeys[player] === keyPressed) { // Verifica si la tecla presionada corresponde a un jugador
                movePlayerDiagonallyOutward(player); // Mueve al jugador
                stepCounters[player]++; // Incrementa el contador de pasos del jugador
            }
        });
    }

    function movePlayerDiagonallyOutward(player) {
        const playerElement = playerElements[players.indexOf(player)]; // Obtiene el elemento HTML del jugador
        const currentTop = parseInt(playerElement.style.top) || 0; // Posición actual en Y
        const currentLeft = parseInt(playerElement.style.left) || 0; // Posición actual en X
        const playerWidth = playerElement.clientWidth; // Ancho del elemento del jugador
        const playerHeight = playerElement.clientHeight; // Alto del elemento del jugador
        const containerWidth = playersContainer.clientWidth; // Ancho del contenedor
        const containerHeight = playersContainer.clientHeight; // Alto del contenedor

        // Recupera el ángulo original del jugador
        const angle = parseFloat(playerElement.dataset.angle);

        const stepSize = 5; // Define la cantidad de píxeles que se moverá el jugador

        // Calcula las nuevas posiciones moviendo al jugador en dirección diagonal
        let newTop = currentTop + stepSize * Math.sin(angle); // Nueva posición en Y
        let newLeft = currentLeft + stepSize * Math.cos(angle); // Nueva posición en X

        // Asegura que el jugador no salga del contenedor (arriba/abajo)
        if (newTop < 0) {
            newTop = 0; // Limita la posición mínima en Y
        } else if (newTop + playerHeight > containerHeight) {
            newTop = containerHeight - playerHeight; // Limita la posición máxima en Y
        }

        // Asegura que el jugador no salga del contenedor (izquierda/derecha)
        if (newLeft < 0) {
            newLeft = 0; // Limita la posición mínima en X
        } else if (newLeft + playerWidth > containerWidth) {
            newLeft = containerWidth - playerWidth; // Limita la posición máxima en X
        }

        // Aplica las nuevas posiciones al jugador
        playerElement.style.top = `${newTop}px`; // Establece la nueva posición Y
        playerElement.style.left = `${newLeft}px`; // Establece la nueva posición X
    }

    function selectPlayer(player) {
        if (!currentPlayer) { // Si no hay jugador actual
            currentPlayer = player; // Establece el jugador actual
            messageElement.textContent = `Declaro la guerra a mi peor enemigo que es....${player}. ¡Todos corran!`; // Mensaje de guerra
        } else {
            // Verifica si el jugador se está eligiendo a sí mismo
            if (currentPlayer === player) {
                alert(`No puedes contar pasos hacia ti mismo`); // Mensaje de error
                return; // Termina la función si se elige a si mismo
            }

    
            // Aquí se calculará la distancia en base a los pasos acumulados
            const stepsToPlayer = stepCounters[player]; // Obtiene los pasos acumulados hacia el jugador seleccionado
            const stepsGuess = prompt(`¿Cuántos pasos crees que hay de ${currentPlayer} a ${player}?`); // Pide al jugador que adivine los pasos
    
            // Asegura que no se cuenten pasos hacia sí mismo
            if (currentPlayer === player) {
                alert(`No puedes contar pasos hacia ti mismo.`); // Mensaje de error
                return; // Termina la función si se intenta contar pasos hacia sí mismo
            }
    
            // Compara la respuesta del jugador con los pasos reales
            if (stepsGuess == stepsToPlayer) {
                alert(`¡Acertaste! Hay ${stepsToPlayer} pasos entre ${currentPlayer} y ${player}. ${player} recibe un punto negativo.`); // Mensaje de acierto
                points[player] += 1; // Incrementa el puntaje del jugador
            } else {
                alert(`Fallaste. Hay ${stepsToPlayer} pasos entre ${currentPlayer} y ${player}. ${currentPlayer} recibe un punto negativo.`); // Mensaje de fallo
                points[currentPlayer] += 1; // Incrementa el puntaje del jugador que falló
            }
            updateScoreboard(); // Actualiza el marcador de puntajes
            checkPoints(); // Verifica los puntajes para posibles descalificaciones
            resetRound(player); // Reinicia la ronda para el siguiente jugador
        }
    }

    function stopGame() {
        messageElement.textContent = '¡Todos deben detenerse!'; // Mensaje al detener el juego
        keyPressHandlerActive = false; // Desactiva los movimientos por teclado
    }

    let disqualifiedPlayersAlerts = {}; // Objeto para controlar si se mostró el alert de descalificación

    function checkPoints() {
        // Verifica si algún jugador tiene 10 o más puntos negativos (descalificación)
        for (let i = players.length - 1; i >= 0; i--) {
            const player = players[i];

            // Comprueba si el jugador tiene 10 o más puntos negativos
            if (points[player] == 3) {
                // Verifica si el alert ya ha sido mostrado
                if (!disqualifiedPlayersAlerts[player]) {
                    alert(`${player} ha sido descalificado.`); // Mensaje de descalificación
                    disqualifiedPlayersAlerts[player] = true; // Marca que el alert ha sido mostrado

                    // Remueve al jugador descalificado del arreglo de jugadores
                    players.splice(i, 1);
                    
                    // Remueve el elemento visual correspondiente al jugador descalificado
                    const playerElement = playerElements[i];
                    playersContainer.removeChild(playerElement);
                    playerElements.splice(i, 1); // Elimina el elemento del jugador del arreglo

                    // Actualiza el marcador visual
                    const scoreItem = document.getElementById(`score-${player}`);
                    if (scoreItem) {
                        scoreItem.remove(); // Elimina el puntaje del jugador descalificado
                    }
                }
            }
        }

        // Verifica si quedan solo 2 jugadores
        if (players.length === 2) {
        announceWinner(); // Anuncia al ganador si quedan solo 2
    }
}

    function announceWinner() {
        // Encuentra el jugador con menos puntos negativos
        let winner = players[0]; // Inicializa el ganador como el primer jugador
        for (const player of players) {
            // Compara los puntajes de cada jugador
            if (points[player] < points[winner]) {
                winner = player; // Actualiza al ganador si se encuentra un jugador con menos puntos
            }
        }
        alert(`Fin del juego. ${winner} es el ganador!!`); // Mensaje del ganador
        resetGame(); // Reinicia el juego
    }

    function resetRound(nextPlayer) {
        currentPlayer = null; // Reinicia el jugador actual
        messageElement.textContent = `${nextPlayer}, es tu turno. Declara la guerra a otro jugador.`; // Mensaje para el siguiente jugador
        keyPressHandlerActive = true; // Reactiva el manejo de eventos de teclado para la siguiente ronda
    
        // Reinicia el contador de pasos de todos los jugadores
        for (let player in stepCounters) {
            stepCounters[player] = 0;
        }
    
        // Vuelve a colocar a los jugadores en su posición inicial
        playerElements.forEach((playerElement, index) => {
            const playerName = players[index]; // Obtiene el nombre del jugador
            const initialPosition = initialPositions[playerName]; // Obtiene la posición inicial
            if (initialPosition) {
                playerElement.style.left = `${initialPosition.left}px`; // Coloca al jugador en su posición inicial en X
                playerElement.style.top = `${initialPosition.top}px`; // Coloca al jugador en su posición inicial en Y
            }
        });
    }

    function resetGame() {
        currentPlayer = null; // Reinicia el jugador actual
        points = {}; // Reinicia los puntos de todos los jugadores
        playersContainer.innerHTML = ''; // Limpia el contenedor de jugadores
        players.length = 0; // Limpia el arreglo de jugadores
        playerElements.length = 0; // Limpia el arreglo de elementos de jugadores
        scoreList.innerHTML = ''; // Limpia la lista de puntajes
        stopButton.style.display = 'none'; // Oculta el botón de detener
        startButton.style.display = 'block'; // Muestra el botón de iniciar
        rulesSection.style.display = 'block'; // Muestra las reglas nuevamente
        stepCounters = {}; // Reinicia los contadores de pasos
        keyPressHandlerActive = false; // Desactiva el teclado al finalizar el juego
        document.removeEventListener('keydown', handleKeyPress); // Remueve los eventos de teclado
    }

    function updateScoreboard() {
        scoreList.innerHTML = ''; // Limpia la lista de puntajes
        for (const player of players) {
            // Crea un nuevo elemento de lista para cada jugador
            const scoreItem = document.createElement('li');
            scoreItem.id = `score-${player}`; // Establece un ID único para el puntaje del jugador
            scoreItem.textContent = `${player}: ${points[player]} puntos negativos`; // Muestra el puntaje actual
            scoreList.appendChild(scoreItem); // Añade el elemento de puntaje a la lista
        }
    }
    });