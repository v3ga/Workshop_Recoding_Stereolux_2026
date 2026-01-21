//------------------------------------------------------------
const SERVER_URL = "http://127.0.0.1:8080";

//------------------------------------------------------------
p5.disableFriendlyErrors = true;

//------------------------------------------------------------
/**
 * A4 paper format dimensions in millimeters.
 * @type {[number, number]}
 */
const FORMAT_A4_MM = [210,297];

/**
 * A3 paper format dimensions in millimeters.
 * @type {[number, number]}
 */
const FORMAT_A3_MM = [297,420];

//------------------------------------------------------------
/**
 * Converts millimeters to pixels.
 *
 * @param {number} mm
 *   Length in millimeters.
 *
 * @param {number} dpmm
 *   Dots (pixels) per millimeter.
 *
 * @returns {number}
 *   Equivalent length in pixels.
 */
function mmToPx(mm, dpmm)
{
    return mm / dpmm * width;
}

//------------------------------------------------------------
async function call(endPoint, data={})
{
  let response = await fetch(`${SERVER_URL}/${endPoint}`, 
  {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
  });

  let result = await response.json();
  if (result.status == 'error')   { console.warn(result.message); return null;}
  else if (result.status == 'ok') { console.log(result.message); return result.data; }

  return null;
}

//------------------------------------------------------------
/**
 * Calls vpype endpoint on server
 *
 * @param {string} strSvg - svg string to be read by vpype. Will be fed into stdin
 * @param {number} args - Array of string
 * @returns {json} Json message with status 'error' or 'ok'
 */
async function vpype(strSvg, args=[])
{
    return await call('vpype', { 'svg':strSvg, 'args' : args });
}

//------------------------------------------------------------
/**
 * Converts a svg string to a hpgl string
 * This functions assumes the svg is in portrait mode
 * The function makes a call to vpype to rotate the drawing (portrait -> landscape) and sets the layout in landscape mode.
 *
 * @param {string} strSvg - svg string to be read by vpype. Will be fed into stdin
 * @param {Object} [opts] - options
 * @param {string} [opts.margins='2cm"] - margins
 * @param {string} [opts.format='a3'] - output format, possible values : 'a4', 'a3'
 * @returns {string} HPGL string
 */
async function svgToHPGL(strSvg, opts={'margins':'2cm', format:'a3'})
{
    return await call('svg_to_hpgl', {'svg':strSvg});
}

//------------------------------------------------------------
/**
 * Draws a hpgl string onto a <canvas> with p5 Drawing API.
 * This function parses HPGL most common instructions, warning some are now handled !
 * 
 * @param {string} hpgl - hpgl string
 * @param {Object} [opts] - options
 * @param {number} [opts.plotterWidth=PlotterRolandDXY.width_units] - plotter width units
 * @param {number} [opts.plotterHeight=PlotterRolandDXY.height_units] - plotter height units
 * @returns {void}
 */
