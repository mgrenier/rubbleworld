import { Material } from "../common/engine/rendering/Material";
import { Matrix4 } from "../common/engine/math/Matrix4";
import { CameraOrthographic, CameraPerspective } from "../common/engine/rendering/Camera";
import { Vector3 } from "../common/engine/math/Vector3";
import { Quaterion } from "../common/engine/math/Quaterion";
import { Mesh, PointMesh } from "../common/engine/rendering/Mesh";
import { Texture } from "../common/engine/rendering/Texture";
import { Debug } from "../common/engine/Debug";
import { Color } from "../common/engine/math/Color";

// Source: http://learningwebgl.com/blog/?p=28

const canvasEl = document.getElementById("canvas")! as HTMLCanvasElement;
const width = canvasEl.width;
const height = canvasEl.height;

const gl = canvasEl.getContext('webgl', {
	alpha: false,
	antialias: false,
	depth: true,
	stencil: false
})!;

const material = new Material(
	gl,
	`
		attribute vec3 vertPosition;
		attribute vec2 vertUV1;

		uniform mat4 projectionMatrix;
		uniform mat4 viewMatrix;
		uniform mat4 worldMatrix;

		varying vec2 fragUV;

		void main(void) {
			fragUV = vertUV1;
			gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertPosition, 1.0);
		}
	`,
	`
		precision mediump float;

		varying vec2 fragUV;
		uniform sampler2D sampler;

		void main(void) {
			gl_FragColor = vec4(texture2D(sampler, fragUV).xyz, 0.25);
		}
	`
);

const mesh = new Mesh(
	gl,
	{
		vertices: new Float32Array([
			1.0, 1.0, 0.0,
			-1.0, 1.0, 0.0,
			1.0, -1.0, 0.0,
			-1.0, -1.0, 0.0
		]),
		indices: new Uint16Array([
			0, 1, 2,
			2, 1, 3
		]),
		uvs: [
			new Float32Array([
				1, 0,
				0, 0,
				1, 1,
				0, 1
			])
		],
		colors: [
			new Float32Array([
				1, 0, 1, 1,
				1, 0, 1, 1,
				1, 0, 1, 1,
				1, 0, 1, 1
			])
		]
	}
);

const tex = new Texture(
	gl,
	document.getElementById('uvdebug')! as HTMLImageElement,
	gl.CLAMP_TO_EDGE,
	gl.LINEAR
);

const position = new Vector3(0, 0, -8);
const rotation = new Quaterion();
const view = new Matrix4();
const world = new Matrix4().compose(position, rotation, Vector3.One);
const camera = new CameraPerspective(45, width / height, 0.1, 100.0, 2);
// const camera = new CameraOrthographic(-250, 250, -250, 250, 0.1, 100, 1);


material.setUniform('worldMatrix', world.elements);
material.setUniform('viewMatrix', view.elements);
material.setUniform('projectionMatrix', camera.projectionMatrix.elements);
material.setUniform('sampler', tex);


const pointMaterial = new Material(
	gl,
	`
		attribute vec3 pointPosition;
		attribute float pointSize;
		attribute vec4 pointColor;

		varying vec4 fragColor;

		uniform mat4 projectionMatrix;
		uniform mat4 viewMatrix;
		uniform mat4 worldMatrix;

		void main(void) {
			fragColor = pointColor;
			gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(pointPosition, 1.0);
			gl_PointSize = pointSize;
		}
	`,
	`
		precision mediump float;

		varying vec4 fragColor;

		void main(void) {
			gl_FragColor = fragColor;
		}
	`
);

pointMaterial.setUniform('worldMatrix', world.elements);
pointMaterial.setUniform('viewMatrix', view.elements);
pointMaterial.setUniform('projectionMatrix', camera.projectionMatrix.elements);

const pointMesh = new PointMesh(gl, {
	count: 2,
	positions: new Float32Array([0, 0, 0, 1, 0, 0]),
	sizes: new Float32Array([10, 5]),
	colors: new Float32Array([1, 0, 0, 1, 0, 1, 0, 1])
});

// Debug.setRenderingContext(gl);
// Debug.drawPoint(new Vector3(0, 2, -8), 3, { color: new Color(1, 0, 0) });
// Debug.drawPoint(new Vector3(1, 0, -8), 5, { color: new Color(0, 1, 0) });
// Debug.drawPoint(new Vector3(-1, 0, -8), 10, { color: new Color(0, 0, 1) });

let frameId = 0;
(function draw() {
	++frameId;
	gl.viewport(0, 0, width, height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.depthFunc(gl.LESS);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	// Enable transparency
	gl.disable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);

	for (let i = 1; --i >= 0;) {

		// rotation.y = Math.sin(Math.max(0, frameId - i * 10) / 20);
		// position.x = Math.sin(Math.max(0, frameId - i * 10) / 20);
		// position.y = Math.cos(Math.max(0, frameId - i * 10) / 20);
		// world.compose(position, rotation, Vector3.One);
		world.elements[12] = Math.sin(Math.max(0, frameId - i * 10) / 20);
		world.elements[13] = Math.cos(Math.max(0, frameId - i * 10) / 20);

		// Use material set attribute & uniform
		material.bind();
		material.setUniform('worldMatrix', world.elements);
		mesh.bind();
		mesh.draw();

		// Debug.drawPoint(point, 1);

		// Debug.draw(view, camera.projectionMatrix);
		// Debug.draw(Matrix4.Identity, Matrix4.Identity);

	}

	pointMaterial.bind();
	pointMesh.draw();

	requestAnimationFrame(draw);
})();