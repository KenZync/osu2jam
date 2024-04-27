<template>
	<UCard>
		<template #header> Converting OJM </template>
		<UProgress :value="percent" indicator />
	</UCard>
</template>

<script setup lang="ts">
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const props = defineProps<{
	music: File
	append: number
	id: number
}>()

const emit = defineEmits(['done'])
// const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'

onMounted(async () => {
	let ojm: OJM = await transcode(props.music)
	await createOJM(ojm.name, ojm.data, props.id)
	emit('done')
})

interface OJM {
	name: string
	data: Uint8Array
}

const percent = ref(0)
const elapse = ref(0)

async function transcode(music: File) {
	const newOggFileName = music.name + '.ogg'
	const ffmpeg = new FFmpeg()
	ffmpeg.on('progress', ({ progress, time }) => {
		percent.value = progress * 100
		elapse.value = time
	})
	await ffmpeg.load({
		coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
		wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'applicaiton/wasm'),
		workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
	})
	let arrayBuffer = await music?.arrayBuffer()
	const uInt8Array = new Uint8Array(arrayBuffer as ArrayBuffer)
	await ffmpeg.writeFile(music.name, uInt8Array)

	const command = ['-i', music.name]
	if (props.append > 0) {
		// Add silence for append amount
		command.push('-af', `adelay=${props.append}|${props.append}`)
	} else if (props.append < 0) {
		// Seek to append amount
		command.push('-ss', Math.abs(props.append / 1000).toString())
	}
	command.push('-vn', '-c:a', 'libvorbis', newOggFileName)
	await ffmpeg.exec(command)
	const data = (await ffmpeg.readFile(newOggFileName)) as Uint8Array
	window.open(URL.createObjectURL(new Blob([(data as Uint8Array).buffer], { type: 'audio/ogg' })))
	return { name: newOggFileName, data }
}
</script>
