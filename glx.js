var glx = (function() {

    // Initialize WebGL given a canvas element name
    // note: gl.canvas is original canvas element
    var initGL = function(canvasID, aspectRatio) {
        var canvas = document.getElementById(canvasID);
        if (!canvas) {
            alert("Could not find canvas.");
        }
        aspectRatio = aspectRatio? aspectRatio : canvas.offsetWidth/canvas.offsetHeight;
        // if (width) { // will change DOM element
        //     canvas.width = width;
        //     canvas.height = height ? height : width;
        // }
        // else { // weird stunt for cancases with percentage width/height
        //     canvas.width = canvas.offsetWidth;
        //     canvas.height = canvas.offsetHeight;
        // };
        var gl = canvas.getContext("experimental-webgl");
        if (!gl) {
            alert("Could not initialise WebGL.");
        }
        resizeCanvas(gl, aspectRatio);
        gl.viewport(0, 0, canvas.width, canvas.height);
        return gl;
    };
    var resizeCanvas = function (gl, aspectRatio) { // call onresize
        var canvas = gl.canvas;
        canvas.width = canvas.offsetWidth;
        canvas.height = aspectRatio ? canvas.width/aspectRatio : canvas.offsetHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    var aspectRatio = function (gl) {
        var viewport = gl.getParameter( gl.VIEWPORT );
        return viewport[2]/viewport[3];
    };

    // Get a file as a string using either AJAX or DOM element
    var loadFileAJAX = function(name) {
        var xhr = new XMLHttpRequest(),
            okStatus = document.location.protocol === "file:" ? 0 : 200;
        xhr.open('GET', name, false);
        xhr.send(null);
        return xhr.status == okStatus ? xhr.responseText : null;
    };
    var loadFileDOM = function(name) {
        var src = document.getElementById(name);
        return src ? src.firstChild.nodeValue : null;
    };
    var loadFile = function(name) {
        return name.match(/\./) ? loadFileAJAX(name) : loadFileDOM(name);
    };

    // Initialize WebGL program object given its vertex/fragment shader names
    // Note the program is available via: gl.getParameter(gl.CURRENT_PROGRAM)
    var initShaders = function(gl, vShaderName, fShaderName) {
        function getShader(gl, shaderName, type) {
            var shader = gl.createShader(type),
                shaderScript = loadFile(shaderName);
            if (!shaderScript) {
                alert("Could not find shader source: "+shaderName);
            }
            //gl.shaderSource(shader, shaderScript);
            gl.shaderSource(shader, shaderScript);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        }
        var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
            fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER),
            program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
            return null;
        }

        gl.useProgram(program);
        return program;
    };

    // Flatten an array of arrays into a single array (for GL buffers)
    var flatten = function(m) {
        var result = [],
            i, j;
        for (i = 0; i < m.length; i++) {
            for (j = 0; j < m[i].length; j++) {
                result.push(m[i][j]);
            }
        }
        return result;
    };

    // Return random integer in [0,max)
    var randomInt = function(max) {
        return Math.floor(Math.random() * max);
    };
    // Return random integer in [from,to]
    var randomFromTo = function(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    };
    var degToRad = function(degrees) {
        return degrees * Math.PI / 180;
    }
    var radToDeg = function(radians) {
        return degrees * 180 / Math.PI;
    }


    // Querks-mode for browser anamation utility due to standard not yet set.
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();
    // An anamation utility taking a user defined function f w/ 2 optional arguments x,y
    // The passed function f can access animation parameters:
    //  glx.animFrame: The current frame, starting at 1.
    //  glx.animTime: How long the animation has been running.
    var animate = function (f, x, y) {
        var animStart = new Date().getTime()
        glx.animFrame = 0;
        glx.animTime = 0;
        function anim() {
            requestAnimFrame(anim);
            glx.animFrame++; // frame 1 is first
            glx.animTime = new Date().getTime() - animStart;
            f(x, y);
        };
        anim();
    };

    // Generalized vector operator, works for all size of vectors.
    var vop = function (v1, v2, f) {
        var result = [], x;
        for (var i = 0; i < v1.length; i++) {
            result.push(f(v1[i], v2[i], i));
        }
        return result;
    };

    var enumOwn = function (o, f) {
        for (var x in o) {
            if (o.hasOwnProperty(x))
                f(x);
        }
    };

    // debug
    var winNames = {};
    enumOwn(window, function(key){winNames[key]=key;});
    delete winNames["glx"]; // so we show up
    // glx.checkGlobals()
    function checkGlobals() {
        enumOwn(window, function(key) {
            if (!winNames[key]) {
                console.log(key);
            }
        });
    }

    // public interface
    return {
        enumOwn: enumOwn,
        checkGlobals: checkGlobals,
        loadFile: loadFile,
        initGL: initGL,
        resizeCanvas: resizeCanvas,
        aspectRatio: aspectRatio,
        initShaders: initShaders,
        randomInt: randomInt,
        randomFromTo: randomFromTo,
        degToRad: degToRad,
        radToDeg: radToDeg,
        flatten: flatten,
        vop: vop,
        animate: animate,
        animFrame: 0,
        animTime: 0
    };
} ());
