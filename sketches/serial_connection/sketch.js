
// ----------------------------------------------------------------
let serialCo;
let btnConnect, btnDimensions;

// ----------------------------------------------------------------
async function setup() 
{
  createCanvas(400, 400);
  
  // Some UI
  btnConnect    = createButton("Connect to Serial Port");
  btnDimensions = createButton("Roland DXY dimensions");
  enableBtn(btnConnect,     false);
  enableBtn(btnDimensions,  false);


  // Handlers
  btnDimensions.mousePressed( async () => 
  {
    let dim = await serialCo.write("OW;", true);
    console.log(dim)
  })

  btnConnect.mousePressed( async () => 
  {
    let isConnected = await serialCo.connect();
    if (isConnected)
    {
      enableBtn(btnConnect,false);
      enableBtn(btnDimensions,true);
    }
  });

  // Serial connection
  serialCo = new SerialConnection();
  if (SerialConnection.isAvailable())
    enableBtn(btnConnect);

}

// ----------------------------------------------------------------
function draw() {
  background(220);
}

// ----------------------------------------------------------------
function enableBtn(btn, is=true)
{
    btn.elt.disabled = !is;
}

