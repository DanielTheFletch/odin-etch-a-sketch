// Daniel Fletcher
// The Odin Project: Foundations
// Etch-a-Sketch


/* 
========================
   CORE FUNCTIONALITY
========================
*/


// Global variables for managing state
const undoStack = [];
let clickRequired = true;
let clickHeld = false;
let currentSquareColor = '#ffffff';
let selectedColor = '#000000';
let eraserMode = false;


// Create square grid of size (n * n)
function createGrid(n)
{
    const container = document.querySelector('.container');
    for (let i = 0; i < (n * n); i++)
    {
        // Create square element (div)
        const square = document.createElement('div');
        square.classList.add('square');
        square.style.flex = `1 0 ${(1 / n) * 100}%`;
        square.setAttribute('draggable', 'false');
    
        // Add event listeners
        square.addEventListener('pointerenter', penEnter);
        square.addEventListener('pointerleave', penExit);
        square.addEventListener('pointerdown', penClick);
        
        // Add square to DOM tree
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


// Square: Set color of individual square
function setColor(element)
{
    // Convert selected color to match backgroundColor format
    const color = eraserMode ? rgbConvert('#ffffff') : rgbConvert(selectedColor);

    if (element.style.backgroundColor !== color)
    {
        // Track action for undo
        if (undoStack.length >= 100) { undoStack.shift(); }
        undoStack.push({ item: element, color: element.style.backgroundColor });
    
        // Update color
        element.style.backgroundColor = color;
        currentSquareColor = color;
        unshowHoverPreview(element);
    }
}


// Square: Toggle hover preview when using "mouse required" mode
function showHoverPreview(element) { element.style.border = `3px solid #C0A08060`; }
function unshowHoverPreview(element) { element.style.border = `3px solid black`; }


// Selected color: Convert selected color to rgb() style string
function rgbConvert(hex)
{
    const red = hex.substring(1, 3);
    const green = hex.substring(3, 5);
    const blue = hex.substring(5, 7);

    return `rgb(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)})`;
}


// -------------------------------------------------------


/* 
=========================
   PAGE INITIALIZATION
=========================
*/


// Initialize button to change grid size
function initGridSizeButton()
{
    // Capture buttons
    const gridButton = document.querySelector('.menu-button-grid-size');
    const submitButton = document.querySelector('.submit-button-grid-size');

    // Add event listeners
    gridButton.addEventListener('click', showDialogGridSize);
    submitButton.addEventListener('click', closeDialogGridSize);
}


// Initialize button to clear workspace
function initClearCanvasButton()
{
    // Capture buttons
    const clearButton = document.querySelector('.menu-button-clear');
    const confirmButton = document.querySelector('.submit-button-clear-confirm');
    const cancelButton = document.querySelector('.submit-button-clear-cancel');

    // Add event listeners
    clearButton.addEventListener('click', showDialogClearCanvas);
    confirmButton.addEventListener('click', closeDialogClearCanvas);
    cancelButton.addEventListener('click', closeDialog('#dialog-clear-canvas'));
}


// Initialize button to change pen color
function initPenColorButton()
{
    // Capture buttons
    const colorButton = document.querySelector('.menu-button-color');
    const submitButton = document.querySelector('.submit-button-color');

    // Add event listeners
    colorButton.addEventListener('click', showDialogPenColor);
    submitButton.addEventListener('click', closeDialogPenColor);
}


// Initialize event listeners for pen toggle button
function initPenToggleButton()
{
    // Add event listeners for button
    const toggleButton = document.querySelector('.menu-button-pen');
    toggleButton.addEventListener('click', toggleColors);
    toggleButton.addEventListener('click', toggleClickRequired);

    // Add global event listeners for "mouse required" pen functionality
    addEventListener('pointerdown', toggleClickHeld);
    addEventListener('pointerup', toggleClickUnheld);
    addEventListener('dragstart', disableDrag);
    addEventListener('dragend', disableDrag);
}


// Initialize event listeners for eraser toggle button
function initEraserToggleButton()
{
    const toggleButton = document.querySelector('.menu-button-eraser');
    toggleButton.addEventListener('click', toggleColors);
}


// Initialize event listeners for undo button
function initUndoButton()
{
    const undoButton = document.querySelector('.menu-button-undo');
    undoButton.addEventListener('click', undoAction);
}


// Initialize event listeners and create starting grid
function initialize(gridSize = 16)
{
    // Set initial grid size
    createGrid(gridSize);
    const input = document.querySelector('#input-grid-size');
    input.value = gridSize;

    // Initialize menu buttons and corresponding event listeners
    initPenToggleButton();
    initEraserToggleButton();
    initClearCanvasButton();
    initGridSizeButton();
    initPenColorButton();
    initUndoButton();
}


initialize();


// -------------------------------------------------------


/* 
==============================
   EVENT LISTENERS: GENERAL
==============================
*/


// Squares: Listen for pen entering
function penEnter(event)
{
    currentSquareColor = this.style.backgroundColor;

    if (clickRequired)
    {
        if (!clickHeld)
            showHoverPreview(this);
        else
            setColor(this);
    }

    else
        setColor(this);

    event.preventDefault();
    event.stopPropagation();
}


// Squares: Listen for pen exiting
function penExit(event)
{
    unshowHoverPreview(this);
    event.preventDefault();
    event.stopPropagation();
}


// Squares: Listen for pen click
function penClick(event)
{
    setColor(this);
}


// Pop action from stack and perform undo
function undoAction(event)
{
    if (undoStack.length > 0)
    {
        const action = undoStack.pop();
        action.item.style.backgroundColor = action.color;
    }
}


// Container: Disable dragging functionality to prevent unexpected behavior
function disableDrag(event)
{
    event.preventDefault();
    event.stopPropagation();
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


// Generic 'close dialog' control (e.g., for cancellations)
function closeDialog(selector)
{
    const dialog = document.querySelector(selector);
    dialog.close();
}


// Dialog controls: Change grid size

function showDialogGridSize(event)
{
    const dialog = document.querySelector('#dialog-grid-size');
    dialog.showModal();
}

function closeDialogGridSize(event)
{
    let currentSize;
    const dialog = document.querySelector('#dialog-grid-size');
    const input = document.querySelector('#input-grid-size');
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


// Dialog controls: Change pen color

function showDialogPenColor(event)
{
    const dialog = document.querySelector('#dialog-pen-color');
    dialog.showModal();
}

function closeDialogPenColor(event)
{
    const dialog = document.querySelector('#dialog-pen-color');
    const input = document.querySelector('#input-pen-color');

    selectedColor = input.value;
    dialog.close();
}


// Dialog controls: Change grid size

function showDialogClearCanvas(event)
{
    const dialog = document.querySelector('#dialog-clear-canvas');
    dialog.showModal();
}

function closeDialogClearCanvas(event)
{
    const dialog = document.querySelector('#dialog-clear-canvas');
    const size = document.querySelector('#input-grid-size').value;

    clearGrid();
    createGrid(size);

    while(undoStack.length > 0) { undoStack.pop(); }

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