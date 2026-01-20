// ----------------------------------------------------------------
let myRandomSeed  = 12345;
let bDoExport     = false;
const DPCM        = 20; // Dots per cm for SVG export

// ----------------------------------------------------------------
async function setup() 
{
  createCanvas(FORMAT_A3_MM[0]*DPCM/10, FORMAT_A3_MM[1]*DPCM/10);
  setSvgResolutionDPCM(DPCM);
  createButtons();
}

// ----------------------------------------------------------------
async function draw()
{
  randomSeed(myRandomSeed);
  background(240);

  if (bDoExport)
    beginRecordSvg(this, null);

  strokeWeight( mmToPx(0.5) );
  let xprev,yprev,margin = 0.1*width;
  for (let i=0;i<50;i++)
  {
    let x = map(random(),0,1,margin,width-margin);
    let y = map(random(),0,1,margin,height-margin);
    if (xprev && yprev)
      line(xprev,yprev,x,y);
    xprev=x;
    yprev=y;
  }
  let strSvg    = endRecordSvg();

  if (bDoExport)
  {
    // Resize A4
    let strSvg01  = await vpype(strSvg, ['layout', '--fit-to-margins', '2cm', 'a4']);
    saveSvg('output_vpype_01.svg', strSvg01);

    // Resize A3 / landscape with margins
    let strSvg02  = await vpype(strSvg, ['rotate', '--', '-90', 'layout', '--fit-to-margins', '4cm', '--landscape', 'a4']);
    saveSvg('output_vpype_02.svg', strSvg02);

    // HPGL
    let strHPGL  = await svgToHPGL(strSvg);
    saveHPGL('output_vpype.hpgl', strHPGL);  

    bDoExport = false;
  }
}

// ----------------------------------------------------------------
function createButtons()
{
  let btnExport = createButton('Export');
  btnExport.mousePressed( _ => {
    bDoExport = true;
    redraw();
  });
}
