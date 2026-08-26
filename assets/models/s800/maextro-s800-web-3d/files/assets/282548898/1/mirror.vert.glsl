// mirror.vert.glsl — Vertex shader for the mirror reflection plane
// Passes world-space position, normal, and UV to the fragment shader.

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUv0;

uniform mat4 matrix_model;
uniform mat4 matrix_viewProjection;
uniform mat3 matrix_normal;

varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUv0;

void main(void) {
    vec4 posW = matrix_model * vec4(aPosition, 1.0);
    vPositionW = posW.xyz;
    vNormalW   = normalize(matrix_normal * aNormal);
    vUv0       = aUv0;

    gl_Position = matrix_viewProjection * posW;
}
