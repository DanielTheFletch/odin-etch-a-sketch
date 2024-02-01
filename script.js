// Daniel Fletcher
// The Odin Project: Foundations
// Etch-a-Sketch


// Create square grid of size (n * n)
function createGrid(n)
{
    const container = document.querySelector('.container');
    for (let i = 0; i < (n * n); i++)
    {
        const square = document.createElement('div');
        square.classList.add('square');
        square.style.flex = `1 0 ${(1 / n) * 100}%`;
    
        square.addEventListener("pointerover", function() {
            this.style.backgroundColor = 'black';
        });
    
        container.appendChild(square);
    }
}


// Remove current grid from the DOM tree
function clearGrid()
{
    const oldContainer = document.querySelector('.container');
    document.body.removeChild(oldContainer);
    const newContainer = document.createElement('div');
    newContainer.classList.add('container');
    document.body.appendChild(newContainer);
}


// Initialize event handlers and create starting grid
function initialize(gridSize = 16)
{
    // Helper variables
    const changeButton = document.querySelector('.button-prompt');
    const submitButton = document.querySelector('.button-submit');
    const dialog = document.querySelector('dialog');
    const input = document.querySelector('#prompt-input');
    let currentSize = gridSize;

    // Event handler: Open grid re-size prompt on button click
    changeButton.addEventListener("click", () => {
        dialog.showModal();
    });

    // Event handler: Process new grid size on button click
    submitButton.addEventListener("click", () => {
        const newSize = parseInt(input.value);

        if (newSize && newSize > 0 && newSize <= 100)
        {
            clearGrid();
            createGrid(newSize);
            currentSize = newSize;
        }

        input.value = currentSize;
        dialog.close();
    });

    // Initial grid size
    createGrid(16);
    input.value = currentSize;
}


initialize();