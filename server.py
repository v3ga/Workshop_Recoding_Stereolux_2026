# ----------------------------------------------------------------
from aiohttp                    import web
from aiohttp.web_middlewares    import normalize_path_middleware
from pyaxidraw                  import axidraw
from pathlib                    import Path
import asyncio
import tempfile

# ----------------------------------------------------------------
ID_PLOTTER                  = "roland-dxy-1300"
PATH_FILE_CONFIG_PLOTTER    = Path(f"data/configs/{ID_PLOTTER}.toml")

# ----------------------------------------------------------------
# https://axidraw.com/doc/py_api/#options-general
AXIDRAW_OPTIONS_DEFAULT = {
    'speed_pendown' : 7, 
    'speed_penup'   : 15,
    'accel'         : 25,
    'pen_pos_down'  : 20, 
    'pen_pos_up'    : 40, 
    'pen_rate_lower': 10,
    'pen_rate_raise': 10,
    'pen_delay_down': 0,
    'pen_delay_up'  : 0,
    'const_speed'   : True,
    'penlift'       : 0,
    'model'         : 1
}
axidraw_user_options = {}
axidraw_user_options.update(AXIDRAW_OPTIONS_DEFAULT)

# ----------------------------------------------------------------
# Apply user options
def apply_axidraw_options(ad, user_options):
    axidraw_user_options.update(user_options)
    vars(ad.options).update(axidraw_user_options)


# ----------------------------------------------------------------
# handle_axidraw
async def handle_axidraw(request):
    command = request.match_info['command']
    try:
        request_json = await request.json()
    except Exception as e:
        return get_response_error(f"invalid JSON: {e}")

    ad = axidraw.AxiDraw()
    if (command == "version"):
        ad.plot_setup()
        ad.options.mode = command
        ad.plot_run()
        return get_response(ad.version_string)
    elif (command in ("align", "cycle", "toggle")):
        ad.plot_setup()
        apply_axidraw_options(ad,request_json.get('options') or {})
        ad.options.mode = command
        ad.plot_run()
    elif (command == 'plot'):
        svg = request_json.get("svg")
        if (svg is None):
            return get_response_error(f"svg is not set")
        ad.plot_setup(svg)
        apply_axidraw_options(ad,request_json.get('options') or {})
        ad.plot_run()

    return get_response(f"ok executed {command}")


# ----------------------------------------------------------------
# From http request to vpype 
async def handle_vpype(request):
    try:
        request_json = await request.json()
    except Exception as e:
        return get_response_error("invalid JSON")
    
    if "svg" not in request_json: 
        return get_response_error("svg is not set")

    if "args" not in request_json: 
        return get_response_error("args is not set")

    # Create temp file for output 
    with tempfile.NamedTemporaryFile(suffix=".svg", delete=False) as tmp:
        path_out_svg = Path(tmp.name)

    # Get SVG & argsfrom request
    str_svg = request_json["svg"]
    args    = request_json["args"]

    # Go vpype !!
    proc = await asyncio.create_subprocess_exec(
        "vpype",
        "read", "-",
        *args,
        "write", str(path_out_svg),
        stdin=asyncio.subprocess.PIPE
    )

    # Send SVG to stdin
    await proc.communicate(str_svg.encode("utf-8"))

    # Read generated SVG from temp file
    new_svg = path_out_svg.read_text()

    # Send back to client
    return web.json_response({"status": "ok", "message": "server.py : generated SVG", "data": new_svg})

# ----------------------------------------------------------------
async def svg_to_hpgl(request):
    try:
        request_json = await request.json()
    except Exception as e:
        return get_response_error("invalid JSON")

    if "svg" not in request_json: 
        return get_response_error("svg is not set")

    # Get SVG from request
    str_svg = request_json["svg"]

    #Options
    opts = request_json.get("opts", {})
    margins = opts.get("margins", "2cm")
    format  = opts.get("format", "a3")    

    # Create temp file for output HPGL
    with tempfile.NamedTemporaryFile(suffix=".hpgl", delete=False) as tmp:
        path_out_hpgl = Path(tmp.name)

    # Go vpype !! 
    proc = await asyncio.create_subprocess_exec(
        "vpype",
        "--config", str(PATH_FILE_CONFIG_PLOTTER),
        "read", "-",
        "rotate", "--", "-90", 
        "layout", "--landscape", "--fit-to-margins", margins, format,
        "write", "--device", ID_PLOTTER, "--absolute", str(path_out_hpgl),
        stdin=asyncio.subprocess.PIPE
    )

    # Send SVG to stdin
    await proc.communicate(str_svg.encode("utf-8"))

    # Read generated HPGL from temp file
    hpgl = path_out_hpgl.read_text()
    
    # Send back to client
    return web.json_response({"status": "ok", "message": "server.py : generated HPGL code", "data": hpgl})

# ----------------------------------------------------------------
def get_response(message):
    return web.json_response({"status" : "ok", "message":message})

# ----------------------------------------------------------------
def get_response_error(message):
    return web.json_response({"status" : "error", "message":message})

# ----------------------------------------------------------------
# Webserver
BASE_DIR        = Path(__file__).parent
SKETCHES_DIR    = BASE_DIR / "sketches"

async def index(request):
    return web.FileResponse(SKETCHES_DIR / "index.html")

app = web.Application(middlewares=[normalize_path_middleware(merge_slashes=True)])
app.router.add_get("/", index)
app.router.add_static('/', path=SKETCHES_DIR,     show_index=False)
app.router.add_post('/axidraw/{command}',       handle_axidraw)
app.router.add_post('/vpype',                   handle_vpype)
app.router.add_post('/svg_to_hpgl',             svg_to_hpgl)

# ----------------------------------------------------------------
# Entry point
if __name__ == '__main__':
    web.run_app(app, host="127.0.0.1", port=8080, ssl_context=None)
