//------------------------------------------------------------
let hpgl = "", isConnected = false;

//------------------------------------------------------------
let teHPGL, btnDraw, btnConnect;

//------------------------------------------------------------
function setup() 
{
  createCanvas(420*2, 297*2);
  createUI();
  createSerial();
  noLoop();
}

//------------------------------------------------------------
function draw()
{
    background(220);
    if (hpgl!="")
      drawHPGL(hpgl);
}

//------------------------------------------------------------
function createUI()
{
  let container = createDiv().id('column-right');
  teHPGL        = createElement('textarea').parent(container)

  let buttons   = createDiv().id('buttons').parent(container);
  btnDraw       = createButton('Draw HPGL').parent(buttons);
  btnConnect    = createButton("Connect to Serial Port").parent(buttons);
  btnPlot       = createButton("Plot").parent(buttons);

  btnConnect.mousePressed( async e => 
  {
    isConnected = await serialCo.connect();
    if (isConnected)
    {
      enableBtn(btnConnect,false);
      enableBtnPlot();
    }
  });

  btnPlot.mousePressed( async () => 
  {
    if (rolandDXY && hpgl != "")
    {
      enableBtn(btnPlot,     false);
      await rolandDXY.plot(hpgl);
      enableBtn(btnPlot,     true);
    }
  });


  btnDraw.mousePressed( () => { 
    hpgl = teHPGL.elt.value;
    redraw();
    enableBtnPlot();
  });


  enableBtn(btnConnect,     false);
  enableBtn(btnPlot,        false);
}

// ----------------------------------------------------------------
function enableBtnPlot()
{
  if (isConnected && hpgl!="")
    enableBtn(btnPlot, true);
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

