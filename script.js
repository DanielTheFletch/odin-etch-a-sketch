// Daniel Fletcher
// The Odin Project: Foundations
// Etch-a-Sketch

// Create grid
const container = document.querySelector('.container');
for (let i = 0; i < 256; i++)
{
    const square = document.createElement('div');
    square.classList.add('square');
    square.style.flex = `1 0 ${(1 / 16) * 100}%`;
    container.appendChild(square);
}