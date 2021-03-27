import { CubeApi } from "../../../common/src/Cube Api/CubeApi";
import { CubeletInspector } from "../../../common/src/Cube Api/CubeletInspector";
import { UiApi } from "./UiApi"

export interface EditorApi {

	readonly UI: UiApi

	readonly CUBE: CubeApi

	readonly CUBELETS: CubeletInspector

}