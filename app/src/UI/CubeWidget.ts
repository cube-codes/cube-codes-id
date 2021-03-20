import { html } from "./Html";
import $ from "jquery";
import { Ui } from "./Ui";
import { CubeFace, Dimension } from "@cube-codes/cube-codes-model";
import { CubeVisualizer } from "@cube-codes/cube-codes-visualizer";
import { UiState } from "./UiState";
import { CubeApi } from "../../../common/src/Cube Api/CubeApi";

export class CubeWidget {

	private readonly visualizer: CubeVisualizer

	private readonly cubeApi: CubeApi

	constructor(private readonly ui: Ui) {

		this.markup();

		this.visualizer = new CubeVisualizer(this.ui.cube, $('#cube-display > canvas').get(0) as HTMLCanvasElement, 500);
		this.cubeApi = new CubeApi(this.ui.cube);
		
		this.setupModelListeners();
		this.setupActions();
		this.setupBlocking();

	}

	private markup() {

			$(html`
<main id="cube">
	<aside class="btn-toolbar">
		<div class="btn-group btn-group-sm">
			<div class="btn-group btn-group-sm">
				<button type="button" id="cube-shuffle" class="btn btn-primary dropdown-toggle"
					data-toggle="dropdown" title="Shuffle cube by different ways"><img src="images/bootstrap-icons/shuffle.svg" /><span>Shuffle</span></button>
				<div class="dropdown-menu">
					<span id="cube-shuffle-move-set" class="dropdown-item" title="Shuffle cube by applying 50 random moves (not recorded in the history)">Shuffle via
						Moves</span>
					<span id="cube-shuffle-move-play" class="dropdown-item" title="Shuffle cube by applying 50 random moves (recorded in the history)">Shuffle via Moves
						(recording)</span>
					<div class="dropdown-divider"></div>
					<span id="cube-shuffle-explosion" class="dropdown-item" title="Shuffle cube by exploding it">Shuffle via Explosion</span>
				</div>
			</div>
			<button type="button" id="cube-reset" class="btn btn-primary" title="Reset cube to the solved state"><img
					src="images/bootstrap-icons/arrow-repeat.svg" /><span>Reset Solved</span></button>
		</div>
		<div class="btn-group btn-group-sm ml-auto">
			<button type="button" id="cube-view-reset" class="btn btn-secondary" title="Reset cube view to standard (front and a little bit up and right face)"><img
					src="images/bootstrap-icons/geo-fill.svg" /><span>Reset View</span></button>
			<button type="button" id="cube-speed" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" title="Adjust the speed/duration of animations on the cube"><img
					src="images/bootstrap-icons/speedometer2.svg" /><span>Animation
					Speed</span></button>
			<div class="dropdown-menu">
				<span id="cube-speed-none" class="dropdown-item" title="Adjust to no animation">None (0ms)</span>
				<span id="cube-speed-quick" class="dropdown-item" title="Adjust to a quick animation with 200ms">Quick (200ms)</span>
				<span id="cube-speed-normal" class="dropdown-item checked" title="Adjust to a normal animation with 500ms">Normal
					(500ms)</span>
				<span id="cube-speed-slow" class="dropdown-item" title="Adjust to a slow animation with 1000ms">Slow (1000ms)</span>
			</div>
		</div>
	</aside>
	<main id="cube-display"><canvas></canvas></main>
	<aside id="cube-control"></aside>
</main>`).appendTo('#section-10');

	}

