import { CubeState } from "@cube-codes/cube-codes-model";
import { MessageData } from "../../Messages/MessageData";

export const WorkerStartSyncType: 'WorkerStartSync' = 'WorkerStartSync'
export interface WorkerStartSync extends MessageData<typeof WorkerStartSyncType> {
	readonly programCode: string
	readonly cubeState: CubeState
}