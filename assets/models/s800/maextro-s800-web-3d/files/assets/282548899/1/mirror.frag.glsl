// mirror.frag.glsl — Fragment shader for the mirror reflection plane
// Designed for frosted / matte ground reflections (not mirror-like).
//
// Uniforms:
//   mirrorTex           — reflected scene render-target texture
//   maskTex             — grayscale mask (R channel) for rendering area
//   normalTex           — normal map to perturb the reflection
//   normalStrength      — 0~2, strength of the normal distortion
//   normalTiling        — UV tiling scale for normalTex
//   reflectionIntensity — 0~1, reflection strength / opacity multiplier
//   roughness           — 0~1, surface roughness (controls blur + dims reflection)
//   view_position       — camera world position (injected by PlayCanvas)
//   uScreenSize         — vec4(width, height, 1/width, 1/height)
//   emissiveThreshold   — 0~1, luminance threshold above which emissive boost kicks in
//   emissiveBoost       — >=1, multiplier applied to emissive-bright pixels in reflection

precision mediump float;

varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUv0;

uniform sampler2D mirrorTex;
uniform sampler2D maskTex;
uniform sampler2D normalTex;
uniform float     normalStrength;      // 0 ~ 2
uniform float     normalTiling;        // tiling repeat
uniform float     reflectionIntensity; // 0 ~ 1
uniform float     roughness;           // 0 ~ 1
uniform vec3      view_position;       // camera world pos
uniform vec4      uScreenSize;
uniform float     emissiveThreshold;   // 0 ~ 1, default 0.6
uniform float     emissiveBoost;       // >= 1, default 2.0

// -------------------------------------------------------
// Utility
// -------------------------------------------------------
float saturate01(float x) {
    return clamp(x, 0.0, 1.0);
}

// Rec.709 luminance
float luminance(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

// -------------------------------------------------------
// Box blur on mirrorTex
// -------------------------------------------------------
vec3 sampleBlurred(vec2 uv, vec2 texel, float fRadius) {
    vec3 acc  = vec3(0.0);
    float cnt = 0.0;

    const int MAX_R = 5;

    for (int ix = -MAX_R; ix <= MAX_R; ix++) {
        for (int iy = -MAX_R; iy <= MAX_R; iy++) {
            float fix = abs(float(ix));
            float fiy = abs(float(iy));
            if (fix <= fRadius && fiy <= fRadius) {
                vec2 off = vec2(float(ix), float(iy)) * texel;
                acc += texture2D(mirrorTex, uv + off).rgb;
                cnt += 1.0;
            }
        }
    }
    return acc / max(cnt, 1.0);
}

// -------------------------------------------------------
// Emissive highlight enhancement
// Boosts pixels whose luminance exceeds emissiveThreshold.
// Uses a soft knee (smoothstep) to avoid hard edges, then
// applies an HDR-style glow on top of the base color.
// -------------------------------------------------------
vec3 applyEmissiveBoost(vec3 color) {
    float lum = luminance(color);
    float threshold = saturate01(emissiveThreshold);
    float boost     = max(1.0, emissiveBoost);

    // Soft mask: 0 below threshold, smoothly rises above it
    float t = smoothstep(threshold, min(threshold + 0.25, 1.0), lum);

    // Boost: raise brightness non-linearly for emissive regions.
    // pow with exponent < 1 expands highlights; multiply by boost scales them.
    vec3 boosted = pow(color + 0.001, vec3(0.75)) * boost;

    // Mix: non-emissive pixels stay, emissive pixels get the boost
    return mix(color, boosted, t);
}

// -------------------------------------------------------
// Main
// -------------------------------------------------------
void main(void) {

    // 1. Screen-space UV for the mirror render-target
    vec2 screenUV = gl_FragCoord.xy * uScreenSize.zw;
    vec2 texel    = vec2(uScreenSize.z, uScreenSize.w);

    // 2. Normal map perturbation
    vec2 tiledUV = vUv0 * normalTiling;
    vec3 nSample = texture2D(normalTex, tiledUV).xyz * 2.0 - 1.0;
    vec2 normalOffset = nSample.xy * normalStrength * 0.05;
    screenUV += normalOffset;

    // 3. Roughness controls blur and brightness
    float rough = saturate01(roughness);
    // Aggressive dimming curve for matte look: rough 0.3 already halves brightness
    float roughDim = 1.0 - rough * rough * 0.85; // 0→1.0, 0.5→0.79, 1.0→0.15

    // 4. Blur radius driven by roughness (0 → sharp, 1 → MAX_R)
    float radius = rough * 5.0;

    // 5. Sample the reflected scene (raw, pre-dimming)
    vec3 reflRaw;
    if (radius < 0.5) {
        reflRaw = texture2D(mirrorTex, screenUV).rgb;
    } else {
        reflRaw = sampleBlurred(screenUV, texel, radius);
    }

    // 6. Emissive boost — applied to raw reflection so emissive objects
    //    shine through even on rough/dim mirrors.
    vec3 reflBoosted = applyEmissiveBoost(reflRaw);

    // 7. Combine: intensity x roughness dimming
    float intensity = saturate01(reflectionIntensity);
    float combinedAlpha = intensity * roughDim;

    // For emissive pixels, let boost "leak through" roughness dimming.
    float emissiveLum = luminance(reflRaw);
    float emissiveMask = smoothstep(
        saturate01(emissiveThreshold),
        min(saturate01(emissiveThreshold) + 0.25, 1.0),
        emissiveLum
    );
    // Emissive regions use a gentler dimming (min 0.45 even at full roughness)
    float emissiveDim = mix(roughDim, max(roughDim, 0.45), emissiveMask);

    vec3 refl = mix(reflRaw * roughDim, reflBoosted * emissiveDim, emissiveMask) * intensity;

    // 8. Mask — only render where mask is white
    float mask = texture2D(maskTex, vUv0).r;
    float alpha = combinedAlpha * mask;

    gl_FragColor = vec4(refl, alpha);
}
