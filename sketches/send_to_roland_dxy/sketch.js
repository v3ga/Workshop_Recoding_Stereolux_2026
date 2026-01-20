// ----------------------------------------------------------------
let DPCM    = 20; // Dots per cm
let format  = FORMAT_A3_MM;

// ----------------------------------------------------------------
let serialCo;
let rolandDXY;
let strSvg;
let btnConnect, btnPlot;

// ----------------------------------------------------------------
function setup() 
{
  createCanvas(format[0]*DPCM/10, format[1]*DPCM/10);
  setSvgResolutionDPCM(DPCM);
  noLoop();
  
  // UI
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

  // Serial connection + Plotter instance
  serialCo = new SerialConnection();
  if (SerialConnection.isAvailable())
  {
    rolandDXY = new PlotterRolandDXY( serialCo );
    enableBtn(btnConnect);
  }


}

// ----------------------------------------------------------------
function draw() 
{
  background(220);
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
function mousePressed()
{
  redraw();
}

// ----------------------------------------------------------------
function enableBtn(btn, is=true)
{
    btn.elt.disabled = !is;
}