	private setupModelListeners() {

		const addControl = (parent: JQuery<HTMLElement>, caption: string, title: string, moveAction: (angle: number, source?: object) => void) => {
			const control = $(html`
<div class="btn-group btn-group-sm">
	<button type="button" class="btn btn-secondary cube-move" title="${title} 90° CW">
		<img src="images/own-icons/cube-${caption}.svg" />
		<span>${caption}</span>
	</button>
	<button type="button" class="btn btn-secondary cube-move-angles dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" title="More angles" />
	<div class="dropdown-menu">
		<span class="dropdown-item" title="${title} 180° CW">Double</span>
		<span class="dropdown-item" title="${title} 90° CCW">Invert</span>
	</div>
</div>`).appendTo(parent);
			control.children('button:first-child').on('click', e => moveAction(1));
			control.find('.dropdown-item:nth-child(1)').on('click', e => moveAction(2));
			control.find('.dropdown-item:nth-child(2)').on('click', e => moveAction(-1));
		};
		const capitalize = (value: string) => value.substr(0,1).toUpperCase() + value.substr(1).toLowerCase();
		const centerNames = ['MIDDLE', 'EQUATOR', 'STAND'];

		for(const dimension of Dimension.getAll()) {
			const parent = $('<div />').appendTo('#cube-control');
			const negFace = CubeFace.getByDimensionAndDirection(dimension, false);
			const posFace = CubeFace.getByDimensionAndDirection(dimension, true);
			addControl(parent, negFace.name.substr(0, 1), capitalize(negFace.name), (a: number, s?: object) => this.cubeApi.layer(negFace, 1, a, s));
			if(this.ui.initialAppState.cubeSpec.edgeLength >= 4) {
				addControl(parent, `2${negFace.name.substr(0, 1)}`, `2. ${capitalize(negFace.name)}`, (a: number, s?: object) => this.cubeApi.layer(negFace, 2, a, s));
			}
			if(this.ui.initialAppState.cubeSpec.edgeLength % 2 === 1) {
				addControl(parent, centerNames[dimension.index].substr(0, 1), capitalize(centerNames[dimension.index]), (a: number, s?: object) => this.cubeApi.center(dimension, a, s));
			}
			if(this.ui.initialAppState.cubeSpec.edgeLength >= 4) {
				addControl(parent, `2${posFace.name.substr(0, 1)}`, `2. ${capitalize(posFace.name)}`, (a: number, s?: object) => this.cubeApi.layer(posFace, 2, a, s));
			}
			addControl(parent, posFace.name.substr(0, 1), capitalize(posFace.name), (a: number, s?: object) => this.cubeApi.layer(posFace, 1, a, s));
			addControl(parent, dimension.name.toLowerCase(), `${dimension.name} Rotation`, (a: number, s?: object) => this.cubeApi.rotate(dimension, a, s));
		}

	}

	private setupActions() {

		$('#cube-shuffle-move-set').on('click', async e => {
			const cubeClone = this.ui.cube.clone();
			const cubeCloneApi = new CubeApi(cubeClone);
			await cubeCloneApi.shuffleByMove(50);
			await this.ui.cube.setState(cubeClone.getState());
		});
		$('#cube-shuffle-move-play').on('click', async e => {
			this.ui.setState(UiState.EXECUTING);
			await this.cubeApi.shuffleByMove(50, {
				animation: false
			});
			this.ui.setState(UiState.IDLE);
		});
		$('#cube-shuffle-explosion').on('click', async e => {
			await this.cubeApi.shuffleByExplosion();
		});
		$('#cube-reset').on('click', async e => {
			await this.cubeApi.setSolved();
		});

		const updateAnimationDuration = (d: number) => ((e: JQuery.ClickEvent<any, any, any, any>) => {
			$(e.target).siblings().removeClass('checked');
			$(e.target).addClass('checked');
			this.visualizer.animationDuration = d;
		});
		$('#cube-speed-none').on('click', updateAnimationDuration(0));
		$('#cube-speed-quick').on('click', updateAnimationDuration(200));
		$('#cube-speed-normal').on('click', updateAnimationDuration(500));
		$('#cube-speed-slow').on('click', updateAnimationDuration(1000));

		$('#cube-view-reset').on('click', e => this.visualizer.situation.camera.resetPerspective());

	}

	private setupBlocking() {

		const updateButtons = () => {
			const uiActive = this.ui.getState() !== UiState.IDLE;
			$('#cube-shuffle'    ).prop('disabled', uiActive);
			$('#cube-reset'      ).prop('disabled', uiActive);
			$('.cube-move'       ).prop('disabled', uiActive);
			$('.cube-move-angles').prop('disabled', uiActive);
		};

		this.ui.stateChanged.on(updateButtons);
		
		updateButtons();

	}

}