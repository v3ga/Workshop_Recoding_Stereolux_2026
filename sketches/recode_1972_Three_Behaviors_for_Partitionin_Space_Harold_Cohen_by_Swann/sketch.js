//------------------------------------------------------------
let format        = FORMAT_A3_MM;
let DPCM          = 20;
let filename      = "__template__";
let bDoExportSvg  = false;

let dots=[]
let lines=[]
let gridSpots=[] // All spots in the grid
let availableSpots=[]
let spotsToDelete=[]
let nD = 0
let nL = 0
let dice=[1,1,1,1,1,2,2,0,0,0] // Chances of branches forming, per observation of the original artwork
let baseDist = 100
let chainLengthTarget = 9

let grid = [29,35]


//------------------------------------------------------------
function setup() 
{
  createCanvas(format[0]*DPCM/10, format[1]*DPCM/10); 
  setSvgResolutionDPCM(20);
  noLoop();

  strokeWeight(2)

}

//------------------------------------------------------------
async function draw() 
{
  background(240);
  noFill();

  //randomSeed(1235)
  //noiseSeed(123)
  dots=[]
  lines=[]
  gridLocs=[]
  nD=0;
  nL=0;

  // Displays a grid to help seeing what's going on.
  displayGrid(false)

  if (bDoExportSvg)
    beginRecordSvg(this, null);
  // BEGIN DRAW


  
  push()
    translate((width-(grid[0]-1)*20)/2+5,(height-(grid[1]-1)*20)/2+5)

    // Recursive function. Everything is in here.
    placeDot(nD,floor(random(grid[0]/2-5,grid[0]/2+5)), floor(random(grid[1]/2-5,grid[1]/2+5)), 0)

    // For debug purposes. Highlights the last array of possible spots for the last dot created. 
    displayLastPossibleSpots(false)

    stroke(0)
    for(let d=0; d<dots.length; d++){
      dots[d].show()
    }
    for(let l=0; l<lines.length; l++){
      lines[l].show()
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


function displayGrid(b){
  
  push()
    translate((width-(grid[0]-1)*20)/2+5,(height-(grid[1]-1)*20)/2+5)


    for(let y=0; y<grid[1]; y++){
      for(let x=0; x<grid[0]; x++){
        if (b==true){
          stroke(255,250,250)
          circle(x*15+(x-1)*5,y*15+(y-1)*5,15)
        }
        append(gridLocs,0)
      }
    }
  pop()
}

function displayLastPossibleSpots(b){
  if (b==true){
    for(let y=0; y<grid[1]; y++){
      for(let x=0; x<grid[0]; x++){
        const index = availableSpots.indexOf(y*grid[0]+x)
        if (index>-1){
          stroke(255,150,150)
          circle(x*15+(x-1)*5,y*15+(y-1)*5,10)
        }
      }
    }
  }
}
