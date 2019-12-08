precision mediump float;

varying vec3 fColor;
varying vec3 fNormal;
varying vec3 fPosition;
varying vec2 fTexCoord;

uniform int fgambarCube;

uniform vec3 diffuseColor;
varying vec3 fdiffusePosition;
uniform vec3 ambientColor;

uniform sampler2D sampler0;

void main() {
  vec3 diffuseDirection = normalize(fdiffusePosition - fPosition);

  float normalDotLight = max(dot(fNormal, diffuseDirection), 0.0);
  if(fgambarCube == 2)
  {
    vec4 textureColor = texture2D(sampler0, fTexCoord);

    vec3 diffuse = diffuseColor * textureColor.rgb * normalDotLight;
    vec3 ambient = ambientColor * textureColor.rgb;

    gl_FragColor = vec4(diffuse + ambient, 1.0);
  }

  else
  {
    vec3 diffuse = diffuseColor * fColor * normalDotLight;
    vec3 ambient = ambientColor * fColor;

    gl_FragColor = vec4(diffuse + ambient, 1.0);
  }
}
