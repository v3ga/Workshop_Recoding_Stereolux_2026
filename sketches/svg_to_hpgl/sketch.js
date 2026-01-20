// ----------------------------------------------------------------
let teHPGL;

// ----------------------------------------------------------------
async function setup() 
{
  createCanvas(29.7*20, 42.0*20);
  setSvgResolutionDPCM(20);
  teHPGL  = createElement('textarea');


  background(220);
  beginRecordSvg(this, null);

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
  let strSvg = endRecordSvg();

  let hpgl = await svgToHPGL(strSvg);
  if (hpgl)
    teHPGL.elt.value = hpgl;
}

