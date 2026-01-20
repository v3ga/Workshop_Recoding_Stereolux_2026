/*
A Million Random Digits with 100,000 Normal Deviates
https://www.rand.org/pubs/monograph_reports/MR1418.html
*/

// ----------------------------------------
async function setup() 
{
  // Random init
  let PRNG = new RandTableRNG();
  await PRNG.create(
    {
      'line' : int( random(0,10000) ), 
      'col'  : int( random(0,50) )
    });
  
  // Aliases
  let random_dec = PRNG.nextFloat.bind(PRNG); // shortcut
  
  // Drawing
  createCanvas(297*2, 420*2);
  noLoop();

  background(240);
  let xprev,yprev,margin = 50;
  for (let i=0;i<50;i++)
  {
    let x = map(random_dec(),0,1,margin,width-margin);
    let y = map(random_dec(),0,1,margin,height-margin);
    if (xprev && yprev)
      line(xprev,yprev,x,y);
    xprev=x;
    yprev=y;
  }

}


// ----------------------------------------
class RandTableRNG 
{
  async create(options={})
  {
    let response     = await fetch('digits.txt');
    let data_raw     = await response.text();
    this.lines       = data_raw.trim().split('\n').map(line => 
    {
        const parts = line.trim().split(/\s+/);
        return parts.slice(1).join(''); // 50 chiffres
    });
  
    this.line        = options.line ?? 0;      // 0–19999
    this.col         = options.col ?? 0;       // 0–49  

    return this;
  }

  nextDigit() 
  {
    // TODO : provide callback to regenerate line / col positions ?
    if (this.line >= this.lines.length) {
      throw new Error("End of random digit table");
    }

    const digit = parseInt(this.lines[this.line][this.col], 10);

    this.col++;
    if (this.col >= 50) {
      this.col = 0;
      this.line++;
    }

    return digit;
  }  
    
  nextNDigits(n) 
  {
    let value = "";
    for (let i = 0; i < n; i++)
      value += this.nextDigit();
    return parseInt(value, 10);
  }    
    
  nextFloat() {
    return this.nextNDigits(5) / 100000;
  }
    
}


