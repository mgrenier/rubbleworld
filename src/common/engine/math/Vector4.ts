import { clamp } from './util';

export class Vector4 {
	constructor(
		public x = 0,
		public y = 0,
		public z = 0,
		public w = 0
	) {

	}

	get length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}

	get lengthSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}

	get lengthManhattan() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	}

	equals(vector: Vector4) {
		return this.x === vector.x && this.y === vector.y && this.z === vector.z && this.w === vector.w;
	}

	set(x = 0, y = 0, z = 0, w = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		return this;
	}

	setScalar(scalar: number) {
		this.x = scalar;
		this.y = scalar;
		this.z = scalar;
		this.w = scalar;
		return this;
	}

	setX(x: number) {
		this.x = x;
		return this;
	}

	setY(y: number) {
		this.y = y;
		return this;
	}

	setZ(z: number) {
		this.z = z;
		return this;
	}

	setW(w: number) {
		this.w = w;
		return this;
	}

	setLength(length: number) {
		return this.normalize().multiplyScalar(length);
	}

	normalize() {
		return this.divideScalar(this.length || 1);
	}

	negate() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		this.w = -this.w;
		return this;
	}

	clone() {
		return new Vector4(this.x, this.y, this.z, this.w);
	}

	copy(vector: Vector4) {
		this.x = vector.x;
		this.y = vector.y;
		this.z = vector.z;
		this.w = vector.w;
		return this;
	}

	add(vector: Vector4) {
		this.x += vector.x;
		this.y += vector.y;
		this.z += vector.z;
		this.w += vector.w;
		return this;
	}

	addScalar(scalar: number) {
		this.x += scalar;
		this.y += scalar;
		this.z += scalar;
		this.w += scalar;
		return this;
	}

	sub(vector: Vector4) {
		this.x -= vector.x;
		this.y -= vector.y;
		this.w -= vector.z;
		this.w -= vector.w;
		return this;
	}

	subScalar(scalar: number) {
		this.x -= scalar;
		this.y -= scalar;
		this.z -= scalar;
		this.w -= scalar;
		return this;
	}

	multiply(vector: Vector4) {
		this.x *= vector.x;
		this.y *= vector.y;
		this.z *= vector.z;
		this.w *= vector.w;
		return this;
	}

	multiplyScalar(scalar: number) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		this.w *= scalar;
		return this;
	}

	divide(vector: Vector4) {
		this.x /= vector.x;
		this.y /= vector.y;
		this.z /= vector.z;
		this.w /= vector.w;
		return this;
	}

	divideScalar(scalar: number) {
		this.x /= scalar;
		this.y /= scalar;
		this.z /= scalar;
		this.w /= scalar;
		return this;
	}

	min(vector: Vector4) {
		this.x = Math.min(this.x, vector.x);
		this.y = Math.min(this.y, vector.y);
		this.z = Math.min(this.z, vector.z);
		this.w = Math.min(this.w, vector.w);
		return this;
	}

	max(vector: Vector4) {
		this.x = Math.max(this.x, vector.x);
		this.y = Math.max(this.y, vector.y);
		this.z = Math.max(this.z, vector.z);
		this.w = Math.max(this.w, vector.w);
		return this;
	}

	clamp(min: Vector4, max: Vector4) {
		this.x = Math.max(min.x, Math.min(max.x, this.x));
		this.y = Math.max(min.y, Math.min(max.y, this.y));
		this.z = Math.max(min.z, Math.min(max.z, this.z));
		this.w = Math.max(min.w, Math.min(max.w, this.w));
		return this;
	}

	clampLength(min: number, max: number) {
		const length = this.length;
		return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
	}

	project(normal: Vector4) {
		return this.multiplyScalar(normal.dot(this) / normal.lengthSquared);
	}

	reflect(normal: Vector4) {
		return this.sub(tmp.copy(normal).multiplyScalar(2 * this.dot(normal)));
	}

	dot(vector: Vector4) {
		return this.x * vector.x + this.y * vector.y + this.z * vector.z + this.w * vector.w;
	}

	// cross(vector: Vector4) {
	// 	const ax = this.x;
	// 	const bx = vector.x;
	// 	const ay = this.y;
	// 	const by = vector.y;
	// 	const az = this.z;
	// 	const bz = vector.z;
	// 	// const aw = this.w;
	// 	// const bw = vector.w;

	// 	this.x = ay * bz - az * by;
	// 	this.y = az * bx - ax * bz;
	// 	this.z = ax * by - ay * bx;
	// 	return this;
	// }

	angleTo(vector: Vector4) {
		const theta = this.dot(vector) / (Math.sqrt(this.lengthSquared * vector.lengthSquared));
		return Math.acos(clamp(theta, - 1, 1));
	}

	distanceTo(vector: Vector4) {
		return Math.sqrt(this.distanceToSquared(vector));
	}

	distanceToSquared(vector: Vector4) {
		const dx = this.x - vector.x;
		const dy = this.y - vector.y;
		const dz = this.z - vector.z;
		const dw = this.w - vector.w;
		return dx * dx + dy * dy + dz * dz + dw * dw;
	}

	manhattanDistanceTo(vector: Vector4) {
		return Math.abs(this.x - vector.x) + Math.abs(this.y - vector.y) + Math.abs(this.z - vector.z) + Math.abs(this.w - vector.w);
	}
}

const tmp = new Vector4();