/* 
Part of the ReCode Project (http://recodeproject.com)
Based on "Zup Tze 30" by Paul Shao
Originally published in "Computer Graphics and Art" vol3 no2, 1978
Copyright (c) 2012 Michael Price - OSI/MIT license (http://recodeproject/license).
*/

//------------------------------------------------------------
const LINE_WIDTH = 1; 
let filename = "Zup_Tze_30-Paul_Shao-1978";
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
  drawCrossMatrix(69, 50, 150, 6, 6);

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

//------------------------------------------------------------
// Draws a single cross.
function drawCross(left, top, dim, thickness) {
  let offset_1 = dim/2 - thickness/2;
  let offset_2 = offset_1 + thickness;
  let offset_3 = dim;
  beginShape();
  vertex(left + offset_1, top);
  vertex(left + offset_2, top);
  vertex(left + offset_2, top + offset_1);
  vertex(left + offset_3, top + offset_1);
  vertex(left + offset_3, top + offset_2);
  vertex(left + offset_2, top + offset_2);
  vertex(left + offset_2, top + offset_3);
  vertex(left + offset_1, top + offset_3);
  vertex(left + offset_1, top + offset_2);
  vertex(left,            top + offset_2);
  vertex(left,            top + offset_1);
  vertex(left + offset_1, top + offset_1);
  vertex(left + offset_1, top);
  endShape(CLOSE);
}

//------------------------------------------------------------
// Draw a stack of crosses.
function drawCrossWithDecay(left, top, base_dim, num_decay,
                        dpos, ddim, dthickness) {
  let thickness = base_dim/3;
  let dim = base_dim;
  let curleft = left;
  let curtop = top;
  for (let i = 0; i < num_decay; i++) {
    drawCross(curleft, curtop, dim, int(thickness));
    curleft += dpos.x + ddim/2;
    curtop += dpos.y + ddim/2;
    dim -= ddim;
    thickness -= dthickness;
  }
}

function drawCrossMatrix(dim, left, top, rows, cols) {
  let thickness = dim/3;
  let dp1 = createVector(0,-1);
  let dp2 = createVector(1,0);
  let dp;
  for (let i = 0; i < rows; i++) {
    let rleft = left + i * thickness;
    let rtop = top + i * 2 * thickness;
    for (let j = 0; j < cols; j++) {
      dp = i%2==0?dp1:dp2;
      dp.mult(-1);
      drawCrossWithDecay(rleft + thickness * 2 *j, rtop - thickness * j, dim, 5, dp, 4, 4.5);
    } 
  }
}

