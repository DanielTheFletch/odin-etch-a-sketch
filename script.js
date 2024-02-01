// Daniel Fletcher
// The Odin Project: Foundations
// Etch-a-Sketch


/* 
    ========================
       CORE FUNCTIONALITY
    ========================
*/


// Global variables for managing state
let penClickRequired = true;
let clickHeld = false;


// Create square grid of size (n * n)
function createGrid(n)
{
    const container = document.querySelector('.container');
    for (let i = 0; i < (n * n); i++)
    {
        const square = document.createElement('div');
        square.classList.add('square');
        square.style.flex = `1 0 ${(1 / n) * 100}%`;
        square.draggable = false;
    
        square.addEventListener("pointerover", penHover);
        square.addEventListener("mousedown", penClick);

        container.appendChild(square);
    }
}


// Remove current grid from the DOM tree
function clearGrid()
{
    // Clear current container
    const main = document.querySelector('main');
    const oldContainer = document.querySelector('.container');
    main.removeChild(oldContainer);

    // Generate new (empty) container
    const newContainer = document.createElement('div');
    newContainer.classList.add('container');
    main.appendChild(newContainer);
}


// Initialize event handler for pen toggle button
function initPenToggle()
{
    const toggleButton = document.querySelector('.menu-button-pen');
    toggleButton.addEventListener("click", toggleColors);
    toggleButton.addEventListener("click", togglePenClickRequired);
}


// Initialize event handlers and create starting grid
function initialize(gridSize = 16)
{
    // Helper variables
    const changeButton = document.querySelector('.button-prompt');
    const submitButton = document.querySelector('.button-submit');
    const input = document.querySelector('#prompt-input');
    let currentSize = gridSize;

    // Event handlers
    initPenToggle();

    // Event handler: Open grid re-size prompt on button click
    changeButton.addEventListener("click", showDialog);

    // Event handler: Process new grid size on button click
    submitButton.addEventListener("click", closeDialog);

    // Initial grid size
    createGrid(16);
    input.value = currentSize;

    // Event listeners for pen functionality
    const container = document.querySelector('.container');
    container.addEventListener("mousedown", toggleClickHeld);
    container.addEventListener("mouseup", toggleClickUnheld);
}


initialize();


// -------------------------------------------------------


/* 
    =====================
       EVENT LISTENERS
    =====================
*/


// Squares: Listen for pen hover
function penHover(event)
{
    if (!penClickRequired)
    {
        this.style.backgroundColor = 'black';
    }

    else if (clickHeld)
    {
        this.style.backgroundColor = 'black';
    }
}


// Squares: Listen for pen click
function penClick(event)
{
    this.style.backgroundColor = 'black';
}


// Container: Maintain clickHeld state
function toggleClickHeld(event) { clickHeld = true; }
function toggleClickUnheld(event) { clickHeld = false; }


// Any toggle button: Change colors
function toggleColors(event)
{
    if (this.classList.contains('toggle-off'))
    {
        // Toggle: OFF -> ON
        this.classList.remove('toggle-off');
        this.classList.add('toggle-on');
    }
    else
    {
        // Toggle: ON -> OFF
        this.classList.remove('toggle-on');
        this.classList.add('toggle-off');
    }
}


// Pen toggle: Maintain penClickRequired state
function togglePenClickRequired(event)
{
    penClickRequired = !penClickRequired;
}


// Dialog: Show dialog
function showDialog(event)
{
    const dialog = document.querySelector('dialog');
    dialog.showModal();
}


// Dialog: Close dialog and process input field
function closeDialog(event)
{
    const dialog = document.querySelector('dialog');
    const input = document.querySelector('input');
    const newSize = parseInt(input.value);

    if (newSize && newSize > 0 && newSize <= 100)
    {
        clearGrid();
        createGrid(newSize);
        currentSize = newSize;
    }

    input.value = currentSize;
    dialog.close();
}