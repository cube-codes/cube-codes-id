import { EditorApi } from "./EditorApi";

export class EditorApiBuilder {

	private static addReadonlyProperty(name: string, value: any): void {
		Object.defineProperty(self, name, {
			configurable: false,
			enumerable: false,
			value: value,
			writable: false
		});
	}

	static set(editorApi: EditorApi) {
		EditorApiBuilder.addReadonlyProperty('UI', editorApi.UI);
		EditorApiBuilder.addReadonlyProperty('CUBE', editorApi.CUBE);
		EditorApiBuilder.addReadonlyProperty('CUBELETS', editorApi.CUBELETS);
	}

}