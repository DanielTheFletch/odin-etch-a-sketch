// Daniel Fletcher
// The Odin Project: Foundations
// Etch-a-Sketch


/* 
========================
   CORE FUNCTIONALITY
========================
*/


// Global variables for managing state
let clickRequired = true;
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
        square.setAttribute('draggable', 'false');
    
        square.addEventListener('pointerover', penHover);
        square.addEventListener('pointerdown', penClick);
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


// Initialize button to change grid size
function initGridSizeButton()
{
    // Capture buttons
    const changeButton = document.querySelector('.button-prompt');
    const submitButton = document.querySelector('.button-submit');

    // Add event listeners
    changeButton.addEventListener('click', showDialog);
    submitButton.addEventListener('click', closeDialog);
}


// Initialize event listener for pen toggle button
function initPenToggleButton()
{
    // Add event listeners for button
    const toggleButton = document.querySelector('.menu-button-pen');
    toggleButton.addEventListener('click', toggleColors);
    toggleButton.addEventListener('click', toggleClickRequired);

    // Add event listeners for "mouse required" pen functionality
    document.body.addEventListener('pointerdown', toggleClickHeld);
    document.body.addEventListener('pointerup', toggleClickUnheld);
    document.body.addEventListener('dragstart', disableDrag);
    document.body.addEventListener('dragend', disableDrag);
}


// Initialize event listeners and create starting grid
function initialize(gridSize = 16)
{
    // Set initial grid size
    createGrid(gridSize);
    const input = document.querySelector('#prompt-input');
    input.value = gridSize;

    // Initialize menu buttons and corresponding event listeners
    initPenToggleButton();
    initGridSizeButton();
}


initialize();


// -------------------------------------------------------


/* 
==============================
   EVENT LISTENERS: GENERAL
==============================
*/


// Squares: Listen for pen hover
function penHover(event)
{
    if (!clickRequired)
    {
        this.style.backgroundColor = 'black';
    }

    else if (clickHeld)
    {
        this.style.backgroundColor = 'black';
    }
}


// Container: Disable dragging functionality to prevent unexpected behavior
function disableDrag(event)
{
    event.preventDefault();
    event.stopPropagation();
}


// Squares: Listen for pen click
function penClick(event)
{
    this.style.backgroundColor = 'black';
}


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


// Dialog: Show dialog
function showDialog(event)
{
    const dialog = document.querySelector('dialog');
    dialog.showModal();
}


// Dialog: Close dialog and process input field
function closeDialog(event)
{
    let currentSize;
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


// -------------------------------------------------------


/* 
=====================================
   EVENT LISTENERS: MANAGING STATE
=====================================
*/


// Container: Maintain clickHeld state
function toggleClickHeld(event) { clickHeld = true; }
function toggleClickUnheld(event) { clickHeld = false; }


// Pen toggle: Maintain clickRequired state
function toggleClickRequired(event) { clickRequired = !clickRequired; }