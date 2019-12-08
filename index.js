(function(){
    var canvas, gl, program, nWord, nCube;
    var pindahX =0.0023, pindahY = 0.0023, pindahZ=0.0023;

    glUtils.SL.init({ callback:function() { main(); } });

    function main() {
        canvas = document.getElementById("glcanvas");
        gl = glUtils.checkWebGL(canvas);

        initSize();

        var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
        fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
        program = glUtils.createProgram(gl, vertexShader, fragmentShader);
        gl.useProgram(program);

        nWord = initWordVertices();
        nCube = initCubeVertices();

        // Definisi untuk matriks model
        var mmLoc = gl.getUniformLocation(program, 'modelMatrix');
        var mm = glMatrix.mat4.create();

        // Definisi untuk matrix view dan projection(kamera)
        var vmLoc = gl.getUniformLocation(program, 'viewMatrix');
        var vm = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(vm,
            [0.0, 0.0, 0.0], // di mana posisi kamera (posisi)
            [0.0, 0.0, -1.0], // ke mana kamera menghadap (vektor)
            [0.0, 1.0, 0.0]  // ke mana arah atas kamera (vektor)
          );
          gl.uniformMatrix4fv(vmLoc, false, vm);
        var pmLoc = gl.getUniformLocation(program, 'projectionMatrix');
        var pm = glMatrix.mat4.create();
        var camera = {x: 0.0, y: 0.0, z:0.0};
        glMatrix.mat4.perspective(pm,
        glMatrix.glMatrix.toRadian(90), // fovy dalam radian
        canvas.width/canvas.height,     // aspect ratio
        0.5,  // near
        10.0, // far  
        );
        gl.uniformMatrix4fv(pmLoc, false, pm);

        // Uniform untuk pencahayaan
        var dcLoc = gl.getUniformLocation(program, 'diffuseColor');
        var dc = glMatrix.vec3.fromValues(1.0, 1.0, 1.0);  
        gl.uniform3fv(dcLoc, dc);
        var ddLoc = gl.getUniformLocation(program, 'diffusePosition');
        var dd = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);  
        gl.uniform3fv(ddLoc, dd);
        var acLoc = gl.getUniformLocation(program, 'ambientColor');
        var ac = glMatrix.vec3.fromValues(0.17, 0.40, 0.23);
        gl.uniform3fv(acLoc, ac);

        // Variabel translasi
        // scaleX
        var scaleXUniformLocation = gl.getUniformLocation(program, 'scaleX');
        var scaleX = 1.0;
        gl.uniform1f(scaleXUniformLocation, scaleX);

        // constant
        var constantUniformLocation = gl.getUniformLocation(program, 'constant');
        var constant = 0.5;
        gl.uniform1f(constantUniformLocation, constant);

        //jalanX
        var jalanXUniformLocation = gl.getUniformLocation(program, 'jalanX');
        var jalanX = 0.00;
        gl.uniform1f(jalanXUniformLocation, jalanX);

        // jalanY
        var jalanYUniformLocation = gl.getUniformLocation(program, 'jalanY');
        var jalanY = 0.00;
        gl.uniform1f(jalanYUniformLocation, jalanY);

        // jalanX
        var jalanZUniformLocation = gl.getUniformLocation(program, 'jalanZ');
        var jalanZ = 0.00;
        gl.uniform1f(jalanZUniformLocation, jalanZ);

        // gambarCube
        var gambarCubeUniformLocation = gl.getUniformLocation(program, 'gambarCube');
        var gambarCube = 1;
        gl.uniform1i(gambarCubeUniformLocation, gambarCube);

        // fgambarCube
        var fgambarCubeUniformLocation = gl.getUniformLocation(program, 'fgambarCube');
        var fgambarCube = 1;
        gl.uniform1i(fgambarCubeUniformLocation, fgambarCube);

        // Uniform untuk texture
        var sampler0Loc = gl.getUniformLocation(program, 'sampler0');
        gl.uniform1i(sampler0Loc, 0);

        // Create a texture.
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // Asynchronously load an image
        var image = new Image();
        image.src = "images/tekstur.jpg";
        image.addEventListener('load', function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        });

        render();

        // Kontrol dengan menggunakan mouse
        var dragging, xx, yy, dX=0, dY=0, tetha=0, phi=0, aa=0.85;

        function onMouseDown(event) {
            dragging = true;
            xx = event.clientX;
            yy = event.clientY;
            console.log(xx);
            console.log(yy);
            event.preventDefault();
            return false;
        };

         function onMouseUp(event){
            dragging = false;
         };

         function onMouseMove(event) {
            if (!dragging) {
                return false;
            }
            dX = (event.clientX-xx)*2*Math.PI/canvas.width,
            dY = (event.clientY-yy)*2*Math.PI/canvas.height;
            tetha+=dX;
            phi+=dY;
            xx = event.clientX;
            yy = event.clientY;
            event.preventDefault();
         };

         document.addEventListener('mousedown', onMouseDown);
         document.addEventListener('mouseup', onMouseUp);
         document.addEventListener('mousemove', onMouseMove);

         
         // Variabel rotasi
         function rotateX(trix, angle) {
            var simpan1 = trix[1], simpan2 = trix[5], simpan3 = trix[9];
            var nilaiSin = Math.sin(angle);
            var nilaiCos = Math.cos(angle);

            trix[1] = trix[1]*nilaiCos-trix[2]*nilaiSin;
            trix[5] = trix[5]*nilaiCos-trix[6]*nilaiSin;
            trix[9] = trix[9]*nilaiCos-trix[10]*nilaiSin;

            trix[2] = trix[2]*nilaiCos+simpan1*nilaiSin;
            trix[6] = trix[6]*nilaiCos+simpan2*nilaiSin;
            trix[10] = trix[10]*nilaiCos+simpan3*nilaiSin;
         }

         function rotateY(trix, angle) {
            var simpan1 = trix[0], simpan2 = trix[4], simpan3 = trix[8];
            var nilaiSin = Math.sin(angle);
            var nilaiCos = Math.cos(angle);

            trix[0] = nilaiCos*trix[0]+nilaiSin*trix[2];
            trix[4] = nilaiCos*trix[4]+nilaiSin*trix[6];
            trix[8] = nilaiCos*trix[8]+nilaiSin*trix[10];

            trix[2] = nilaiCos*trix[2]-nilaiSin*simpan1;
            trix[6] = nilaiCos*trix[6]-nilaiSin*simpan2;
            trix[10] = nilaiCos*trix[10]-nilaiSin*simpan3;
         }
         

        // Cek huruf memantul
        var kiri = -0.35, kanan = 0.15, atas = 0.30, bawah = -0.6, size = 0.7;

        function checking(){
            //Koordinat X
            if(constant*scaleX*kiri+jalanX>=size)
            {
                jalanX = size - constant*scaleX*kiri;
                pindahX = -1*pindahX;
            }
            else if(constant*scaleX*kanan+jalanX>=size)
            {
                jalanX = size - constant*scaleX*kanan;
                pindahX = -1*pindahX;
            }
            else if(constant*scaleX*kiri+jalanX<= -1*size)
            {
                jalanX = (-1 * size - constant*scaleX*kiri);
                pindahX = -1*pindahX;
            }
            else if(constant*scaleX*kanan+jalanX<= -1*size)
            {
                jalanX = (-1 * size - constant*scaleX*kanan);
                pindahX = -1*pindahX;
            }

            //Koordinat Y
            if(constant * atas +jalanY>=size)
            {
                jalanY = size - constant*atas;
                pindahY = -1*pindahY;
            }
            else if(constant * bawah+jalanY<= -1*size)
            {
                jalanY = (-1 * size - constant*bawah);
                pindahY = -1*pindahY;
            }

            //Koordinat Z
            if(jalanZ>=size)
            {
                jalanZ = size;
                pindahZ = -1*pindahZ;
            }
            else if(jalanZ<= -1*size)
            {
                jalanZ = (-1 * size);
                pindahZ = -1*pindahZ;
            }
        }

        // Render
        function render(){
            gl.clearColor(0.364, 0.305, 1, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            if (!dragging) {
                dX *= aa, dY*=aa;
                tetha+=dX, phi+=dY;
            }

            mm[0] = 1, mm[1] = 0, mm[2] = 0, mm[3] = 0,

            mm[4] = 0, mm[5] = 1, mm[6] = 0, mm[7] = 0,

            mm[8] = 0, mm[9] = 0, mm[10] = 1, mm[11] = 0,

            mm[12] = 0, mm[13] = 0, mm[14] = 0, mm[15] = 1;
 
            glMatrix.mat4.translate(mm, mm, [0.0, 0.0, -2.0]);

            rotateY(mm, tetha);
            rotateX(mm, phi);

            gl.uniformMatrix4fv(mmLoc, false, mm);

            if (scaleX >= 1.0) melebar = -1.0;
            else if (scaleX <= -1.0) melebar = 1.0;
            scaleX += 0.0023 * melebar;

            jalanX += pindahX;
            jalanY += pindahY;
            jalanZ += pindahZ;

            checking();

            gl.uniform1f(jalanYUniformLocation, jalanY);
            gl.uniform1f(jalanXUniformLocation, jalanX);
            gl.uniform1f(jalanZUniformLocation, jalanZ);
            gl.uniform1f(scaleXUniformLocation, scaleX);

            // Kondisi 1
            gambarCube=2;
            gl.uniform1i(gambarCubeUniformLocation, gambarCube);
            gl.uniform1i(fgambarCubeUniformLocation, gambarCube);
            gl.drawArrays(gl.TRIANGLES, 0, nCube);

            //Kondisi 2
            gambarCube=0;
            gl.uniform1i(gambarCubeUniformLocation, gambarCube);
            gl.uniform1i(fgambarCubeUniformLocation, gambarCube);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, nWord);

            gl.enable(gl.DEPTH_TEST);
            requestAnimationFrame(render);
        }
    
        function initSize() {
            var width = canvas.getAttribute("width"), height = canvas.getAttribute("height");
            if (width) {
                gl.maxWidth = width;
            }
            if (height) {
                gl.maxHeight = height;
            }
        }

        // Huruf Y 
        function initWordVertices() {
            var vertices=[];

            var miring=[
                -0.20 , +0.20, 0.11, 0.7, 1,
                -0.45 , +0.40, 0.11, 0.7, 1,
                -0.3 , +0.40, 0.11, 0.7, 1,
                -0.15 , +0.20, 0.11, 0.7, 1,
                -0.15 , +0.20, 0.11, 0.7, 1,
                0.0 , +0.40, 0.11, 0.7, 1,
                0.15 , +0.40, 0.11, 0.7, 1,
                -0.10 , +0.20, 0.11, 0.7, 1,
            ];
            
            var lurus=[
                -0.20 , +0.20, 0.11, 0.7, 1,
                -0.10 , +0.20, 0.11, 0.7, 1,
                -0.10 , -0.30, 0.11, 0.7, 1,
                -0.20 , -0.30, 0.11, 0.7, 1,
                -0.20 , +0.20, 0.11, 0.7, 1,
            ];
            
            var vertexBuffer = gl.createBuffer();

            miring=miring.concat(lurus);
            vertices=vertices.concat(miring);
            
            var n = vertices.length / 5;
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            
            var vPosition = gl.getAttribLocation(program, 'vPosition');
            var vColor = gl.getAttribLocation(program, 'vColor');
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
            gl.vertexAttribPointer(vColor, 3, gl.FLOAT, gl.FALSE,
                5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
            gl.enableVertexAttribArray(vPosition);
            gl.enableVertexAttribArray(vColor);
            
            return n;
        }

        // Kubus
        function initCubeVertices() {
            var verticesCubePlane = [];
            var cubePoints = [
                [ -0.7, -0.7,  0.7 ],
                [ -0.7,  0.7,  0.7 ],
                [  0.7,  0.7,  0.7 ],
                [  0.7, -0.7,  0.7 ],
                [ -0.7, -0.7, -0.7 ],
                [ -0.7,  0.7, -0.7 ],
                [  0.7,  0.7, -0.7 ],
                [  0.7, -0.7, -0.7 ]
              ];
              var cubeColors = [
                [],
                [1.0, 0.0, 0.0], // merah
                [0.0, 1.0, 0.0], // hijau
                [0.0, 0.0, 1.0], // biru
                [1.0, 0.0, 0.0], // putih
                [1.0, 0.5, 0.0], // oranye
                [1.0, 1.0, 0.0], // kuning
                []
              ];
              var cubeNormals = [
                [],
                [  0.0,  0.0,  1.0 ], // depan
                [  1.0,  0.0,  0.0 ], // kanan
                [  0.0, -1.0,  0.0 ], // bawah
                [  0.0,  0.0, -1.0 ], // belakang
                [ -1.0,  0.0,  0.0 ], // kiri
                [  0.0,  1.0,  0.0 ], // atas
                []
              ];

              function quad(a, b, c, d) {
                var indices = [a, b, c, a, c, d];
                for (var i=0; i < indices.length; i++) {
                    for (var j=0; j < 3; j++) {
                        verticesCubePlane.push(cubePoints[indices[i]][j]);
                    }
                    for (var j=0; j < 3; j++) {
                        verticesCubePlane.push(cubeColors[a][j]);
                    }
                    for (var j=0; j < 3; j++) {
                        verticesCubePlane.push(-1*cubeNormals[a][j]);
                    }
                    switch (indices[i]) {
                        case a:
                            verticesCubePlane.push( (a-2)*0.125 );        
                            verticesCubePlane.push(0.0);        
                        break;
                        case b:
                            verticesCubePlane.push( (a-2)*0.125 );
                            verticesCubePlane.push(1.0);
                        break;
                        case c:
                            verticesCubePlane.push( (a-1)*0.125 );
                            verticesCubePlane.push(1.0);
                        break;
                        case d:
                            verticesCubePlane.push( (a-1)*0.125 );
                            verticesCubePlane.push(0.0);
                        break;
                    
                        default:
                        break;
                    }
                }
            }

            quad(2, 3, 7, 6);
            quad(3, 0, 4, 7);
            quad(4, 5, 6, 7);
            quad(5, 4, 0, 1);
            quad(6, 5, 1, 2);

            // Membuat vertex buffer object (CPU Memory <==> GPU Memory)
            var vertexBufferObject = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesCubePlane), gl.STATIC_DRAW);

            // Membuat sambungan untuk attribute
            var vPosition = gl.getAttribLocation(program, 'vPositionCubePlane');
            var vColor = gl.getAttribLocation(program, 'vColorCubePlane');
            var vNormal = gl.getAttribLocation(program, 'vNormalCubePlane');
            var vTexCoord = gl.getAttribLocation(program, 'vTexCoordCubePlane');
            gl.vertexAttribPointer(
            vPosition,                              // variabel yang memegang posisi attribute di shader
            3,                                      // jumlah elemen per atribut
            gl.FLOAT,                               // tipe data atribut
            gl.FALSE, 
            11 * Float32Array.BYTES_PER_ELEMENT,    // ukuran byte tiap verteks (overall) 
            0                                       // offset dari posisi elemen di array
            );
            gl.vertexAttribPointer(vColor, 3, gl.FLOAT, gl.FALSE,
              11 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
            gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, gl.FALSE,
            11 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
            gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, gl.FALSE,
            11 * Float32Array.BYTES_PER_ELEMENT, 9 * Float32Array.BYTES_PER_ELEMENT);
            gl.enableVertexAttribArray(vPosition);
            gl.enableVertexAttribArray(vColor);
            gl.enableVertexAttribArray(vNormal);
            gl.enableVertexAttribArray(vTexCoord);

            var n = verticesCubePlane.length / 11;

            return n;
        }
    
    }   
}) ();