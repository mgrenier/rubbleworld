import { IDisposable } from '@konstellio/disposable';
import { Mutable } from '../util/Mutable';

export enum ShaderType {
	Vertex = WebGLRenderingContext.VERTEX_SHADER,
	Fragment = WebGLRenderingContext.FRAGMENT_SHADER,
}

export abstract class Shader implements IDisposable {
	private disposed: boolean = false;
	protected gl?: WebGLRenderingContext;

	public readonly shader?: WebGLShader;

	constructor(
		public readonly source: string,
		public readonly type = WebGLRenderingContext.VERTEX_SHADER | WebGLRenderingContext.FRAGMENT_SHADER
	) {}

	async dispose() {
		if (this.disposed === false) {
			if (this.gl && this.shader) {
				this.gl.deleteShader(this.shader);
			}
			this.disposed = true;
		}
	}

	isDisposed() {
		return this.disposed;
	}

	compile(gl: WebGLRenderingContext) {
		if (this.gl && this.gl !== gl) {
			throw new ReferenceError(`Shader already compiled with an other WebGLRenderingContext.`);
		}

		if (this.shader) {
			return;
		}

		this.gl = gl;
		(this as Mutable<Shader>).shader = gl.createShader(this.type)!;

		gl.shaderSource(this.shader!, this.source);
		gl.compileShader(this.shader!);

		if (!gl.getShaderParameter(this.shader!, gl.COMPILE_STATUS)) {
			throw new SyntaxError(`Could not compile shader : ${gl.getShaderInfoLog(this.shader!)}.`);
		}
	}
}

export class VertexShader extends Shader {
	constructor(source: string) {
		super(source, WebGLRenderingContext.VERTEX_SHADER);
	}
}

export class FragmentShader extends Shader {
	constructor(source: string) {
		super(source, WebGLRenderingContext.FRAGMENT_SHADER);
	}
}
