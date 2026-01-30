//------------------------------------------------------------
let format        = FORMAT_A3_MM;
let DPCM          = 20;
let filename      = "Recode_Theoritical_Projection_Space";
let bDoExportSvg  = false;

// ----------------------------------------------
let nb               = 2; // number of isogrids
let resGrid          = 40; // number of cells per grid
let isogrids         = [];
let fillMode         = 'none'; // 'none', 'hatch'

//------------------------------------------------------------
function setup() 
{
  createCanvas(400*2, 400*2); 
  setSvgResolutionDPCM(20);
  noLoop();
  //randomSeed(1234);

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
  let nbHatches = [5,9]
  isogrids.forEach( (isogrid,i) => 
  {
    isogrid.setDrawRect(false).draw(2, false, true, nbHatches[i%nbHatches.length]) 
  })

  // END DRAW
  if (bDoExportSvg)
  {
    let strSVG = endRecordSvg();

    // Save svg & hpgl
    saveSvg(`${filename}.svg`,    strSVG);

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
