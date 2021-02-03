import { MessageData } from "../Messages/MessageData";

export const CubeStateSyncType: 'CubeStateSync' = 'CubeStateSync'
export interface CubeStateSync extends MessageData<typeof CubeStateSyncType> {
	readonly state: string
	readonly move?: string
}