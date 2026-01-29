//------------------------------------------------------------
let format        = FORMAT_A3_MM;
let DPCM          = 20;
let filename      = "roger_coqart";
let bDoExportSvg  = false;


let dim = 8
let sizeSq = 20
let gap

//------------------------------------------------------------
function setup() 
{
  createCanvas(format[0]*DPCM/10, format[1]*DPCM/10); 
  setSvgResolutionDPCM(20);
  noLoop();

  gap = .5*.95*sizeSq
}

//------------------------------------------------------------
async function draw() 
{
  background(240);
  noFill();

  if (bDoExportSvg)
    beginRecordSvg(this, null);

  // BEGIN DRAW


  rectMode(CENTER)
  stroke(0)
  push()
    translate(width/2,height/2)

    squareWithLevel(0,0,0)

    for (let d=1; d<=dim;d++){
      for (let s=1; s<=d;s++){
        squareWithLevel(d*gap+d*sizeSq,s*gap+s*sizeSq,d)
        squareWithLevel(d*gap+d*sizeSq,-s*gap-s*sizeSq,d)
        squareWithLevel(-d*gap-d*sizeSq,s*gap+s*sizeSq,d)
        squareWithLevel(-d*gap-d*sizeSq,-s*gap-s*sizeSq,d)
      }
      for (let s=1; s<d;s++){
        squareWithLevel(s*gap+s*sizeSq,d*gap+d*sizeSq,d)
        squareWithLevel(s*gap+s*sizeSq,-d*gap-d*sizeSq,d)
        squareWithLevel(-s*gap-s*sizeSq,d*gap+d*sizeSq,d)
        squareWithLevel(-s*gap-s*sizeSq,-d*gap-d*sizeSq,d)
      }
      squareWithLevel(d*gap+d*sizeSq,0,d)
      squareWithLevel(-d*gap-d*sizeSq,0,d)
      squareWithLevel(0,d*gap+d*sizeSq,d)
      squareWithLevel(0,-d*gap-d*sizeSq,d)

    }

  pop()







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

function squareWithLevel(x,y,d){
  square(x,y,sizeSq)
  let seq = [0,0,0,0,0,0,0,0];
  if(d>0){
    for(let s=0; s<d;s++){ seq[s]=1 }
    shuffle(seq,true)
  }
  if(seq[0] == 1) line(x-sizeSq/2,y,x+sizeSq/2,y) // Ligne horizontale
  if(seq[1] == 1) line(x,y-sizeSq/2,x,y+sizeSq/2) // Ligne verticale
  if(seq[2] == 1) line(x-sizeSq/2,y-sizeSq/2,x+sizeSq/2,y+sizeSq/2) // Diag inv
  if(seq[3] == 1) line(x-sizeSq/2,y+sizeSq/2,x+sizeSq/2,y-sizeSq/2) // Diag
  if(seq[4] == 1) line(x-sizeSq/2,y,x,y-sizeSq/2) // Mini diag
  if(seq[5] == 1) line(x-sizeSq/2,y,x,y+sizeSq/2) // Mini diag
  if(seq[6] == 1) line(x+sizeSq/2,y,x,y+sizeSq/2) // Mini diag
  if(seq[7] == 1) line(x+sizeSq/2,y,x,y-sizeSq/2) // Mini diag
}