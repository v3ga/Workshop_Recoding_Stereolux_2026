//------------------------------------------------------------
let format        = FORMAT_A3_MM;
let DPCM          = 20;
let filename      = "georg_nees_schotter";
let bDoExportSvg  = false;

//------------------------------------------------------------
function setup() 
{
  createCanvas(format[0]*DPCM/10, format[1]*DPCM/10); 
  setSvgResolutionDPCM(DPCM);
  noLoop();
}

//------------------------------------------------------------
async function draw() 
{
  background(240);
  noFill();
  randomSeed(12345);
  strokeWeight( mmToPx(0.5,DPCM*10) );
  rectMode(CENTER);
  
  if (bDoExportSvg)
    beginRecordSvg(this, null);

  // BEGIN DRAW

  let nColumns  = 12;
  let nRows     = 18;
  let margin    = 0.1*width;
  let dimSquares = (width-2*margin) / nColumns;
  let marginY    = (height-nRows*dimSquares)/2;

  push();
  for (let r=0; r<nRows; r++)
  {
      for (let c=0; c<nColumns; c++ )
      {
          let ampAngle = map(r,0,nRows-1, 0,PI/4);
          let dx = map(r,0,nRows-1, 0,30);
          let dy = map(r,0,nRows-1, 0,10);

          push();
          translate(dimSquares/2+margin+c*dimSquares, dimSquares/2+marginY + r*dimSquares);
          rotate(  random( -ampAngle, ampAngle ) );
          stroke(0);
          square(random(-dx,dx),random(-dy,dy), dimSquares);
          pop();
      }
    }
    pop();

  // END DRAW

  if (bDoExportSvg)
  {
    let strSVG = endRecordSvg();

    // vpype resizing
    let strSvgA3  = await vpype(strSVG, ['layout', '--fit-to-margins', '2cm', 'a3']);

    // vpype for hpgl export
    let strHPGL = await svgToHPGL(strSVG);

    // Save svg & hpgl
    saveSvg(`${filename}.svg`,    strSVG);
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
