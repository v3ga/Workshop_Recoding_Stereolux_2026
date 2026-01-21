// ----------------------------------------------------------------
let myRandomSeed  = 123456;
let format        = FORMAT_A3_MM;
let DPCM          = 20; // Dots per cm

// ----------------------------------------------------------------
let serialCo;
let rolandDXY;
let strSvg;
let btnConnect, btnGenerateNew, btnPlot;

// ----------------------------------------------------------------
function setup() 
{
  createCanvas(format[0]*DPCM/10, format[1]*DPCM/10);
  setSvgResolutionDPCM(DPCM);
  createButtons();
  createSerial();
  noLoop();
}

// ----------------------------------------------------------------
function draw() 
{
  background(220);
  randomSeed(myRandomSeed);
  beginRecordSvg(this, null);
  strokeWeight( mmToPx(0.5, DPCM*10) );

  let xprev,yprev,margin = 0.1*width;
  for (let i=0;i<30;i++)
  {
    let x = map(random(),0,1,margin,width-margin);
    let y = map(random(),0,1,margin,height-margin);
    if (xprev && yprev)
      line(xprev,yprev,x,y);
    xprev=x;
    yprev=y;
  }

  strSvg = endRecordSvg();
}

// ----------------------------------------------------------------
function createButtons()
{
  btnConnect    = createButton("Connect to Serial Port");
  enableBtn(btnConnect,     false);
  btnConnect.mousePressed( async e => 
  {
    let isConnected = await serialCo.connect();
    if (isConnected)
    {
      enableBtn(btnConnect,false);
      enableBtn(btnPlot);
    }
  });

  btnGenerateNew = createButton("Generate new");
  btnGenerateNew.mousePressed( _=>{
    myRandomSeed = round(millis());
    redraw();
  })

  btnPlot = createButton("Plot");
  enableBtn(btnPlot,     false);
  btnPlot.mousePressed( async () => 
  {
    if (strSvg && rolandDXY)
    {
      enableBtn(btnPlot,     false);

      let hpgl = await svgToHPGL(strSvg);
      await rolandDXY.plot(hpgl);

      enableBtn(btnPlot,     true);
    }
  });
}

// ----------------------------------------------------------------
function createSerial()
{
  // Serial connection + Plotter instance
  serialCo = new SerialConnection();
  if (SerialConnection.isAvailable())
  {
    rolandDXY = new PlotterRolandDXY( serialCo );
    enableBtn(btnConnect);
  }
}
