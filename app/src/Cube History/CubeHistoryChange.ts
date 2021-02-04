import { CubeState, CubeMove } from "@cube-codes/cube-codes-model";

/**
 * Change of a {@link Cube}'s {@link CubeState} possibly through a {@link CubeMove} that is recorded by the {@link CubeHistory}
 */
export interface CubeHistoryChange {

	/**
	 * {@link CubeState} before the change
	 */
	readonly oldState: CubeState

	/**
	 * {@link CubeState} after the change
	 */
	readonly newState: CubeState

	/**
	 * Possible {@link CubeMove} while changing the {@link CubeState}
	 */
	readonly move?: CubeMove
	
}