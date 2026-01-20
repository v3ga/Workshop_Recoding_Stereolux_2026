/* 
Part of the ReCode Project (http://recodeproject.com)
Based on "Random Squares" by Charles Csuri
Originally published in "Computer Graphics and Art" vol1 no2, 1976
Copyright (c) 2012 Chris Allick - OSI/MIT license (http://recodeproject/license).
*/

//------------------------------------------------------------
let filename = "__template__";
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
  noFill();
  let margin = 0.15 * width;
  rect(margin,margin,width-2*margin,height-2*margin);

  if (bDoExportSvg)
  {
    let strSVG = endRecordSvg();

    // vpype resizing
    let strSvgA3  = await vpype(strSVG, ['layout', '--fit-to-margins', '2cm', 'a3']);

    //console.log(strSvgA3)
    // vpype for hpgl export
    let strHPGL = await svgToHPGL(strSVG);

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
