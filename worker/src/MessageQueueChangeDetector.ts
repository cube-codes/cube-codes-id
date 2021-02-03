export class MessageBufferChangeDetector implements Promise<void> {
	
	[Symbol.toStringTag]: string = 'MessageBufferChangeDetector'

	private readonly promise: Promise<void>

	private promiseResolve?: (value: void | PromiseLike<void>) => void

	constructor() {
		this.promise = new Promise(resolve => this.promiseResolve = resolve);
	}

	then<TResult1 = void, TResult2 = never>(onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
		return this.promise.then(onfulfilled, onrejected);
	}
	
	catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<void | TResult> {
		return this.promise.catch(onrejected);
	}

	finally(onfinally?: (() => void) | null): Promise<void> {
		return this.promise.finally(onfinally);
	}

	trigger(): void {
		this.promiseResolve?.call(this.promise);
	}

}