import { MessageData } from "./MessageData";

/**
 * Handler that receives {@link MessagetData} of a used {@link MessageChannel}
 * @typeParam M - {@link MessageData} of the {@link MessageChannel} that is listened for
 */
export interface MessageListener<M extends MessageData<any>> {

	/**
	 * Function call
	 * @param m - Message data that is worked on
	 */
	(m: M): void

}