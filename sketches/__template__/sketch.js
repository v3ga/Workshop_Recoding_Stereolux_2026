//------------------------------------------------------------
let format        = FORMAT_A3_MM;
let DPCM          = 20;
let filename      = "__template__";
let bDoExportSvg  = false;

//------------------------------------------------------------
function setup() 
{
  createCanvas(format[0]*DPCM/10, format[1]*DPCM/10); 
  setSvgResolutionDPCM(20);
  noLoop();
}

//------------------------------------------------------------
async function draw() 
{
  background(240);
  noFill();

  if (bDoExportSvg)
    beginRecordSvg(this, null);

  // BEGIN DRAW

  // END DRAW

  if (bDoExportSvg)
  {
    let strSVG = endRecordSvg();

    // vpype resizing
    let strSvgA3  = await vpype(strSVG, ['layout', '--fit-to-margins', '2cm', 'a3']);

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
