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
let selectedTool = { pen: true, eraser: false, bucket: false };


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


// Bucket: Fill all contiguous squares of the same color
function bucketFill(origin)
{
    // Helper variables
    const squares = Array.from(document.querySelector('.container').childNodes);
    const size = Math.sqrt(squares.length);
    const startIndex = squares.indexOf(origin);
    console.log(startIndex);

    // Print adjacent squares
    for (let i = 0; i < squares.length; i++)
    {
        // NEED TO FIX:
        // "Same row" logic doesn't account for row breaks, just checks raw index

        if (i === startIndex + 1 || i === startIndex - 1)
        {
            console.log(`Same row, at index ${i}`);
        }

        else if (i === startIndex - size || i === startIndex + size)
        {
            console.log(`Same column, at index ${i}`);
        }
    }
}


// Square: Set color of individual square
function setColor(square)
{
    // Convert selected color to match backgroundColor format
    let color;
    if (selectedTool['pen'])
    {
        color = selectedColor;
    }
    else if (selectedTool['eraser'])
    {
        color = '#ffffff';
    }
    else
    {
        bucketFill(square);
    }

    if (square.style.backgroundColor !== color)
    {
        // Track action for undo
        if (undoStack.length >= 100) { undoStack.shift(); }
        undoStack.push({ item: square, color: square.style.backgroundColor });
    
        // Update color
        square.style.backgroundColor = color;
        currentSquareColor = color;
        unshowHoverPreview(square);
    }
}


// Square: Toggle hover preview when using "mouse required" mode
function showHoverPreview(element) { element.style.border = `0.5px solid ${selectedColor}a0`; }
function unshowHoverPreview(element) { element.style.border = '0.5px solid #00000030'; }


// Selected color: Convert selected color to rgb() style string
function rgbConvert(hex)
{
    const red = hex.substring(1, 3);
    const green = hex.substring(3, 5);
    const blue = hex.substring(5, 7);

    return `rgb(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)})`;
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


// Initialize event listeners for pen tool button
function initToolSelectButtons()
{
    // Add event listeners for buttons
    for (tool of ['pen', 'eraser', 'bucket'])
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