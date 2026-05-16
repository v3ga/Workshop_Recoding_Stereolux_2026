//------------------------------------------------------------
//-------------------RECODING-FRIEDER-NAKE--------------------
//------------------------------------------------------------
let format = FORMAT_A3_MM;
let DPCM = 20;
let filename = "Frieder_Nake";
let bDoExportSvg = false;
const settings = {
  debug    : false,
  seed     : Math.floor(Math.random()*999999),
  nCols    : 50,
  nRows    : 50,
  xFreq    : 0.5,
  yFreq    : 0.02,
  opt      : 2, // Les 4 variations (0 -> 3)
}

//------------------------------------------------------------
function setup() {
  createCanvas(format[0] * DPCM / 10, format[1] * DPCM / 10);
  setSvgResolutionDPCM(20);
  noLoop();
  frameRate(10);
}

//------------------------------------------------------------
async function draw() {
  background(240);
  noFill();
  strokeWeight(2);
  randomSeed(settings.seed);
  let xMargin = width * 0.05;
  let xDim    = (width - 2 * xMargin) / settings.nCols;
  let yMargin = (height - (settings.nRows * xDim)) * .5;
  let yDim    = xDim;

  if (bDoExportSvg)
    beginRecordSvg(this, null);

  // BEGIN DRAW
  push();

  for (let j = 0; j < settings.nRows; j++) {
    for (let i = 0; i < settings.nCols; i++) {
      let x = xMargin + i * xDim;
      let y = yMargin + j * yDim;
      let n = scalarField(x, y, xMargin, yMargin, settings.opt);
      let noiseVal = random() * noise(x * settings.xFreq, y * settings.yFreq);
      let tile = 2;
      if      (n*random()>0.2) {tile = 2}
      else if (noiseVal  <0.05){tile = 0}
      else if (noiseVal  <0.9) {tile = 1}
      settings.debug ? debugTile(x, y, xDim, xDim, n) : drawTile(x, y, xDim, xDim, tile);
    }
  }

  pop();
  // END DRAW

  if (bDoExportSvg) {
    let strSVG = endRecordSvg();
    let strSvgA3 = await vpype(strSVG, ['layout', '--fit-to-margins', '2cm', 'a3']);
    let strHPGL  = await svgToHPGL(strSVG);
    saveSvg(`${filename}.svg`, strSvgA3);
    saveHPGL(`${filename}.hpgl`, strHPGL);
    bDoExportSvg = false;
  }
}

//------------------------------------------------------------
function drawTile(x, y, w, h, tile) {
  if (tile === 0) { line(x, y, x + w, y) }
  else if (tile === 1) { line(x + w, y, x + w, y + h) }
}

//------------------------------------------------------------
function debugTile(x, y, w, h, t) {
  push();
  fill(t * 255);
  stroke(t * 255);
  rect(x, y, w, h);
  pop();
}

//--------------------SCALAR-FIELD----------------------------
function scalarField(x, y, xMargin, yMargin, opt) {
  let n = 1;
  const optFns = [
    // Diagonale
    () => { let a = map(x, xMargin, width - xMargin, -0.5, 0.5); let b = map(y, yMargin, height - yMargin, 0.5, -0.5); n = abs(a + b) },
    // Disque bas droite
    () => { let a = map(x, xMargin, width - xMargin, 0, 1); let b = map(y, yMargin, height - yMargin, 0, 1); n = a * b; },
    // Gradient vertical
    () => n = abs(map(y, height / 2, height - yMargin, 0, 0.5) ),
    // Disque central
    () => {
        let A = (width / 2) - xMargin;
        let B = (height / 2) - yMargin;
        let hyp = Math.sqrt(A * A + B * B);
        let d = dist(width / 2, height / 2, x, y) / hyp;
        n = (1 - d) * (1 - d)  
    },
  ]
  optFns[opt]();
  return n;
}

//------------------------------------------------------------
function keyPressed() {
  if (key == 's') {
    bDoExportSvg = true;
    redraw();
  }
}
