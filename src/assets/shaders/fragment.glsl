uniform sampler2D globeTexture;

varying vec2 vertexUV;

void main() {
  gl_FragColor = texture2d(globeTexture, vertexUV);
}