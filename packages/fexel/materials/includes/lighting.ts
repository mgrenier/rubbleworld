import { Shader } from '../../rendering/Shader';

Shader.registerInclude(
	'lighting.vert',
	`
	#include lighting/shadow/directionnal.vert;

	void CalcShadowPosition(in vec4 position) {
		#if (defined(MAX_NUM_DIR_SHADOW) && MAX_NUM_DIR_SHADOW > 0)
			CalcDirectionalShadowPosition(position);
		#endif
	}
	`
);

Shader.registerInclude(
	'lighting.frag',
	`
	#ifndef SHADOWMAP_PCF_SPREAD
		#define SHADOWMAP_PCF_SPREAD 700.0
	#endif

	#ifdef SHADOWMAP_DECODE_DEPTH
		float decodeFloat(vec4 color) {
			const vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
			return dot(color, bitShift);
		}
		float texture2DDepth(in sampler2D texture, in vec2 uv) {
			return decodeFloat(texture2D(texture, uv));
		}
	#else
		float texture2DDepth(in sampler2D texture, in vec2 uv) {
			return texture2D(texture, uv).r;
		}
	#endif

	#include lighting/shadow/directionnal.frag;

	struct Light {
		int Type;
		vec3 Position;
		vec3 Direction;
		vec3 Color;
	};
	uniform Light uLights[MAX_NUM_LIGHT];
	uniform vec3 uAmbient;
	uniform vec3 uViewPosition;

	const float MAX_NUM_LIGHT_INV = 1.0 / float(MAX_NUM_LIGHT);

	vec3 CalcLighting(in vec3 color, in float shininess, in vec3 position, in vec3 normal) {
		vec3 N = normalize(normal);
		vec3 S = normalize(uViewPosition - position);
		vec3 lighting = vec3(0.0);

		for (int i = 0; i < MAX_NUM_LIGHT; ++i) {
			vec3 L = normalize(uLights[i].Position - position);
			if (uLights[i].Type == 1) {
				L = normalize(uLights[i].Direction);
			}

			vec3 R = reflect(L, N);

			float cosTheta = clamp(dot(N, L), 0.0, 1.0);
			float cosAlpha = clamp(dot(S, R), 0.0, 1.0);

			vec3 diffuse = cosTheta * uLights[i].Color * color;
			vec3 specular = pow(cosAlpha, shininess) * uLights[i].Color;
			
			lighting += (diffuse + specular) / MAX_NUM_LIGHT_INV;
		}

		return lighting;
	}

	float CalcShadow(in float bias) {
		// float bias = clamp(0.005 * tan(acos(cosTheta)), 0.0, 0.01);
		
		float factor = 0.0;
		float numShadows = 0.0;

		#if (defined(MAX_NUM_DIR_SHADOW) && MAX_NUM_DIR_SHADOW > 0)
			numShadows += float(MAX_NUM_DIR_SHADOW);
		#endif

		float p = 1.0 / numShadows;

		#if (defined(MAX_NUM_DIR_SHADOW) && MAX_NUM_DIR_SHADOW > 0)
			for (int i = 0; i < MAX_NUM_DIR_SHADOW; ++i) {
				#ifdef SHADOWMAP_TYPE_PCF
					float acc = 0.0;
					acc += InDirectionalShadow(vDirectionalShadowPosition[i], vec2(-1.0, -1.0) / SHADOWMAP_PCF_SPREAD, uDirectionalShadowMap[i], bias) ? 1.0 : 0.0;
					acc += InDirectionalShadow(vDirectionalShadowPosition[i], vec2(1.0, -1.0) / SHADOWMAP_PCF_SPREAD, uDirectionalShadowMap[i], bias) ? 1.0 : 0.0;
					acc += InDirectionalShadow(vDirectionalShadowPosition[i], vec2(1.0, 1.0) / SHADOWMAP_PCF_SPREAD, uDirectionalShadowMap[i], bias) ? 1.0 : 0.0;
					acc += InDirectionalShadow(vDirectionalShadowPosition[i], vec2(-1.0, 1.0) / SHADOWMAP_PCF_SPREAD, uDirectionalShadowMap[i], bias) ? 1.0 : 0.0;
					acc += InDirectionalShadow(vDirectionalShadowPosition[i], vec2(0.0), uDirectionalShadowMap[i], bias) ? 1.0 : 0.0;
					factor += acc / 5.0 / p;
				#else
					factor += InDirectionalShadow(vDirectionalShadowPosition[i], vec2(0.0), uDirectionalShadowMap[i], bias) ? p : 0.0;
				#endif
			}
		#endif

		return 1.0 - factor;
	}
`
);

Shader.registerInclude(
	'lighting/shadow/directionnal.vert',
	`
	#if (defined(MAX_NUM_DIR_SHADOW) && MAX_NUM_DIR_SHADOW > 0)
		uniform mat4 uDirectionalShadowTransform[MAX_NUM_DIR_SHADOW];
		varying vec4 vDirectionalShadowPosition[MAX_NUM_DIR_SHADOW];

		void CalcDirectionalShadowPosition(in vec4 position) {
			for (int i = 0; i < MAX_NUM_DIR_SHADOW; ++i) {
				vDirectionalShadowPosition[i] = uDirectionalShadowTransform[i] * position;
			}
		}
	#endif
`
);

Shader.registerInclude(
	'lighting/shadow/directionnal.frag',
	`
	#if (defined(MAX_NUM_DIR_SHADOW) && MAX_NUM_DIR_SHADOW > 0)
		uniform sampler2D uDirectionalShadowMap[MAX_NUM_DIR_SHADOW];
		varying vec4 vDirectionalShadowPosition[MAX_NUM_DIR_SHADOW];

		bool InDirectionalShadow(in vec4 position_in_shadow, in vec2 offset, in sampler2D shadowmap, in float bias) {
			vec3 shadowUV = position_in_shadow.xyz / position_in_shadow.w;
			shadowUV = shadowUV * 0.5 + 0.5;
			float depth = texture2DDepth(shadowmap, shadowUV.xy + offset);

			return shadowUV.z >= depth + bias;
		}
	#endif
`
);
