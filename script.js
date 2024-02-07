// Daniel Fletcher
// The Odin Project: Foundations
// Etch-a-Sketch


/* 
======================
   GLOBAL VARIABLES
======================
*/


// Track user inputs for 'Undo' action
const undoStack = [];

// Track squares on grid for ease of use
let squares = [];

// Track currently selected color and tool
let selectedColor = '#000000';
let selectedTool = { pen: true, eraser: false, replace: false };

// Track user click behavior
let clickRequired = true;
let clickHeld = false;


// -------------------------------------------------------


/* 
========================
   CORE FUNCTIONALITY
========================
*/


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

    squares = Array.from(container.childNodes);
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

    while(squares.length > 0) { squares.pop(); }
}


// Manage background color and border color of single square
function setSquareColor(square, color) { square.style.backgroundColor = color; }
function showHoverPreview(square) { square.style.border = `0.5px solid ${selectedColor}a0`; }
function unshowHoverPreview(square) { square.style.border = '0.5px solid #00000030'; }


// Convert specified color from hex to rgb format (both as strings)
function rgbConvert(hex)
{
    const red = hex.substring(1, 3);
    const green = hex.substring(3, 5);
    const blue = hex.substring(5, 7);

    return `rgb(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)})`;
}


// Use the selected tool on the indicated square
function useTool(square)
{
    // Convert selected color (hex) => background color (rgb)
    const color = rgbConvert(selectedTool['eraser'] ? '#ffffff' : selectedColor);

    // Only use tool if it would change the square
    if (square.style.backgroundColor !== color)
    {
        const originalColor = square.style.backgroundColor;
        const squaresChanged = [];

        // Fill single square for pen/eraser
        if (selectedTool['pen'] || selectedTool['eraser'])
        {
            squaresChanged.push(square);
            setSquareColor(square, color);
        }

        // Fill multiple squares for replace
        else
        {
            squares.forEach(square => {
                if (square.style.backgroundColor === originalColor)
                {
                    squaresChanged.push(square);
                    setSquareColor(square, color);
                }
            });
        }

        // Update undo stack to track action
        if (undoStack.length >= 100) { undoStack.shift(); }
        undoStack.push({ squareList: squaresChanged, color: originalColor });
        unshowHoverPreview(square);
    }
}


// Any toggle button: Change colors
function toggle(button, set)
{
    if (set === 'off' && button.classList.contains('toggle-on'))
    {
        button.classList.remove('toggle-on');
        button.classList.add('toggle-off');
    }
    else if (set === 'on' && button.classList.contains('toggle-off'))
    {
        button.classList.remove('toggle-off');
        button.classList.add('toggle-on');
    }
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
    const gridButton = document.querySelector('.action-select-grid-size');
    const submitButton = document.querySelector('.submit-button-grid-size');

    // Add event listeners
    gridButton.addEventListener('click', showDialogGridSize);
    submitButton.addEventListener('click', closeDialogGridSize);
}


// Initialize button to clear workspace
function initClearCanvasButton()
{
    // Capture buttons
    const clearButton = document.querySelector('.action-select-clear');
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
    const colorButton = document.querySelector('.action-select-color');
    const submitButton = document.querySelector('.submit-button-color');

    // Add event listeners
    colorButton.addEventListener('click', showDialogPenColor);
    submitButton.addEventListener('click', closeDialogPenColor);
}


function initInfoButton()
{
    // Capture buttons
    const infoButton = document.querySelector('.action-select-info');
    const submitButton = document.querySelector('.submit-button-info');

    // Add event listeners
    infoButton.addEventListener('click', showDialogInfo);
    submitButton.addEventListener('click', closeDialogInfo);
}


// Initialize event listeners for pen tool button
function initToolSelectButtons()
{
    // Add event listeners for buttons
    for (let tool of ['pen', 'eraser', 'replace'])
    {
        const toggleButton = document.querySelector(`.tool-select-${tool}`);
        toggleButton.toolName = tool;
        toggleButton.addEventListener('click', changeTool);
    }

    // Add global event listeners for "mouse required" pen functionality
    addEventListener('pointerdown', toggleClickHeld);
    addEventListener('pointerup', toggleClickUnheld);
    addEventListener('dragstart', disableDrag);
    addEventListener('dragend', disableDrag);
}


// Initialize event listeners for undo button
function initUndoButton()
{
    const undoButton = document.querySelector('.action-select-undo');
    undoButton.addEventListener('click', undoAction);
}


// Initialize event listeners and create starting grid
function initialize(gridSize = 16)
{
    // Set initial grid size
    createGrid(gridSize);
    const input = document.querySelector('#input-grid-size');
    input.value = gridSize;

    // Set up menu buttons: Selectable tools
    initToolSelectButtons();

    // Set up menu buttons: Performable actions
    initClearCanvasButton();
    initGridSizeButton();
    initPenColorButton();
    initUndoButton();
    initInfoButton();
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
    if (clickRequired)
    {
        if (!clickHeld)
            showHoverPreview(this);
        else
            useTool(this);
    }

    else
        useTool(this);

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
    useTool(this);
}


// Pop action from stack and perform undo
function undoAction(event)
{
    if (undoStack.length > 0)
    {
        const action = undoStack.pop();
        const color = action['color'];
        for (let square of action['squareList']) { setSquareColor(square, color); }
    }
}


// Container: Disable dragging functionality to prevent unexpected behavior
function disableDrag(event)
{
    event.preventDefault();
    event.stopPropagation();
}




// Change the currently selected tool
function changeTool(event)
{
    const toolName = event.currentTarget.toolName;

    if (!selectedTool[toolName])
    {
        // Set all tools to 'OFF' state
        const toolButtons = document.querySelectorAll('.tool-select');
        toolButtons.forEach(button => toggle(button, 'off'));
        for (active in selectedTool) { selectedTool[active] = false; }

        // Set new chosen tool to 'ON' state
        const toolChoiceButton = document.querySelector(`.tool-select-${toolName}`);
        toggle(toolChoiceButton, 'on');
        selectedTool[toolName] = true;
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


// Dialog controls: Display info on screen

function showDialogInfo(event)
{
    const dialog = document.querySelector('#dialog-info');
    dialog.showModal();
}

function closeDialogInfo(event)
{
    const dialog = document.querySelector('#dialog-info');
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

// Eraser toggle: Maintain eraserMode state
function toggleEraserMode(event) { eraserMode = !eraserMode; }
