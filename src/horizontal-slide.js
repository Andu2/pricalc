import { cubicOut } from "svelte/easing";

// didn't end up needing this. Use css transition instead
export function horizontalSlide(node, { delay = 0, duration = 400, easing = cubicOut }) {
	const style = getComputedStyle(node);
	const width = parseFloat(style.width);
	const padding_left = parseFloat(style.paddingTop);
	const padding_right = parseFloat(style.paddingBottom);
	const margin_left = parseFloat(style.marginTop);
	const margin_right = parseFloat(style.marginBottom);
	const border_left_width = parseFloat(style.borderTopWidth);
	const border_right_width = parseFloat(style.borderBottomWidth);
	return {
		delay,
		duration,
		easing,
		css: t => "overflow: hidden;" +
			`width: ${t * width}px;` +
			`padding-left: ${t * padding_left}px;` +
			`padding-right: ${t * padding_right}px;` +
			`margin-left: ${t * margin_left}px;` +
			`margin-right: ${t * margin_right}px;` +
			`border-left-width: ${t * border_left_width}px;` +
			`border-right-width: ${t * border_right_width}px;`
	};
}
