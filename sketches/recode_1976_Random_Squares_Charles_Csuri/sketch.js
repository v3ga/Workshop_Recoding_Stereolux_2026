/* 
Part of the ReCode Project (http://recodeproject.com)
Based on "Random Squares" by Charles Csuri
Originally published in "Computer Graphics and Art" vol1 no2, 1976
Copyright (c) 2012 Chris Allick - OSI/MIT license (http://recodeproject/license).
*/

//------------------------------------------------------------
let filename = "Random_Squares-Charles_Csuri-1976";
let bDoExportSvg = false;

//------------------------------------------------------------
function setup() {
  createCanvas(512,512); 
  noLoop();
}

//------------------------------------------------------------
async function draw() 
{
  if (bDoExportSvg)
    beginRecordSvg(this, null);

  background(240);
  stroke(0);
  strokeWeight(2);
  noFill();
  drawRects();


  if (bDoExportSvg)
  {
    let strSVG = endRecordSvg();

    // vpype resizing
    let strSvgA3  = await vpype(strSVG, ['layout', '--fit-to-margins', '1cm', 'a3']);

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

//------------------------------------------------------------
function drawRects() {
  background(255);
  for (let i = 0; i < 400; i++) {
    roundedRect(
      random(-10, width),
      random(-10, height),
      random(5, 40),
      random(5, 40),
      5,
      5
    );
  }
}

//------------------------------------------------------------
function roundedRect(x, y, w, h, rx, ry) {
  //Code adapted from "cefnhoile", heres the link: https://forum.processing.org/topic/rounded-rectangle .
  beginShape();
  vertex(x, y + ry); //top of left side
  bezierVertex(x, y, x, y, x + rx, y); //top left corner

  vertex(x + w - rx, y); //right of top side
  bezierVertex(x + w, y, x + w, y, x + w, y + ry); //top right corner

  vertex(x + w, y + h - ry); //bottom of right side
  bezierVertex(x + w, y + h, x + w, y + h, x + w - rx, y + h); //bottom right corner

  vertex(x + rx, y + h); //left of bottom side
  bezierVertex(x, y + h, x, y + h, x, y + h - ry); //bottom left corner

  endShape(CLOSE);
}