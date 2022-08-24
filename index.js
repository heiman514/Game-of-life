const unitLength = 15;
let columns;
let rows;
let lightThem = {
    emptyBoxColor: 255,
    strokeColor: 50,
    boxColor: 100,
}
let darkThem = {
    emptyBoxColor: 50,
    strokeColor: 255,
    boxColor: 220
}
let board;
let count;
let footerHeight = 350;
let isDarkMode = false;
let patternName = 'normal'
let patternText = ``
let pattern = generatePattern()
let fr = 30 + ' fps'
let control = document.querySelector('div.control')
let randomColorMode = false

function windowResized() {
    resizeCanvas(windowWidth, windowHeight - footerHeight);
    columns = floor(width / unitLength);
    rows = floor(height / unitLength);
    slider.position(window.scrollX + control.getBoundingClientRect().left + 735, window.scrollY + control.getBoundingClientRect().top + 50);
    init();
    draw();
}

function setup() {
    const canvas = createCanvas(windowWidth, windowHeight - footerHeight);
    canvas.parent(document.querySelector('#canvas'));

    document.querySelector('#fr').innerHTML = fr
    slider = createSlider(1, 60, 30, 1);
    slider.style('width', '100px');
    slider.position(window.scrollX + control.getBoundingClientRect().left + 735, window.scrollY + control.getBoundingClientRect().top + 50);

    init();
}

function init() {
    board = []

    columns = floor(width / unitLength);
    rows = floor(height / unitLength);

    for (let i = 0; i < columns; i++) {
        board[i] = []
    for (let j = 0; j < rows; j++) {
        board[i][j] = {
            alive: 0,
            nextAlive: 0,
            color: lightThem.boxColor
        }
    }
    }
    noLoop();
    count = 0
}

function draw() {
    background(255);
    generate();

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            let cell = board[i][j]
            if (cell.alive == 1) {
                if(randomColorMode === false) {
                    isDarkMode ? cell.color = darkThem.boxColor : cell.color = lightThem.boxColor
                } else {
                    cell.color = color(random(255),random(255),random(255))
                }
                fill(cell.color);
            } else if (cell.alive == 0) {
                isDarkMode ? fill(darkThem.emptyBoxColor) : fill(lightThem.emptyBoxColor)
            }
            isDarkMode ? stroke(darkThem.strokeColor) : stroke(lightThem.strokeColor)
            rect(i * unitLength, j * unitLength, unitLength, unitLength);
        }
    }
    document.querySelector('#counter').innerHTML = ' ' + count
    count += 1
}

function generate() {
    //Loop over every single box on the board
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            let cell = board[x][y]
            // Count all living members in the Moore neighborhood(8 boxes surrounding)
            let neighbors = 0

            for (let dx of [-1, 0, 1]) {
                for (let dy of [-1, 0, 1]) {
                    if (dx == 0 && dy == 0) {
                        // the cell itself is not its own neighbor
                        continue
                    }
                    // The modulo operator is crucial for wrapping on the edge
                    let peerX = (x + dx + columns) % columns
                    let peerY = (y + dy + rows) % rows
                    neighbors += board[peerX][peerY].alive
                }
            }

            // Rules of Life
            if (cell.alive == 1 && neighbors < parseInt(document.querySelector('#rules1').value)) {
                // Die of Loneliness
                cell.nextAlive = 0;
            } else if (cell.alive == 1 && neighbors > parseInt(document.querySelector('#rules2').value)) {
                // Die of Overpopulation
                cell.nextAlive = 0;
            } else if (cell.alive == 0 && neighbors == parseInt(document.querySelector('#rules3').value)) {
                // New life due to Reproduction
                cell.nextAlive = 1;
            } else {
                // Stasis
                cell.nextAlive = cell.alive;
            }
        }
    }

    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            let cell = board[x][y]
            cell.alive = cell.nextAlive
        }
    }
}

//pattern function
let blinker = document.querySelector('#blinker')
let normal = document.querySelector('#normal')
let glider = document.querySelector('#glider')
let gun = document.querySelector('#gun')

normal.addEventListener('click', function () {
    changePattern(normal.id)
})
blinker.addEventListener('click', function () {
    changePattern(blinker.id)
})
glider.addEventListener('click', function () {
    changePattern(glider.id)
})
gun.addEventListener('click', function () {
    changePattern(gun.id)
})

