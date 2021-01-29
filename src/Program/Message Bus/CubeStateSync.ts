import { CubeMove, CubeState } from "@cube-codes/cube-codes-model";
import { MessageData } from "../../Messages/MessageData";

export const CubeStateSyncType: 'CubeStateSync' = 'CubeStateSync'
export interface CubeStateSync extends MessageData<typeof CubeStateSyncType> {
	readonly state: CubeState
	readonly move?: CubeMove
}