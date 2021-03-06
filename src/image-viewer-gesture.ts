import { ImageViewerComponent } from './image-viewer.component';
import { PanGesture } from 'ionic-angular/gestures/drag-gesture';
import { pointerCoord } from 'ionic-angular/util/dom';
import { Platform } from 'ionic-angular/platform/platform';
import { Animation, DomController } from 'ionic-angular';

const HAMMER_THRESHOLD = 10;
const MAX_ATTACK_ANGLE = 45;
const DRAG_THRESHOLD = 70;

export class ImageViewerGesture extends PanGesture {

	private translationY: number;
	private opacity: number;
	private startY: number;
	private imageContainer: HTMLElement;
	private backdrop: HTMLElement;

	constructor(platform: Platform, private component: ImageViewerComponent, domCtrl: DomController, private cb: Function) {
		super(platform, component.getNativeElement(), {
			maxAngle: MAX_ATTACK_ANGLE,
			threshold: HAMMER_THRESHOLD,
			gesture: component._gestureCtrl.createGesture({ name: 'image-viewer' }),
			direction: 'y',
			domController: domCtrl
		});

		this.translationY = 0;
		this.imageContainer = <HTMLElement>component.getNativeElement().querySelector('.image');
		this.backdrop = <HTMLElement>component.getNativeElement().querySelector('ion-backdrop');

		this.listen();
	}

	onDragStart(ev: any): boolean {
		let coord = pointerCoord(ev);
		this.startY = coord.y;
		return true;
	}

	canStart(): boolean {
		return !this.component.isZoomed;
	}

	onDragMove(ev: any): boolean {
		let coord = pointerCoord(ev);
		this.translationY = coord.y - this.startY;
		this.opacity = Math.max(1 - Math.abs(this.translationY) / (10 * DRAG_THRESHOLD), .5);

		this.plt.raf(() => {
			this.imageContainer.style[this.plt.Css.transform] = `translateY(${this.translationY}px)`;
			this.backdrop.style['opacity'] = this.opacity.toString();
		});

		return true;
	}

	onDragEnd(ev: any): boolean {

		if (Math.abs(this.translationY) > DRAG_THRESHOLD) {
			this.cb();
		} else {
			let imageContainerAnimation = new Animation(this.plt, this.imageContainer);
			let backdropAnimation = new Animation(this.plt, this.backdrop);

			backdropAnimation.fromTo('opacity', this.opacity, '1');
			imageContainerAnimation.fromTo('translateY', `${this.translationY}px`, '0px');

			new Animation(this.plt)
				.easing('ease-in')
				.duration(150)
				.add(backdropAnimation)
				.add(imageContainerAnimation)
				.play();
		}

		return true;
	}
}
