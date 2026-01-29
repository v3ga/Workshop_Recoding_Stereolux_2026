function placeDot(n,x,y,level){
    
    dots[n] = new Dots(x,y,n,level)
    gridLocs[y*grid[0]+x] = 1  // "This seat is now taken"
    nD++

    // The longest chain in the original piece is made of 18 connections and, somewhat arbitrarily,
    // this code is built so we create 2 branches from the starting points, each having a maximum length of 9 levels.
    if(level<chainLengthTarget){ 
        
        // The dice has been shuffle, so let's just get the first entry
        let branches = dice[floor(random(dice.length))]

        // This is where w're forcing the starting point to form 2 branches.
        if(level==0) branches = 2 

        // This is where we're forcing the chain to avoid stopping too early. 
        // This is an equivalent of having the dice be [1,1,1,1,1,2,2,1,1,1], which may seem weird. 
        // I'm overall speculating as to what the values and probabilities were in Cohen's piece.
        // and also it suggests the chain length to always reach a maximum point, which may not be the original intent.
        // The intent for this force was only to make sure we have a result
        // with a chain length similar to the original.
        if(level<chainLengthTarget && branches==0) branches = 1

        level++

        if (branches>0){

            for(let b=0; b<branches; b++){

                // We're looking for available spots within a certain inner and outer range from our current point
                let changeDist = random(10,70)
                let distanceMax = baseDist+changeDist
                let distanceMin = baseDist-changeDist
                
                availableSpots=[]
                spotsToDelete=[]

                for(let ag=0; ag<gridLocs.length;ag++){
                    if(gridLocs[ag]!=1){
                        let ty = floor(ag/grid[0])
                        let tx = ag%grid[0]
                        let agx = tx*15+(tx-1)*5
                        let agy = ty*15+(ty-1)*5

                        if(dist(dots[n].x,dots[n].y,agx,agy) < distanceMax && dist(dots[n].x,dots[n].y,agx,agy) >= distanceMin){
                            append(availableSpots,ag)
                        }
                    } 
                }

                // The original artwork is made of connections that, if we ignore their wobbliness,
                // seem to intentionally never cross.
                // So, we then check if any of these spots would form a line that would cross any line that already exists.

                for(let av=0; av<availableSpots.length;av++){

                    let ty = floor(availableSpots[av]/grid[0])
                    let tx = availableSpots[av]%grid[0]
                    let avx = tx*15+(tx-1)*5
                    let avy = ty*15+(ty-1)*5

                    let issecis = false

                    for(let l=0; l<lines.length; l++){
                        let A = createVector(dots[n].x,dots[n].y);
                        let B = createVector(avx,avy);
                        let C = createVector(lines[l].x,lines[l].y);
                        let D = createVector(lines[l].nx,lines[l].ny)

                        let commonPoint = ((A.x == C.x && A.y == C.y) || (A.x==D.x && A.y==D.y)|| (B.x==D.x && B.y==D.y) || (B.x==C.x && B.y==C.y))? true : false;

                        if(!issecis && !commonPoint && level>0){
                            issec = getLineIntersection(A,B,C,D)
                            issecis = issec.is
                        }
                    }
                    
                    if(issecis){
                        // For now we'll just store all the points in a separate list.
                        append(spotsToDelete,availableSpots[av])
                    }
                }

                // And now we're clearing the list of available spots from all the spots that would create crossing lines.
                if(spotsToDelete.length>0){
                    for(let ltd=0; ltd<spotsToDelete.length; ltd++){
                        let index = availableSpots.indexOf(spotsToDelete[ltd])
                        if (index>-1) {
                            availableSpots.splice(index,1)
                        }
                    }
                }

                // If there is still any option at this point, pick a spot, create a line and a new dot.
                if(availableSpots.length>0){
                    let pick = availableSpots[floor(random(availableSpots.length))]
                    
                    let newY = floor(pick/grid[0])
                    let newX = pick%grid[0]

                    createLine(x,y,newX,newY)
                    placeDot(nD,newX,newY,level)
                }
            }
        }   
    }
}

class Dots{
    constructor(x, y, n, l){
        this.x = x*15+(x-1)*5
        this.y = y*15+(y-1)*5
        this.n = n
        this.level = l
        this.gridX = x
        this.gridY = y
    }

    show(){
        //circle(this.x, this.y, 13)
        wobblyCircle(this.x, this.y, 7)
    }
}

class Lines{
    constructor(x, y, nx, ny){
        this.x = x*15+(x-1)*5
        this.y = y*15+(y-1)*5
        this.nx = nx*15+(nx-1)*5
        this.ny = ny*15+(ny-1)*5
    }

    show(){
        //line(this.x, this.y, this.nx, this.ny)
        wobblyLine(this.x, this.y, this.nx, this.ny)
    }
}

function createLine(x,y,newX,newY){
    console.log("line",x,y,newX,newY)
    lines[nL] = new Lines(x,y,newX,newY)
    nL++
}

function wobblyCircle(x,y,di){
    let ns = 0.025

    for(let c=0; c<=40; c++){

        let dx = di+map(noise((x+cos(TWO_PI*c/40)*di)*ns,(y+sin(TWO_PI*c/40)*di)*ns),0,1,-2,2)
        let dy = di+map(noise((x+1000+cos(TWO_PI*c/40)*di)*ns,(y+1000+sin(TWO_PI*c/40)*di)*ns),0,1,-2,2)

        xo = (x+cos(TWO_PI*c/40)*dx)
        yo = (y+sin(TWO_PI*c/40)*dy)
        xp = (x+cos(TWO_PI*(c+1)/40)*dx)
        yp = (y+sin(TWO_PI*(c+1)/40)*dy)

        line(xo,yo,xp,yp)

        xo = xp
        yo = yp
    }
}

function wobblyLine(x1,y1,x2,y2){

    let dotted = (random(1)<.1) ? true : false

    let xo, yo, xp, yp
    xo = x1
    yo = y1
    let ns = 0.01

    cmax = 40
    for(let c=1; c<=cmax; c++){

        xp = lerp(x1,x2,c/cmax)
        yp = lerp(y1,y2,c/cmax)

        let nx = map(noise(xo*ns,yo*ns),0,1,-15,15)
        let ny = map(noise((xo+1000)*ns,(yo+1000)*ns),0,1,-15,15)


        if(c<10){
            xp += map(c,1,10,0,nx)
            yp += map(c,1,10,0,ny)
        }

        if(c>=10 && c<30){
            xp += nx
            yp += ny
        }

        if(c>=30){
            xp += map(c,30,cmax,nx,0)
            yp += map(c,30,cmax,ny,0)
        }

        if(dotted && c%3 == 1) line(xo,yo,xp,yp)
        if (!dotted) line(xo,yo,xp,yp)

        xo = xp
        yo = yp
    }
}

function getLineIntersection(A,B,C,D) {
    let  isec = {is:false},
    denom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y),
    na = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x),
    nb = (B.x - A.x) * (A.y - C.y) - (B.y - A.y) * (A.x - C.x);
    if (denom !== 0)
    {
        let ua = na / denom,
            ub = nb / denom,
            vecI = p5.Vector.lerp(A,B,ua);

        if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
            isec = {is:true,p:vecI};
        }
        else {
            isec = {is:false};
        }
    }
    else
    {
        if (na === 0 && nb === 0)
        {
            isec = {is:false};
        }
    }
    return isec;
}