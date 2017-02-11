import { App } from 'ionic-angular';
import { ElementRef, HostListener, Directive, Input } from '@angular/core';

import { ImageViewer } from './image-viewer';

@Directive({
	selector: '[imageViewer]'
})
export class ImageViewerDirective {
	@Input() zoom: string;

	constructor(
		private _app: App,
		private _el: ElementRef
	) { }

	@HostListener('click', ['$event.target'])
	onClick($event): void {
		let position = this._el.nativeElement.getBoundingClientRect();
		let src = this.zoom || this._el.nativeElement.src;
		let imageViewer = ImageViewer.create({image: src, position: position});
		this._app.present(imageViewer, {});
	}
}
