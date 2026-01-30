//------------------------------------------------------------
let format        = FORMAT_A3_MM;
let DPCM          = 20;
let filename      = "__template__";
let bDoExportSvg  = false;

// ----------------------------------------------
let nb               = 2; // number of isogrids
let resGrid          = 40; // number of cells per grid
let isogrids         = [];
let fillMode         = 'none'; // 'none', 'hatch'

//------------------------------------------------------------
function setup() 
{
  createCanvas(1000, 1000); 
  setSvgResolutionDPCM(20);
  noLoop();
  randomSeed(1234);

  let marginPx        = 0.05*width;
  let dimGrid         = width-2*marginPx;

    for (let i=0; i<nb; i++)
    {
      let isogrid = new Isogrid(marginPx,marginPx,dimGrid,dimGrid,resGrid);
      isogrid.compute();
      isogrids.push(isogrid);
    }  

}

//------------------------------------------------------------
async function draw() 
{
  background(0);

  if (bDoExportSvg)
    beginRecordSvg(this, null);

  // BEGIN DRAW
  let nbHatches = [5,7]
  isogrids.forEach( (isogrid,i) => 
  {
    isogrid.setDrawRect(false).draw(2, false, true, nbHatches[i%nbHatches.length]) 
  })

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
