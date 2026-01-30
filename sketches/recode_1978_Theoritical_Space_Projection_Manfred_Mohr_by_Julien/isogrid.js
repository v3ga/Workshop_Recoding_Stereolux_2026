// ----------------------------------------------
class Isogrid
{
  constructor(x,y,w,h,res,opts={'bDrawRect':true, 'bDrawSquareIndexes':false})
  {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.res = res;
    this.bDrawRect      = opts.bDrawRect??true;
    this.bDrawContour   = opts.bDrawContour??false; 
  
    this.vertices         = []; // grid vertices
    this.values           = []; // grid values
  
    this.step = this.w / res; // assume w=h ... 
    
    this.col = color(255); 
  
    for (let j=0; j<res+1; j++)
      for (let i=0; i<res+1; i++)
      {
        let offset = i + j*(this.res+1);
        this.vertices[offset] = createVector(this.x+i*this.step, this.y+j*this.step);
        this.values[offset] = 0;
      }  
  }

  // ----------------------------------------------
  setColor(col){this.col = col};
  
  // ----------------------------------------------
  compute(opts={'val':1.0,'rndMax':0.4})
  {
    let nVerticesRow = this.res+1;
    let val = opts.val??1;
    for (let j=0; j<nVerticesRow; j++)
      for (let i=0; i<nVerticesRow; i++)
      {
        let offset = i + j*nVerticesRow;
        if (random() < opts.rndMax??0.4)
        {
          this.values[offset] += val;
          this.values[offset+1] += val;
          this.values[offset+nVerticesRow] += val;
          this.values[offset+nVerticesRow+1] += val;
        }
      }  

    // Close the grid = put 0 on edges
    // Easier to handle when computing lines ... 
    for (let j=0; j<nVerticesRow; j++)
    {
        let offset_0    = 0 + j*nVerticesRow;
        let offset_end  = nVerticesRow-1 + j*nVerticesRow;

        this.values[offset_0] = 0;
        this.values[offset_end] = 0;
    }
  }

  // ----------------------------------------------
  setDrawRect(is=true)
  {
    this.bDrawRect=is;
    return this;
  }
  // ----------------------------------------------
  draw(isovalue, bDrawContours= false, bDrawHatches=true, nHatches=5)
  {
    let n = nHatches;

    push();
    noFill();
    stroke(this.col);
    if (this.bDrawRect)
        rect(this.x,this.y,this.w,this.h);
    
    // Debug
    if (this.bDrawSquareIndexes)
    {
        this.drawGrid(true,isovalue);
    }

    // Hatch
    if (bDrawHatches)
    {
        let modulate = (P,si,x,y,yL,bUpper) => 
        {
        let R = this.step/2;
        if (si == 1)
        {
            let delta = sqrt(max(0,R*R - (yL-y)*(yL-y)));       
            P.x = x+delta;
        }
        else if (si == 2)
        {
            let delta = sqrt(max(0,R*R - (yL-y)*(yL-y)));       
            P.x = x+this.step-delta;
        }
        else if (si == 4)
        {
            let delta = sqrt(max(0,R*R - (y+this.step-yL)*(y+this.step-yL)));       
            P.x = x+this.step-delta;
        }
        else if (si == 5)
        {
            if (bUpper)
            {
            let delta = sqrt(max(0,R*R - (yL-y)*(yL-y)));       
            P.x = x+delta;
            }
            else 
            {
            let delta = sqrt(max(0,R*R - (y+this.step-yL)*(y+this.step-yL)));       
            P.x = x+this.step-delta;
            }
        }
        else if (si == 7)
        {
            let delta = sqrt(max(0,R*R - (y+this.step-yL)*(y+this.step-yL)));  
            P.x = x+delta;
        }
        else if (si == 8)
        {
            let delta = sqrt(max(0,R*R - (y+this.step-yL)*(y+this.step-yL)));       
            P.x = x+delta;
        }
        else if (si == 10)
        {
            if (bUpper)
            {
            let delta = sqrt(max(0,R*R - (yL-y)*(yL-y)));       
            P.x = x+this.step-delta;
            }
            else
            {
            let delta = sqrt(max(0,R*R - (y+this.step-yL)*(y+this.step-yL)));       
            P.x = x+delta;
            }
        }
        else if (si == 11)
        {
            if (!bUpper)
            {
                let delta = sqrt(max(0,R*R - (y+this.step-yL)*(y+this.step-yL)));       
                P.x = x+this.step-delta;
            }
        }
        else if (si == 13)
        {
            if (bUpper)
            {
                let delta = sqrt(max(0, R*R - (yL-y)*(yL-y)));       
                P.x = x+this.step-delta;
            }
        }
        else if (si == 14)
        {
            let delta = sqrt(max(0,R*R - (yL-y)*(yL-y)));  
            P.x = x+delta;
        }
        return P;
        }
        for (let j=0;j<this.res;j++)
        {

            // y for cell
            let y = this.y + j*this.step;                    
        
            // Scan everyline along y-axis
            for (let k=0; k<n; k++)
            {
                // y for ray / line 
                let yL = map(k,0,n-1,y,y+this.step);
                
                // Multiple segments per "line"
                let segments = [];      
                let A = null;
                let B = null;
                for (let i=0; i<this.res; i++)
                {
                    // x for cell
                    let x  = this.x + i*this.step;   

                    // Square index for this celle
                    let si = this.getSquareIndex(i,j,isovalue);
                
                    // Upper cell
                    if (k<=floor(n/2))
                    {
                        // squareIndex in [2,6,10,14] -> start a line
                        if ( [2,6,10,14].includes(si) )
                        {
                            A = createVector(x + this.step/2,yL);
                            A = modulate(A, si, x,y, yL, true);
                            B = createVector(x+this.step ,yL);
                        }
                        // Inside cell -> go ahead with B
                        else if ([3,7,11,12,15].includes(si))
                        {
                            if (B) B.x = x+this.step;
                        }
                        // Ending -> close line
                        else if ([1,5,9,13,14].includes(si))
                        {
                            if (A && B)
                            {
                                B.x = x+this.step/2;
                                B = modulate(B,si,x,y,yL, true);
                                if (dist(A.x,A.y,B.x,B.y)>=2)
                                  segments.push( [A,B] );
                                A = B = null; // eol
                            }
                        }
                    }

                    // Bottom cell
                    else
                    {
                        if ([4,5,6,7].includes(si))
                        {
                            A = createVector(x + this.step/2,yL);
                            A = modulate(A, si, x,y, yL, false);
                            B = createVector(x+this.step,yL);
                        }
                        
                        else if ([12,13,14,15].includes(si))
                        {
                            if (B) B.x = x+this.step;
                        }
                        else if ([5,8,9,10,11].includes(si))
                        {
                            if (A && B)
                            {
                                B.x = x+this.step/2;
                                B = modulate(B,si,x,y,yL, false);
                                if (dist(A.x,A.y,B.x,B.y)>=2)
                                  segments.push(  [A,B] );

                                A = B = null; // eol
                            }
                        }

                    }
                }
                
                // Draw each segments for a "line"    
                stroke(this.col);
                segments.forEach( segment => 
                {
                    line(segment[0].x,segment[0].y,segment[1].x,segment[1].y);  
                });
            }
    
        }
    }

    if (bDrawContours)
    {
        this.drawCells(isovalue, 'none');
    }

    pop();
  } 
  

