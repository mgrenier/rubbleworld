import { Material } from '../rendering/Material';
import { VertexShader, FragmentShader } from '../rendering/Shader';

export class UnlitSampledMaterial extends Material {
	constructor() {
		super(
			new VertexShader(`
				attribute vec3 Position0;
				attribute vec2 UV0;

				uniform mat4 ProjectionMatrix;
				uniform mat4 WorldMatrix;
				uniform mat4 ModelMatrix;

				varying vec2 fragUV;

				void main(void) {
					fragUV = UV0;
					gl_Position = ProjectionMatrix * WorldMatrix * ModelMatrix * vec4(Position0, 1.0);
				}
			`),
			new FragmentShader(`
				precision mediump float;

				varying vec2 fragUV;
				uniform sampler2D Texture0;

				void main(void) {
					gl_FragColor = vec4(texture2D(Texture0, fragUV).xyz, 1.0);
				}
			`)
		);
	}
}
