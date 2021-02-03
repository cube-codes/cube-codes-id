/**
 * Data of a used {@link MessageChannel} (wrapped by a {@link MessageEnvelope}) and received by a {@link MessagetListener}
 */
export interface MessageData<MessageType> {
	readonly type: MessageType
 }