import { Cube, CubeFace, CubeMove, CubeMoveAngle, Dimension, Random } from "@cube-codes/cube-codes-model";

export class CubeApi {

	constructor(private readonly cube: Cube) { }

	async range(face: CubeFace, sliceStart: number = 2, sliceEnd: number = 3, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<CubeApi> {
		await this.cube.move(new CubeMove(this.cube.spec, face, sliceStart, sliceEnd, angle), source);
		return this;
	}

	async face(face: CubeFace, sliceStart: number = 1, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<CubeApi> {
		return await this.range(face, sliceStart, sliceStart, angle, source);
	}

	async center(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<CubeApi> {
		if (this.cube.spec.edgeLength % 2 === 0) {
			return this;
		}
		return await this.range(CubeFace.getByDimensionAndDirection(dimension, true), Math.floor((this.cube.spec.edgeLength + 1) / 2), Math.floor((this.cube.spec.edgeLength + 1) / 2), angle * (dimension.equals(Dimension.Z) ? 1 : -1), source);
	}

	async rotate(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<CubeApi> {
		return await this.range(CubeFace.getByDimensionAndDirection(dimension, true), 1, this.cube.spec.edgeLength, angle, source);
	}

	async shuffleByMove(movesLength: number, source?: object): Promise<CubeApi> {

		for (let moveIndex = 0; moveIndex < movesLength; moveIndex++) {
			const face = CubeFace.getByIndex(Random.randomIntegerToInclusivly(5));
			const sliceStart = Random.randomIntegerFromToInclusivly(1, Math.ceil(this.cube.spec.edgeLength / 2));
			await this.face(face, sliceStart, CubeMoveAngle.C90, source);
		}

		return this;

	}

}