  // ----------------------------------------------
  // fillMode = 'none' ou 'fill' ou 'hatch'
  drawCells(isovalue, fillMode='none')
  {
    push();
    if (fillMode=='none')
    {
      noFill();
      stroke(this.col);
    }
    else if (fillMode=='fill')
    {
      fill(this.col);
      noStroke();
      rectMode(CORNERS);
    }
      
    let s = this.step;
  
    for (let j=0; j<this.res; j++)
      for (let i=0; i<this.res; i++)
      {
        let si = this.getSquareIndex(i,j,isovalue);
        let A = this.getVertex(i,j);      
        let B = this.getVertex(i+1,j);      
        let C = this.getVertex(i+1,j+1);      
        let D = this.getVertex(i,j+1);  
        
        // if (i==0 && j==0) console.log(A,B)

        // Empty cell
        if (si==0)
        {
        }
        else if (si==1)
        {
          arc(A.x,A.y,s,s,0,PI/2);
        }
        else if (si==2)
        {
          arc(B.x,B.y,s,s,PI/2,PI);
        }
        else if (si==3)
        {
          let mAD = middle(A,D);
          let mBC = middle(B,C);
          if (fillMode == 'fill')
            rect(Math.floor(A.x),Math.floor(A.y),Math.ceil(mBC.x),Math.ceil(mBC.y));
          else
            line(mAD.x,mAD.y,mBC.x,mBC.y);
        }
        else if (si==4)
        {
          arc(C.x,C.y,s,s,PI,3*PI/2);
        }
        else if (si==5)
        {
          arc(A.x,A.y,s,s,0,PI/2);
          arc(C.x,C.y,s,s,PI,3*PI/2);
        }
        else if (si==6)
        {
          let mAB = middle(A,B);
          let mCD = middle(C,D);
          if (fillMode == 'none')
            line(mAB.x,mAB.y,mCD.x,mCD.y);
          else if (fillMode == 'fill')
            rect(Math.floor(mAB.x),Math.floor(mAB.y),Math.ceil(C.x),Math.ceil(C.y));
        }
        else if (si==7)
        {
          let angleStart = -PI/2;
          let angleEnd   = 0;
          
          if (fillMode == 'none')
            arc(D.x,D.y,s,s,angleStart,angleEnd);
          else if (fillMode == 'fill')
          {
              beginShape();
              vertex(A.x,A.y);
              vertex(B.x,B.y);
              vertex(C.x,C.y);
              this.arcVertices(D,step,angleStart,angleEnd);
              endShape(CLOSE);             
          }
        }
        else if (si==8)
        {
          arc(D.x,D.y,s,s,-PI/2,0);

        }
        else if (si==9)
        {
          let mAB = middle(A,B);
          let mCD = middle(C,D);
          if (fillMode == 'none')
            line(mAB.x,mAB.y,mCD.x,mCD.y);
          else if (fillMode == 'fill')
             rect(Math.floor(A.x),Math.floor(A.y),Math.ceil(mCD.x),Math.ceil(mCD.y));
        }
        else if (si==10)
        {
          arc(B.x,B.y,s,s,PI/2,PI);
          arc(D.x,D.y,s,s,-PI/2,0);
        }
        else if (si==11)
        {
          let angleStart = PI;
          let angleEnd   = 3*PI/2;
          if (fillMode == 'none')
            arc(C.x,C.y,s,s,angleStart,angleEnd);
          else if (fillMode == 'fill')
          {
              beginShape();
              vertex(A.x,A.y);
              vertex(B.x,B.y);
              this.arcVertices(C,step,angleStart,angleEnd);
              vertex(D.x,D.y);
              endShape(CLOSE);
          }
        }
        else if (si==12)
        {
          let mAD = middle(A,D);
          let mBC = middle(B,C);
          if (fillMode == 'fill')
            rect(Math.floor(mAD.x),Math.floor(mAD.y),Math.ceil(C.x),Math.ceil(C.y));
          else 
            line(mAD.x,mAD.y,mBC.x,mBC.y);
        }
        else if (si==13)
        {
          let angleStart = PI/2;
          let angleEnd = PI;
          if (fillMode == 'none')
            arc(B.x,B.y,s,s,angleStart,angleEnd);
          else if (fillMode == 'fill')
          {
              beginShape();
              vertex(A.x,A.y);
              this.arcVertices(B,s,angleStart,angleEnd);
              vertex(C.x,C.y);
              vertex(D.x,D.y);
              endShape(CLOSE);
            
          }
        }
        else if (si==14)
        {
          let angleStart = 0;
          let angleEnd = PI/2;
          if (fillMode == 'none')
            arc(A.x,A.y,s,s,angleStart,angleEnd);
          else if (fillMode == 'fill')
          {
              beginShape();
              this.arcVertices(A,s,angleStart,angleEnd);
              vertex(B.x,B.y);
              vertex(C.x,C.y);
              vertex(D.x,D.y);
              endShape(CLOSE);
          }
        }
        else if (si == 15)
        {
          if (fillMode == 'fill')
            rect(Math.floor(A.x),Math.floor(A.y),Math.ceil(C.x),Math.ceil(C.y));
        }
      }
    pop();
  }

