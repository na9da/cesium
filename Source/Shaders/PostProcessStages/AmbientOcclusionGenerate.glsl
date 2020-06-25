#define NUM_DIRECTIONS 16
#define NUM_STEPS 16

uniform sampler2D randomTexture;
uniform sampler2D depthTexture;
uniform float intensity;
uniform float bias;
uniform float lengthCap;
uniform float stepSize;
uniform float frustumLength;

varying vec2 v_textureCoordinates;

vec3 clipToEye(vec2 uv, float depth)
{
    vec2 xy = vec2((uv.x * 2.0 - 1.0), ((1.0 - uv.y) * 2.0 - 1.0));
    vec4 posEC = czm_inverseProjection * vec4(xy, depth, 1.0);
    posEC = posEC / posEC.w;
    return posEC.xyz;
}

vec3 getMinDepthDiff(vec3 posInCamera, vec2 uvLower, vec2 uvUpper) {
    float depthLower = czm_readDepth(depthTexture, uvLower);
    float depthUpper = czm_readDepth(depthTexture, uvUpper);
    vec3 posLower = clipToEye(uvLower, depthLower);
    vec3 posUpper = clipToEye(uvUpper, depthUpper);

    vec3 vecLower = posInCamera - posLower;
    vec3 vecUpper = posUpper - posInCamera;
    return length(vecLower) < length(vecUpper) ? normalize(vecLower) : normalize(vecUpper);
}

float computeDirectionalAO(vec3 posInCamera, vec3 dPdu, vec3 dPdv, vec2 sampleDirection, vec2 pixelSize) {
    float ao = 0.0;
    
    // find tangent angle
    vec3 T = dPdu * sampleDirection.x + dPdv * sampleDirection.y;
    float tanT = T.z / length(T.xy) + tan(bias);
    float sinT = tanT / sqrt(1.0 + tanT * tanT);

    // sample AO
    float prevSinH = sinT;
    vec2 sampleCoord = v_textureCoordinates;
    for (int i = 0; i < NUM_STEPS; ++i) {
        sampleCoord += sampleDirection * stepSize * pixelSize;

        //Exception Handling
        if(sampleCoord.x > 1.0 || sampleCoord.y > 1.0 || sampleCoord.x < 0.0 || sampleCoord.y < 0.0) 
        {
            break;
        } 

        // find horizon angle
        float sampleDepth = czm_readDepth(depthTexture, sampleCoord);
        vec3 samplePos = clipToEye(sampleCoord, sampleDepth);
        vec3 view = samplePos - posInCamera;
        float len = length(view);
        if (len > lengthCap)
        {
            break;
        }

        float tanH = view.z / length(view.xy);
        float sinH = tanH / sqrt(1.0 + tanH * tanH);
        if (sinH > prevSinH) {
            float weight = len / lengthCap;
            weight = 1.0 - weight * weight;

            ao += (sinH - prevSinH) * weight;
            prevSinH = sinH;
        }
    }

    return ao;
}

void main(void)
{
    float depth = czm_readDepth(depthTexture, v_textureCoordinates);
    vec3 posInCamera = clipToEye(v_textureCoordinates, depth);

    if (posInCamera.z > frustumLength)
    {
        gl_FragColor = vec4(1.0);
        return;
    }

    // calculate dPdu, dPdv basis
    vec2 pixelSize = czm_pixelRatio / czm_viewport.zw;
    vec2 uvTop = v_textureCoordinates + vec2(0.0, pixelSize.y);
    vec2 uvBot = v_textureCoordinates - vec2(0.0, pixelSize.y);
    vec2 uvLeft = v_textureCoordinates - vec2(pixelSize.x, 0.0);
    vec2 uvRight = v_textureCoordinates + vec2(pixelSize.x, 0.0);

    vec3 dPdu = getMinDepthDiff(posInCamera, uvLeft, uvRight);
    vec3 dPdv = getMinDepthDiff(posInCamera, uvBot, uvTop);

    // calculate AO for current texCoord
    float ao = 0.0;
    vec2 sampleDirection = vec2(1.0, 0.0);
    float gapAngle = 2.0 * czm_pi /float(NUM_DIRECTIONS);

    // RandomNoise
    float randomVal = texture2D(randomTexture, v_textureCoordinates).x;

    //Loop for each direction
    for (int i = 0; i < NUM_DIRECTIONS; i++)
    {
        float newGapAngle = gapAngle * (float(i) + randomVal);
        float cosVal = cos(newGapAngle);
        float sinVal = sin(newGapAngle);

        //Rotate Sampling Direction
        vec2 rotatedSampleDirection = vec2(cosVal * sampleDirection.x - sinVal * sampleDirection.y, sinVal * sampleDirection.x + cosVal * sampleDirection.y);
        ao += computeDirectionalAO(posInCamera, dPdu, dPdv, rotatedSampleDirection, pixelSize);
    }

    ao /= float(NUM_DIRECTIONS * NUM_STEPS);
    ao = 1.0 - clamp(ao, 0.0, 1.0);
    ao = pow(ao, intensity);
    gl_FragColor = vec4(vec3(ao), 1.0);
}
