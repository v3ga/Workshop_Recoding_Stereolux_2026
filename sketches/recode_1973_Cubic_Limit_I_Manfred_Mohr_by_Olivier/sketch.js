//------------------------------------------------------------
let format = FORMAT_A3_MM;
let DPCM = 20;
let filename = "manfred_cubic";
let bDoExportSvg = false;

var DEBUG = true

//------------------------------------------------------------
function setup() {
  createCanvas(format[1] * DPCM / 10, format[0] * DPCM / 10);
  setSvgResolutionDPCM(DPCM);
  //rectMode(CENTER);
  strokeWeight(mmToPx(0.3, DPCM * 10))
  let urlParams = new URLSearchParams(window.location.search);
  DEBUG = urlParams.get('debug') === '1';
  noLoop();
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5)
}

// Regles a appliquer pour dessiner un cube:
// - le choix de l'angle du cube change en fonction de la colonne
// - le choix des aretes a dessiner est aleatoire
function drawCube(pos_x, pos_y, size, spacer, delta, angle = 0) {
  push()
  let x = pos_x * (size + spacer)
  let y = pos_y * (size + spacer)

  let d = (spacer - delta) / 2
  translate(x + d, y + d)

  let center = (size + delta) / 2
  if (angle !== 0) {
    // rotation autour du centre
    // + mise à l'echelle
    let scaleFactor = 1 / (abs(cos(angle)) + abs(sin(angle)))
    translate(center, center)
    scale(scaleFactor)
    rotate(angle)
    translate(-center, -center)
  }

  if (DEBUG) {
    stroke("red")
    square(0, 0, size + delta)
    stroke(0)
  }

  let back = [
    { x: 0, y: 0 },
    { x: 0, y: size },
    { x: size, y: size },
    { x: size, y: 0 }
  ]
  let face = back.map(v => {
    return { x: v.x + delta, y: v.y + delta }
  })

  let cube = [
    [face[0], face[1]],
    [face[1], face[2]],
    [face[2], face[3]],
    [face[3], face[0]],
    [back[0], back[1]],
    [back[1], back[2]],
    [back[2], back[3]],
    [back[3], back[0]],
    [face[0], back[0]],
    [face[1], back[1]],
    [face[2], back[2]],
    [face[3], back[3]],
  ]

  let rnd = Math.floor(random(0, 12))
  let items = shuffle(cube).slice(0, rnd)
  for (let l of items) {
    line(l[0].x, l[0].y, l[1].x, l[1].y)
  }
  pop()
}

var seed = 0;
//------------------------------------------------------------
async function draw() {
  background(240);
  noFill();

  if (bDoExportSvg) beginRecordSvg(this, null);
  else seed = random(1000000);
  randomSeed(seed);

  // BEGIN DRAW
  let marginX = 0.02 * width
  let marginY = 0.02 * height
  let dimSquares = DEBUG ? 18 : 8
  let spacer = 3 * dimSquares / 2

  let nColumns = Math.floor((width - 2 * marginX) / (dimSquares + spacer))
  let nRows = Math.floor((height - 2 * marginY) / (dimSquares + spacer))

  marginX = (width - (nColumns * (dimSquares + spacer))) / 2
  marginY = (height - (nRows * (dimSquares + spacer))) / 2

  let deltas = []
  let angles = []
  for (let c = 0; c <= nColumns; c++) {
    deltas.push(random(dimSquares / 5, dimSquares / 2))
    angles.push(random(-0.5 * PI, 0.5 * PI))
  }

  let startAngle = random(-PI / 3, -PI / 5)
  push()
  translate(marginX, marginY)
  let hMax = dimSquares + spacer
  for (let r = 0; r <= nRows; r++) {
    let h = r * (hMax)
    line(0, h, width - 2 * marginX, h)
    if (r < nRows) {
      for (let c = 0; c < nColumns; c++) {
        let angle = startAngle + (c / nColumns) * (2 * PI / 3)
        drawCube(c, r, dimSquares, spacer, deltas[c], angle)
      }
    }
  }
  pop()

  if (bDoExportSvg) {
    let strSVG = endRecordSvg();

    // vpype resizing
    let strSvgA3 = await vpype(strSVG, ['layout', '--landscape', '--fit-to-margins', '2cm', 'a3']);

    // vpype for hpgl export
    let strHPGL = await svgToHPGL(strSvgA3);

    // Save svg & hpgl
    saveSvg(`${filename}.svg`, strSvgA3);
    // saveSvg(`${filename}.svg`, strSVG);
    saveHPGL(`${filename}.hpgl`, strHPGL);

    // Done exporting
    bDoExportSvg = false;
  }
}

//------------------------------------------------------------
function keyPressed() {
  if (key == 's') {
    bDoExportSvg = true;
    redraw();
  }
  else if (key == ' ') {
    redraw();
  }
}
