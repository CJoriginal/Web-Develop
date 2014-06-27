

    var gl;

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    }


    function handleLoadedTexture(texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    var strings = Array();
    var textures = Array();

    var textureOne;
    var textureTwo;
    var textureThree;
    var textureFour;
    var textureFive;
    var textureSix;
    function initTexture() {
        //Water Texture
        textureOne = gl.createTexture();
        textureOne.image = new Image();
        textureOne.image.onload = function () {
            handleLoadedTexture(textureOne)
        }
        textureOne.image.src = "Textures/Water.jpg";

        //Carpet Texture
        textureTwo = gl.createTexture();
        textureTwo.image = new Image();
        textureTwo.image.onload = function () {
            handleLoadedTexture(textureTwo)
        }
        textureTwo.image.src = "Textures/carpet.jpg";

        //Grass Texture
        textureThree = gl.createTexture();
        textureThree.image = new Image();
        textureThree.image.onload = function () {
            handleLoadedTexture(textureThree)
        }
        textureThree.image.src = "Textures/grass.jpg";

        //Wood Texture
        textureFour = gl.createTexture();
        textureFour.image = new Image();
        textureFour.image.onload = function () {
            handleLoadedTexture(textureFour)
        }
        textureFour.image.src = "Textures/crate.gif";

        //Blue Texture
        textureFive = gl.createTexture();
        textureFive.image = new Image();
        textureFive.image.onload = function () {
            handleLoadedTexture(textureFive)
        }
        textureFive.image.src = "Textures/blue.jpg";

         //Red Texture
        textureSix = gl.createTexture();
        textureSix.image = new Image();
        textureSix.image.onload = function () {
            handleLoadedTexture(textureSix)
        }
        textureSix.image.src = "Textures/red.jpg";

        textures[0] = textureOne;    //Water
        textures[1] = textureTwo;   //Carpet
        textures[2] = textureThree; //Grass
        textures[3] = textureFour;  //Pave
        textures[4] = textureFive;  //Wood
        textures[5] = textureSix;   //Blue

        strings[0] = "Is the cube made of marble / water?"
        strings[1] = "Is the cube made of carpet?"
        strings[2] = "Is the cube made of grass?"
        strings[3] = "Is the cube made of wood?"
        strings[4] = "Is the cube made of blue plastic?"
        strings[5] = "Is the cube made of red plastic?"
    }

    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }


    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }


    var yRot = 15.0;
    var ySpeed = 20.0;

    var textureNo = 0;
    var stringNo = 0;

    var correct = 0;
    var incorrect = 0;

    var isPlay = false;
    var isCorrect = false;

    var currentlyPressedKeys = {};

    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
    }


    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }


    function handleKeys() {
        //Enter Key
        if (currentlyPressedKeys[13]) {
            if(isPlay == false)
            {
                correct = 0;
                incorrect = 0;

                isPlay = true;
              
                countdown(1);
            }
        }
        if (currentlyPressedKeys[65]) {
            // A key
            ySpeed -= 1;
        }
        if (currentlyPressedKeys[68]) {
            // D key
            ySpeed += 1;
        }
    }


    var cubeVertexPositionBuffer;
    var cubeVertexTextureCoordBuffer;
    var cubeVertexIndexBuffer;
    function initBuffers() {
        cubeVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        cubeVertexPositionBuffer.itemSize = 3;
        cubeVertexPositionBuffer.numItems = 24;

        cubeVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        var textureCoords = [
            // Front face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Back face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Top face
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,

            // Bottom face
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,

            // Right face
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
            0.0, 0.0,

            // Left face
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        cubeVertexTextureCoordBuffer.itemSize = 2;
        cubeVertexTextureCoordBuffer.numItems = 24;

        cubeVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ]
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
        cubeVertexIndexBuffer.itemSize = 1;
        cubeVertexIndexBuffer.numItems = 36;
    }


    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

        mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[textureNo]);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        document.getElementById("correct").innerHTML = correct;
        document.getElementById("incorrect").innerHTML = incorrect;
        document.getElementById("question").innerHTML = strings[stringNo];
    }


    var lastTime = 0;


    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;

            yRot += (ySpeed * elapsed) / 1000.0;
        }
        lastTime = timeNow;
    }

    function tick() {
        requestAnimFrame(tick);
        handleKeys();


        if(seconds == 0 && isPlay == true)
        {
            isPlay = false;
            document.getElementById("glcanvas").style.display = 'none';
            document.getElementById("correctNo").value = document.getElementById("correct").innerHTML;
            document.getElementById("incorrectNo").value = document.getElementById("incorrect").innerHTML;

            document.forms["datsend"].submit();
        }   


        if(isPlay == true)
        {
            document.getElementById("glcanvas").style.display ='';
            drawScene();
        }

        animate();
    }

    function webGLStart() {
        var canvas = document.getElementById("glcanvas");
        initGL(canvas);
        initShaders();
        initBuffers();
        initTexture();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

        tick();
    }

    //Randomly pick texture and statement to show
    function pickTexture(){
        var random = Math.floor(Math.random() * 5);
        var gate = Math.floor((Math.random() * 2) + 1);

        if(gate == 1)   //Same Values
        {
            stringNo = random;
            textureNo = random;
        }
        else // Different statement
        {
            textureNo = random;
            var textureID = textureNo;

            do{
                random = Math.floor(Math.random() * 5);
            }while(random == textureID)

            stringNo = random;
        }
    }

    //Check user interaction through web page.
    function checkAnswer(x) {
        if(x == 0) //Clicked True
        {
            if(textureNo == stringNo)
            {
                correct = correct + 1; 
            }
            else
            {
                incorrect = incorrect + 1;
            }
        }
        else //Clicked Flase
        {
            if(textureNo != stringNo)
            {
                correct = correct + 1; 
            }
            else
            {
                incorrect = incorrect + 1;
            }
        }

        pickTexture();
    }

    var seconds;

    //Counts down from 30 seconds to 0 seconds.
    function countdown(minutes) {
        seconds = 30;
        var mins = minutes;

        function tick2() {
            var counter = document.getElementById("countdown");
            var current_minutes = mins - 1;
            seconds--;
            counter.innerHTML =
            current_minutes.toString() + ":" + (seconds < 10 ? "0" : "") + String(seconds);
            if (seconds > 0) {
                setTimeout(tick2, 1000);
            } else {

                if (mins > 1) {
                    // countdown(mins-1);   never reach “00″ issue solved:Contributed by Victor Streithorst    
                    setTimeout(function () { countdown(mins - 1); }, 1000);

                }
            }
        }

        tick2();
    }