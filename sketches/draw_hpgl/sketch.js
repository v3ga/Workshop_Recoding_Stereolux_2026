//------------------------------------------------------------
let hpgl = "";

//------------------------------------------------------------
let teHPGL, btnDraw;

//------------------------------------------------------------
function setup() 
{
  createCanvas(420*2, 297*2);
  
  noLoop();

  // UI
  let container = createDiv().id('column-right');
  teHPGL  = createElement('textarea').parent(container)
  btnDraw = createButton('Draw HPGL').parent(container);
  btnDraw.mousePressed( () => { 
    hpgl = teHPGL.elt.value;
    redraw();
  });
}

//------------------------------------------------------------
function draw()
{
    background(220);
    if (hpgl!="")
      drawHPGL(hpgl);
}

