//------------------------------------------------------------
let myRandomSeed = 12345;
let bDoExportSvg = false;
let format       = FORMAT_A4_MM;
let DPCM         = 20;

//------------------------------------------------------------
// https://axidraw.com/doc/py_api/#options-general
let myAxiDrawOptions = 
{
  'model'         : 6, // https://axidraw.com/doc/py_api/#model
  'penlift'       : 3, // https://axidraw.com/doc/py_api/#penlift
  'speed_pendown' : 40, 
  'speed_penup'   : 60
}

//------------------------------------------------------------
async function setup() 
{
  createCanvas(format[0]*2,format[1]*2);
  createButtons();
  setSvgResolutionDPCM(DPCM);
  noLoop();

  // Infos about Axidraw CLI
  await call('axidraw/version');
}

//------------------------------------------------------------
async function draw() 
{
  randomSeed(myRandomSeed); 
  background(240);

  if (bDoExportSvg)
  {
    beginRecordSVG(this, null);
  }

  stroke(0);
  strokeWeight( mmToPx(0.7, DPCM*10) );

  let margin = 0.1*width,prevx,prevy;
  for (let i=0;i<50;i++)
  {
    let x1 = prevx??random(margin,width-margin);
    let y1 = prevy??random(margin,height-margin);
    let x2 = random(margin,width-margin);
    let y2 = random(margin,height-margin);

    line(x1,y1,x2,y2);

    prevx = x2;
    prevy = y2;
  }

  if (bDoExportSvg)
  {
      let strSvg = endRecordSvg();

      if (command == 'plot')
        await call('axidraw/plot', myAxiDrawOptions, {'svg':strSvg});
      else if (command == 'svg')
        saveSvg(`plot_send_to_axidraw_${myRandomSeed}.svg`, strSvg);

      bDoExportSvg  = false;
      command = "";
  }
}

//------------------------------------------------------------
function createButtons()
{
    // A bit of UI
    regenerateButton = createButton('Regenerate');
    regenerateButton.mousePressed(regenerate);

    saveFileButton = createButton('Save .svg');
    saveFileButton.mousePressed( _ => {
      bDoExportSvg  = true;
      command       = 'svg';
      redraw();
    }
    );

    toggleButton = createButton('Toggle Up/Down');
    toggleButton.mousePressed( async _=> await call('axidraw/toggle', myAxiDrawOptions) );

    cycleButton = createButton('Cycle Up/Down');
    cycleButton.mousePressed( async _=> await call('axidraw/cycle', myAxiDrawOptions) );

    turnoffButton = createButton('Turn off motors');
    turnoffButton.mousePressed( async _=> await call('axidraw/align', myAxiDrawOptions) );

    plotButton = createButton('Plot');
    plotButton.mousePressed( _ => {
      bDoExportSvg  = true;
      command       = 'plot';
      redraw();
    });
}

//------------------------------------------------------------
// Make a new random seed when the "Regenerate" button is pressed
function regenerate(){
  myRandomSeed = round(millis()); 
  redraw();
}

//------------------------------------------------------------
// Set the SVG to be exported when the "Export SVG" button is pressed
function initiatePlot(){
  bDoExportSvg = true; 
}