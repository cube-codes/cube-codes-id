export class SystemApi {

	async sleep(seconds: number): Promise<void> {
		return new Promise(r => setTimeout(r, seconds * 1000));
	}

	async loadLibrary(url: string): Promise<void> {
		eval(await fetch(url).then(r => r.text()));
	}

}