  // ----------------------------------------------
  arcVertices(pos, step, angleStart, angleEnd)
  {
    for (let angle=angleEnd; angle>=angleStart; angle-=PI/20)
      vertex( pos.x+0.5*step*cos(angle), pos.y+0.5*step*sin(angle));
  }

  // ----------------------------------------------
  drawGrid(bValues=true, isovalue, opts={'bDrawVertexIndex':false})
  {
    push();
    noFill();
    
    let step = this.w/this.res;
    let nPoints = this.res+1;
    for (let j=0; j<nPoints-1; j++)
        for (let i=0; i<nPoints-1; i++)
        {
            let offset = i + j*nPoints;
            let v = this.vertices[offset];
            stroke(this.col,20)
            rect(v.x,v.y,step,step);
        
            if (bValues)
            {
                let si = this.getSquareIndex(i,j,isovalue);
                push();
                fill(this.col, 10);
                text(`${si}`,v.x+step/2-3,v.y+step/2+2);
                textSize(8);
                fill(255,5)
                text(`(${i},${j})`,v.x+step/2-3,v.y+step/2+12);
                pop();
            }
        }

    if (bValues && opts['bDrawVertexIndex'])
    {
      for (let j=0; j<nPoints; j++)
        for (let i=0; i<nPoints; i++)
        {
          let offset = i + j*nPoints;
          let v = this.vertices[offset];
          fill(this.col,100);
          text(`${this.values[offset]}`,v.x-3,v.y-2);
        }
      pop();
    }
}
  
  
  // ----------------------------------------------
  getVertex(i,j)
  {
    return this.vertices[i + j*(this.res+1)];
  }

  // ----------------------------------------------
  getValue(i,j)
  {
    return this.values[i + j*(this.res+1)];
  }
  
  
  // ----------------------------------------------
  getSquareIndex(i,j,isovalue)
  {
    let squareIndex = 0;

    if (this.getValue(i,j)	    >= isovalue) squareIndex |= 1;
    if (this.getValue(i+1,j)	>= isovalue) squareIndex |= 2;
    if (this.getValue(i+1,j+1)	>= isovalue) squareIndex |= 4;
    if (this.getValue(i  ,j+1)  >= isovalue) squareIndex |= 8;

    return squareIndex;  
  }
}

// ----------------------------------------------
function middle(A,B){return p5.Vector.lerp(A,B,0.5)}


