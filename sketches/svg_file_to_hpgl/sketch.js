// ----------------------------------------------------------------
let teSVG, teHPGL;

// ----------------------------------------------------------------
async function setup() 
{
  noCanvas();
  let containerTextAreas  = createDiv().id("textareas");
  let containerBtns       = createDiv().id("btns");
  teSVG                   = createElement('textarea').parent(containerTextAreas);
  teHPGL                  = createElement('textarea').parent(containerTextAreas);
  btnConvert              = createButton('svg tp hpgl').parent(containerBtns);
  
  btnConvert.mousePressed( async _=>
  {
    if (teSVG.elt.value != "")
    {
      let hpgl = await svgToHPGL(teSVG.elt.value);
      teHPGL.elt.value = hpgl;
    }
  })

  background(220);
}

