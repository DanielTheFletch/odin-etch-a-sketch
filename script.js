// Daniel Fletcher
// The Odin Project: Foundations
// Etch-a-Sketch


/* 
======================
   GLOBAL VARIABLES
======================
*/


// Maintain application state
const undoStack = [];
let squares = [];

// Track user selections
let clickHeld = false;
let selectedColor = '#000000';
let selectedTool = { pen: true, eraser: false, replace: false };


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
        // square.setAttribute('draggable', 'false');
    
        // Add event listeners
        square.addEventListener('pointerenter', penEnter);
        square.addEventListener('pointerleave', penExit);
        square.addEventListener('pointerdown', penClick);
        
        // Add square to DOM tree
        container.appendChild(square);
    }

    // Update global array of squares to new grid
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

    // Set global arrays to empty
    squares.length = 0;
    undoStack.length = 0;
}


// Manage background color and border color of a single square
const setSquareColor = (square, color) => square.style.backgroundColor = color;
const showHoverPreview = square => square.style.border = `0.5px solid ${selectedColor}a0`;
const unshowHoverPreview = square => square.style.border = '0.5px solid #00000030';


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

        if (selectedTool['pen'] || selectedTool['eraser'])
        {
            // Fill single square for pen/eraser
            squaresChanged.push(square);
            setSquareColor(square, color);
        }
        else
        {
            // Fill multiple squares for replace
            squares.forEach(square => {
                if (square.style.backgroundColor === originalColor)
                {
                    squaresChanged.push(square);
                    setSquareColor(square, color);
                }
            });
        }

        // Update undo stack to track action history
        if (undoStack.length >= 100) { undoStack.shift(); }
        undoStack.push({ squareList: squaresChanged, color: originalColor });
        unshowHoverPreview(square);
    }
}


// Toggle a button's display from ON -> OFF or from OFF -> ON
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
=====================
   EVENT LISTENERS
=====================
*/


// Listen for mouse ENTERING a square
function penEnter(event)
{
    if (!clickHeld)
        showHoverPreview(this);
    else
        useTool(this);

    event.preventDefault();
    event.stopPropagation();
}


// Listen for mouse EXITING a square
function penExit(event)
{
    unshowHoverPreview(this);
    event.preventDefault();
    event.stopPropagation();
}


// Listen for mouse CLICKING on a square
function penClick()
{
    useTool(this);
}


// Pop action from stack and perform undo
function undo()
{
    if (undoStack.length > 0)
    {
        const action = undoStack.pop();
        const color = action['color'];
        for (let square of action['squareList']) { setSquareColor(square, color); }
    }
}


// Globally disable dragging functionality to prevent unexpected behavior
function disableDrag(event)
{
    event.preventDefault();
    event.stopPropagation();
}


// Maintain global clickHeld state
const toggleClickHeld = () => clickHeld = true;
const toggleClickUnheld = () => clickHeld = false;


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


// Generic dialog controls
const showDialog = event => event.currentTarget.dialog.showModal();
const closeDialog = event => event.currentTarget.dialog.close();


// Create new grid of specified size
function processGridSize()
{
    let currentSize;
    const input = document.querySelector('#input-grid-size');
    const newSize = parseInt(input.value);

    if (newSize && newSize > 0 && newSize <= 100)
    {
        clearGrid();
        createGrid(newSize);
        currentSize = newSize;
    }

    input.value = currentSize;
}


// Store new user-selected color
function processColor()
{
    const input = document.querySelector('#input-pen-color');
    selectedColor = input.value;
}


// Clear current grid to starting state
function processClear()
{
    const input = document.querySelector('#input-grid-size');
    const size = parseInt(input.value);
    clearGrid();
    createGrid(size);
}


// -------------------------------------------------------


/* 
=========================
   PAGE INITIALIZATION
=========================
*/


// Initialize event listeners for Pen, Eraser, Replace
function initToolSelectButtons()
{
    for (let tool of ['pen', 'eraser', 'replace'])
    {
        const toggleButton = document.querySelector(`.tool-select-${tool}`);
        toggleButton.toolName = tool;
        toggleButton.addEventListener('click', changeTool);
    }
}


// Event listeners: Grid size, Clear canvas, Change color, Show info
function initActionSelectButtons()
{
    for (let action of ['grid-size', 'clear', 'color', 'info'])
    {
        const actionButton = document.querySelector(`.action-select-${action}`);
        actionButton.dialog = document.querySelector(`#dialog-${action}`);
        actionButton.addEventListener('click', showDialog);
    }
}


// Event listeners: Dialog controls
function initDialogControlButtons()
{
    // Retrieve buttons
    const confirmGridSize = document.querySelector('.dialog-button-grid-size');
    const confirmColor = document.querySelector('.dialog-button-color');
    const confirmClear = document.querySelector('.dialog-button-clear-confirm');
    const closeClear = document.querySelector('.dialog-button-clear-cancel');
    const closeInfo = document.querySelector('.dialog-button-info');

    // Add event listeners for buttons that require processing of user selection
    confirmGridSize.addEventListener('click', processGridSize);
    confirmColor.addEventListener('click', processColor);
    confirmClear.addEventListener('click', processClear);

    // Add event listeners for buttons that just close dialog
    closeClear.dialog = document.querySelector('#dialog-clear');
    closeInfo.dialog = document.querySelector('#dialog-info');
    closeClear.addEventListener('click', closeDialog);
    closeInfo.addEventListener('click', closeDialog);
}


// Event listeners: Undo
function initUndoButton()
{
    const undoButton = document.querySelector('.action-select-undo');
    undoButton.addEventListener('click', undo);
}


// Set application to its initial state
function initialize(gridSize = 16)
{
    // Set initial grid size
    createGrid(gridSize);
    const input = document.querySelector('#input-grid-size');
    input.value = gridSize;

    // Set up event listeners for menu/dialog buttons
    initToolSelectButtons();
    initActionSelectButtons();
    initDialogControlButtons();
    initUndoButton();

    // Set up global event listeners for tracking mouse behavior
    addEventListener('pointerdown', toggleClickHeld);
    addEventListener('pointerup', toggleClickUnheld);
    addEventListener('dragstart', disableDrag);
    addEventListener('dragend', disableDrag);
}


initialize();