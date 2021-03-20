export interface ProgramWorkerGlobal {

	postMessage(messageData: any): void
	
	onmessage(messageData: any): void
	
	close(): void

}