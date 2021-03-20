import { CubeApi } from "../../../common/src/Cube Api/CubeApi";
import { CubeletInspector } from "../../../common/src/Cube Api/CubeletInspector";
import { UiApi } from "./UiApi"

export interface EditorApi {

	UI: UiApi

	CUBE: CubeApi

	CUBELETS: CubeletInspector

}