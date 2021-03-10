<script>
import { spine } from "@src/spine-webgl";
import { onMount } from "svelte";

// This spine .cysp handling stuff came from esterTion: https://redive.estertion.win/spine/

let canvas;

// load the loader...
onMount(function() {
	if (typeof window !== "undefined") {
		var config = { alpha: false };
		var gl = canvas.getContext("webgl", config) || canvas.getContext("experimental-webgl", config);
		if (!gl) {
			alert('WebGL is unavailable.');
			return;
		}

		gl.clearColor(1, 1, 1, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Create a simple shader, mesh, model-view-projection matrix and SkeletonRenderer.
		var shader = spine.webgl.Shader.newTwoColoredTextured(gl);
		var batcher = new spine.webgl.PolygonBatcher(gl);
		var mvp = new spine.webgl.Matrix4();		
		var skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
		var shapes = new spine.webgl.ShapeRenderer(gl);

		Promise.all([
			fetch("animations/000000_CHARA_BASE.cysp").then(function(data) { return data.arrayBuffer() }),
			fetch("animations/06_COMMON_BATTLE.cysp").then(function(data) { return data.arrayBuffer() }),
			fetch("animations/102211.atlas").then(function(data) { return data.text() }),
			fetch("animations/102211.png").then(function(data) { return data.blob() })
		]).then(function(responses) {
			var charaBaseSpineData = responses[0];
			var charaClassAnimations = responses[1];
			var spineAtlas = responses[2];
			var imgBlob = responses[3];

			var img = new Image();
			img.onload = function () {
				var imgTexture = new spine.webgl.GLTexture(gl, img);
				URL.revokeObjectURL(img.src);
				var atlas = new spine.TextureAtlas(spineAtlas, function (path) {
					return imgTexture;
				});
				var atlasLoader = new spine.AtlasAttachmentLoader(atlas);

				var classAnimations = sliceCyspAnimation(charaClassAnimations);

				var animationCount = 0;
				var classAnimCount = classAnimations.count;
				animationCount += classAnimCount;

				//assume always no more than 128 animations
				var newBuffSize = charaBaseSpineData.byteLength - 64 + 1 + classAnimations.data.byteLength;
				var newBuff = new Uint8Array(newBuffSize);
				var offset = 0;
				newBuff.set(new Uint8Array(charaBaseSpineData.slice(64)), 0);
				offset += charaBaseSpineData.byteLength - 64;
				newBuff[offset] = animationCount;
				offset++;
				newBuff.set(new Uint8Array(classAnimations.data), offset);
				offset += classAnimations.data.byteLength;

				var skeletonBinary = new spine.SkeletonBinary(atlasLoader);
				var skeletonData = skeletonBinary.readSkeletonData(newBuff.buffer);
				var skeleton = new spine.Skeleton(skeletonData);
				skeleton.setSkinByName('default');
				var bounds = calculateBounds(skeleton);

				var useBig = screen.width * devicePixelRatio > 1280;
				//var w = useBig ? 1920 : 1280;
				//var h = useBig ? 1080 : 720;
				var w = canvas.clientWidth * devicePixelRatio;
				var h = canvas.clientHeight * devicePixelRatio;
				if (canvas.width != w || canvas.height != h) {
					canvas.width = w;
					canvas.height = h;
				}
				var centerX = bounds.offset.x + bounds.size.x / 2;
				var centerY = bounds.offset.y + bounds.size.y / 2;
				var scaleX = bounds.size.x / canvas.width;
				var scaleY = bounds.size.y / canvas.height;
				var scale = Math.max(scaleX, scaleY) * 1.2;
				if (scale < 1) scale = 1;
				var width = canvas.width * scale;
				var height = canvas.height * scale;
				mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
				gl.viewport(0, 0, canvas.width, canvas.height);

				var animationStateData = new spine.AnimationStateData(skeleton.data);
				var animationState = new spine.AnimationState(animationStateData);
				animationState.setAnimation(0, "06_walk", true);

				let skeletonConfig = { skeleton: skeleton, state: animationState, bounds: bounds, premultipliedAlpha: true }
				let glConfig = {
					gl: gl,
					shader: shader,
					batcher: batcher,
					skeletonRenderer: skeletonRenderer,
					mvp: mvp
				}
				requestAnimationFrame(function() {
					render(glConfig, skeletonConfig, 0, Date.now() / 1000)
				});
			}
			img.src = URL.createObjectURL(imgBlob);
		});
	}
});

function sliceCyspAnimation(buf) {
	var view = new DataView(buf);
	var count = view.getInt32(12, true);
	return {
		count: count,
		data: buf.slice((count + 1) * 32)
	};
}

function calculateBounds(skeleton) {
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform();
	var offset = new spine.Vector2();
	var size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	offset.y = 0
	return { offset: offset, size: size };
}

function render(glConfig, skeletonConfig, left, lastFrameTime) {
	var now = Date.now() / 1000;
	var delta = now - lastFrameTime;

	var state = skeletonConfig.state;
	var skeleton = skeletonConfig.skeleton;
	var bounds = skeletonConfig.bounds;
	var premultipliedAlpha = skeletonConfig.premultipliedAlpha;

	canvas.style.left = left + "%";
	var newLeft = left + delta * 5;

	var bgColor = [1, 1, 1, 1]
	glConfig.gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1);
	glConfig.gl.clear(glConfig.gl.COLOR_BUFFER_BIT);

	// Apply the animation state based on the delta time.
	state.update(delta);
	state.apply(skeleton);
	skeleton.updateWorldTransform();

	// Bind the shader and set the texture and model-view-projection matrix.
	glConfig.shader.bind();
	glConfig.shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
	glConfig.shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, glConfig.mvp.values);

	// Start the batch and tell the SkeletonRenderer to render the active skeleton.
	glConfig.batcher.begin(glConfig.shader);

	glConfig.skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
	glConfig.skeletonRenderer.draw(glConfig.batcher, skeleton);
	glConfig.batcher.end();

	glConfig.shader.unbind();

	requestAnimationFrame(function() {
		render(glConfig, skeletonConfig, newLeft, now);
	});
}

</script>

<div class="loading-text">Loading...</div>

<div class="wrap">
	<canvas bind:this={canvas} id="loading-animation" />
</div>

<style>
div.loading-text {
	text-align: center;
	z-index: 5;
	font-size: 14pt;
}
div.wrap {
	text-align: left;
	position: relative;
	width: 100%;
	overflow: hidden;
}
canvas {
	position: relative;
	top: -50px;
	width: 600px;
}
</style>