function changePattern(name) {
    patternName = name

    switch (patternName) {
        case 'normal':
            patternText = ``
            break;
        case 'blinker':
            patternText = `
            ...
            .x.
            .x.
            .x.
            ...
            `
            break;
        case 'glider':
            patternText = `
            .....
            .x...
            ..xx.
            .xx..
            .....
            `
            break;
        case 'gun':
            patternText = `
            ......................................
            .........................x............
            .......................x.x............
            .............xx......xx............xx.
            ............x...x....xx............xx.
            .xx........x.....x...xx...............
            .xx........x...x.xx....x.x............
            ...........x.....x.......x............
            ............x...x.....................
            .............xx.......................
            `
            break
        default:
            break;
    }
    console.log('pattern change!', patternName, patternText);
}

function generatePattern() {
    let lines = patternText.split('\n')
    lines = lines.slice(1, lines.length - 1)

    let values = lines.map(line =>
        line
            .trim()
            .split('')
            .map(char => (char === '.' ? 0 : 1)),
    )

    let height = values.length
    let width = values.reduce(
        (accWidth, line) => Math.max(line.length, accWidth),
        0,
    )

    let halfHeight = Math.floor(height / 2)
    let halfWidth = Math.floor(width / 2)

    return {
        values,
        halfWidth,
        halfHeight,
    }
}

function placeCell(x, y, value) {
    x = (x + columns) % columns
    y = (y + rows) % rows

    board[x][y].alive = value
    if (value == 1) {
        isDarkMode ? fill(darkThem.boxColor) : fill(lightThem.boxColor)
    } else {
        isDarkMode ? fill(darkThem.emptyBoxColor) : fill(lightThem.emptyBoxColor)
    }
    isDarkMode ? stroke(darkThem.strokeColor) : stroke(lightThem.strokeColor)
    rect(x * unitLength, y * unitLength, unitLength, unitLength)
}

function mouseDragged() {
    /**
     * If the mouse coordinate is outside the board
     */

    if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
        return;
    }

    const sx = Math.floor(mouseX / unitLength);
    const sy = Math.floor(mouseY / unitLength);

    const cy = sy - pattern.halfHeight
    const cx = sx - pattern.halfWidth

    if (patternName === 'normal') {
        board[sx][sy].alive = 1;
        isDarkMode ? fill(darkThem.boxColor) : fill(lightThem.boxColor);
        isDarkMode ? stroke(darkThem.strokeColor) : fill(lightThem.strokeColor);
        rect(sx * unitLength, sy * unitLength, unitLength, unitLength);
    } else {
        pattern.values.forEach((line, yIndex) => {
            line.forEach((value, xIndex) => {
                let y = yIndex + cy
                let x = xIndex + cx
                placeCell(x, y, value)
            })
        })
    }
}

function mousePressed() {
    pattern = generatePattern()
    noLoop();
    mouseDragged();
}

function mouseReleased() {
    loop();
    changeSpeed();
}

function changeSpeed() {
    fr = slider.value()
    frameRate(fr)
    document.querySelector('#fr').innerHTML = fr + ' fps'
}

document.querySelector('#reset-game')
.addEventListener('click', function () {
    init();
});

document.querySelector('#stop-game').addEventListener('click', function () {
    noLoop();
})

document.querySelector('#start-game').addEventListener('click', function () {
    loop();
})

document.querySelector('#random-game').addEventListener('click', function () {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            board[i][j].alive = random() > 0.8 ? 1 : 0;
            board[i][j].nextAlive = 0;
        }
    }
})

let themBtn = document.querySelector('#gameStyle')
themBtn.addEventListener('click', changeThem)

function changeThem() {
    if(themBtn.innerHTML === 'Dark Mode') {
        themBtn.innerHTML = 'Light Mode'
        isDarkMode = true
    } else {
        themBtn.innerHTML = 'Dark Mode'
        isDarkMode = false
    }    
}

// change color
document.querySelector('#classic').addEventListener('click', function () {
    randomColorMode = false
})

document.querySelector('#random-color').addEventListener('click', function(){
    randomColorMode = true
})

// DOT 

