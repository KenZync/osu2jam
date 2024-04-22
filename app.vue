<template>
	<div class="bg-gradient-26 w-screen h-screen flex flex-col items-center justify-center">
		<!-- <video :src="video" controls /> -->
    A
    <audio controls>
      <source :src="audioURL" type="audio/ogg"></source>
      <source :src="audioURL" type="audio/mpeg"></source>
    </audio>
    B
    <audio controls>
      <source :src="audio" type="audio/ogg"></source>
      <source :src="audio" type="audio/mpeg"></source>
    </audio>
		<br />
		<button @click="transcode">Start</button>
		<p>{{ message }}</p>
	</div>
</template>

<script setup lang="ts">
import { FFmpeg } from '@ffmpeg/ffmpeg'
import type { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

// const [loaded, setLoaded] = useState(false)
// const ffmpegRef = useRef(new FFmpeg())
// const videoRef = useRef(null)
// const messageRef = useRef(null)
// const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
// const baseURL = '/_nuxt/node_modules/@ffmpeg/core/dist/esm/'
const videoURL = '/flame.avi'
const audioURL = '/test.mp3'

const message = ref('Click Start to Transcode')
let video = ref('')
let audio = ref('')


async function transcode() {
	const ffmpeg = new FFmpeg()
	await ffmpeg.load({
		coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
		wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'applicaiton/wasm'),
		workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
	})
	message.value = 'Start transcoding'
	// await ffmpeg.writeFile('test.avi', await fetchFile(videoURL))
	await ffmpeg.writeFile('test.mp3', await fetchFile(audioURL))

	// await ffmpeg.exec(['-i', 'test.avi', 'test.mp4'])
	await ffmpeg.exec(['-i', 'test.mp3', '-c:a', 'libvorbis', 'test.ogg'])

	message.value = 'Complete transcoding'
	const data = await ffmpeg.readFile('test.ogg')
  console.log(data)
	// video.value = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' }))
	audio.value = URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: 'audio/ogg' }))

  window.open(audio.value);

}
</script>