function drawHPGL(hpgl, opts={'plotterWidth':PlotterRolandDXY.width_units, 'plotterHeight':PlotterRolandDXY.height_units})
{
    let _coordinates  = (x, y) => { return [int(x)/opts.plotterWidth * width, (1-int(y)/opts.plotterHeight) * height]; };
    let layerColors   = ["black", "red", "blue", "green", "yellow", "pink", "orange", "turquoise"];
    let _args         = (cmd,nbChars=2) => { if (cmd.length>nbChars) return cmd.substring(nbChars).split(','); return []; }
    let _goto         = cmd_args => 
    {
      let coords =[];
      while(cmd_args.length)
      {
        let c = cmd_args.splice(0,2);
        if (c.length==2)
          coords = _coordinates(c[0], c[1]);
      }
      return coords;
    }

    let _trace = cmd_args =>
    {
      let coords=[];
      while(cmd_args.length)
      {
          let c = cmd_args.splice(0,2);
          if (c.length==2)
          {
            coords = _coordinates(c[0], c[1]);
            console.log(int(c[0]/16158 * width), int((height-int(c[1]))/11040 * height));
            vertex(coords[0],coords[1]);
          }               
      }
      return coords;
    }

    hpgl              = hpgl.replace(/(\r\n|\n|\r)/gm, "");
    let commands      = hpgl.split(";");
    let prevCoords    = [0, 0];
    let isPenDown     = false;

    push();
    noFill();
    commands.forEach( (cmd,index) =>  
    {
      if (!cmd.length) {
        return;
      }
      cmd = cmd.toUpperCase();

      // ----------------------------------
      // PEN UP
      // ----------------------------------
      if (cmd.match(/^PU/)) 
      {
        if (isPenDown)
        {
          isPenDown = false;
          endShape();
        }

        prevCoords = _goto( _args(cmd) );
      }

      // ----------------------------------
      // PEN DOWN
      // ----------------------------------
      else if (cmd.match(/^PD/)) 
      {
        // Not pen down ? Set it and begin a new shape
        if (!isPenDown)
        {
          isPenDown = true;
          beginShape();
          vertex(prevCoords[0],prevCoords[1]);
        }

        // pen is down
        _trace( _args(cmd) );
      }
      else if (cmd.match(/^PA/)) 
      {
        if (isPenDown)
          _trace( _args(cmd) );
        else
          prevCoords = _goto( _args(cmd) );
      }           
      else if (cmd.match(/^SP/)) 
      {
        // PEN SELECT
        let layerNumber = parseInt(cmd.replace("SP", "")) - 1;
        if (layerNumber >= 0) 
        {
          currentColor = layerColors[layerNumber];
          stroke(currentColor);
        } else {
          currentColor = null;
          strokeWeight = this.strokeWeightDefault;
        }
      } 
      else if (cmd.match(/^IN/) || cmd.match(/^VS/))
      {
        // Do nothing
      } 
      else 
      {
      }
    });

    if (isPenDown)
      endShape();
    pop();
}

// ----------------------------------------------------------------
/**
 * Saves HPGL content to a file.
 *
 * Writes the provided HPGL string to disk using the given filename.
 * This helper is intended to be used as a simple export utility.
 *
 * @param {string} filename
 *   Name of the file to create (including extension, e.g. `.hpgl`).
 *
 * @param {string} strHPGL
 *   HPGL content to save.
 *
 * @returns {void}
 */
function saveHPGL(filename, strHPGL) 
{
    const blob = new Blob([strHPGL], {type: "text/plain;charset=utf-8"});
    saveBlob(filename, blob);
}

// ----------------------------------------------------------------
/**
 * Saves SVG content to a file.
 *
 * Writes the provided SVG markup to disk using the given filename.
 * Useful for exporting rendered drawings as vector graphics.
 *
 * @param {string} filename
 *   Name of the file to create (including extension, e.g. `.svg`).
 *
 * @param {string} strSvg
 *   SVG markup to save.
 *
 * @returns {void}
 */
function saveSvg(filename, strSvg) 
{
    const blob = new Blob([strSvg], {type: "image/svg+xml;charset=utf-8"});
    saveBlob(filename, blob);
}

// ----------------------------------------------------------------
function saveBlob(filename, blob)
{
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);    
}

// ----------------------------------------------------------------
function enableBtn(btn, is=true)
{
    btn.elt.disabled = !is;
}

// ----------------------------------------------------------------
class SerialConnection
{
    static __LOG__   = true;

    static isAvailable()
    {
        return 'serial' in navigator;
    }

    constructor()
    {
        this.connected = false;
        this.port = null;
        this.bWritingBuffer = false;
    }

    port()
    {
        return this.port;
    }

