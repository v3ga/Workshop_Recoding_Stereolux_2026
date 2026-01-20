/* 
Part of the ReCode Project (http://recodeproject.com)
Based on "Structured Square Series - Inward" by Roger Coqart
Originally published in "Computer Graphics and Art" vol1 no3, 1976
Copyright (c) 2012 Kyle McDonald - OSI/MIT license (http://recodeproject/license).
*/

//------------------------------------------------------------
let side = 24;
let lines = 8;
let n = lines * 2 + 1;
let margin = side / 2;
let offset = side + margin;
let canvas = (n + 1) * offset;
let enabled = new Array(lines);

let filename = "Structured_Square_Series-Inward-Roger_Coqart-1976";
let bDoExportSvg = false;

//------------------------------------------------------------
function setup() {
  createCanvas(canvas,canvas); 
  randomSeed(12345);
  noLoop();
}

//------------------------------------------------------------
async function draw() 
{
  if (bDoExportSvg)
    beginRecordSvg(this, null);

  background(240);
  translate(side, side);
      
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      
      let total = max(abs(y - lines), abs(x - lines));
      for (let i = 0; i < lines; i++) {
        enabled[i] = i < total;
      }

    for (let i = 0; i < lines; i++) {
      let swap = enabled[i];
      let j = floor(random(lines));
      enabled[i] = enabled[j];
      enabled[j] = swap;
    }

    push();
      translate(x * offset, y * offset);
      rect(0, 0, side, side);
      if (enabled[0]) line(0, side / 2, side, side / 2);
      if (enabled[1]) line(side / 2, 0, side / 2, side);
      if (enabled[2]) line(0, 0, side, side);
      if (enabled[3]) line(0, side, side, 0);
      if (enabled[4]) line(0, side / 2, side / 2, 0);
      if (enabled[5]) line(side / 2, 0, side, side / 2);
      if (enabled[6]) line(side, side / 2, side / 2, side);
      if (enabled[7]) line(side / 2, side, 0, side / 2);
    pop();
    }
  }

  if (bDoExportSvg)
  {
    let strSVG = endRecordSvg();

    // vpype resizing
    let strSvgA3  = await vpype(strSVG, ['layout', '--fit-to-margins', '2cm', 'a3']);

    // vpype for hpgl export
    let strHPGL = await svgToHPGL(strSvgA3);

    // Save svg & hpgl
    saveSvg(`${filename}.svg`,    strSvgA3);
    saveHPGL(`${filename}.hpgl`,  strHPGL);

    // Done exporting
    bDoExportSvg = false;
  }
}

//------------------------------------------------------------
function keyPressed() {
  if (key==' ') {
    bDoExportSvg = true;
    redraw();
  }
}