    async connect(opts={})
    {
        if (SerialConnection.isAvailable()) 
        {
            try 
            {
                this.port = await navigator.serial.requestPort();
                await this.port.open({ baudRate: opts.baudRate??9600 });
                this.connected = true;
                if (opts.open)
                    opts.open({ "error" : false}) 

                const encoder       = new TextEncoderStream();
                this.outputDone     = encoder.readable.pipeTo(this.port.writable);
                this.outputStream   = encoder.writable;
                this.reader         = this.port.readable.getReader();
                this.textDecoder    = new TextDecoder();
                
            }
            catch (e) 
            {
                if (SerialConnection.__LOG__)
                    console.warn(`error opening the serial port: ${e}`)
              return false;
            }
        }
        else
        {
            if (SerialConnection.__LOG__)
                console.warn(`serial not supported in browser`);
            return false;
        }

        return true;
    }

    async write(s, bRead=false)
    {
        if (SerialConnection.__LOG__)               
            console.log(`serial, writing ${s}`);

        const writer = this.outputStream.getWriter();
        await writer.write(s);
        writer.releaseLock();

        if (bRead)
        {
            let response = await this.read();
            if (SerialConnection.__LOG__)               
                console.log(`serial, response is ${response}`)
            return response;
        }
        return null;
    }

    async read()
    {
        let response="";
        while (true) 
        {
            const { value, done } = await this.reader.read();
            // Check validity
            if (done || value.length === 0) 
            {
                break;
            }
            // Response as a string
            response += this.textDecoder.decode(value).trim(); // remove end char if any (not sure)

            // break if '\r' is received
            if (value.indexOf('\r'.charCodeAt()) >= 0) // found '\r' char
            {
                break;
            }
        }
        return response;
    }
}

// ----------------------------------------------------------------
class PlotterRolandDXY
{
    static __LOG__              = true;
    static RS232_PREFIX         = String.fromCharCode(27) + ".";
    static BUFFER_CHUNK_SIZE    = 64;

    // 1300 model / EXPAND size
    static width_units          = 16800;
    static height_units         = 11880; 

    // ----------------------------------------------------------------
    constructor( serialConnection )
    {
        this.serialConnection   = serialConnection;
        this.bWritingBuffer     = false;
    }

    // ----------------------------------------------------------------
    async plot(hpgl)
    {
        if (!this.bWritingBuffer)
            this.writeBuffer(hpgl);
    }

    // ----------------------------------------------------------------
    async writeBuffer(s,cbDone)
    {
        this.buffer  = s;
        this.pos     = 0;
        if (!this.bWritingBuffer)
        {
            this.bWritingBuffer = true;
            if (PlotterRolandDXY.__LOG__)
                console.log(`serial, writeBuffer, size=${s.length} bytes`);
            await this.writeBufferChunk(cbDone);
        }
    }

    // ----------------------------------------------------------------
    async writeBufferChunk(cbDone)
    {
        let avail = await this.checkBytesAvailable();
        if (avail < PlotterRolandDXY.BUFFER_CHUNK_SIZE)
        {
            if (PlotterRolandDXY.__LOG__)
                console.log(`serial, waiting avail=${avail} (buffer size=${PlotterRolandDXY.BUFFER_CHUNK_SIZE})`)
            setTimeout( this.writeBufferChunk.bind(this),200);
        }
        else
        {
            avail = PlotterRolandDXY.BUFFER_CHUNK_SIZE;
            let end = this.pos+avail;
            let done = false;
            if ((this.pos+avail)>=this.buffer.length)
            {
                done = true;
            }

            let chunk = this.buffer.substring(this.pos,end);
            if (PlotterRolandDXY.__LOG__)
                console.log(`serial, writing chunk from ${this.pos} to ${Math.min(end,this.buffer.length)}, size total=${this.buffer.length}`)
            await this.serialConnection.write(chunk,false);

            if (!done)
            {
                this.pos = end;
                this.writeBufferChunk();
            }
            else
            {
                this.bWritingBuffer = false;
                if (cbDone) 
                    this.cbDone();
            }
        }
    } 

    // ----------------------------------------------------------------
    async checkBytesAvailable()
    {
        let bytesAvailable = await this.serialConnection.write( PlotterRolandDXY.RS232_PREFIX+"B", true);
        return bytesAvailable ? parseInt(bytesAvailable) : -1;
    }
}