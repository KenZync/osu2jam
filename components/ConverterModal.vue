<template>
	<UCard>
		{{ message }}
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

const message = ref('Converting OJM')

async function transcode(music: File) {
	const newOggFileName = music.name + '.ogg'
	const ffmpeg = new FFmpeg()
	await ffmpeg.load({
		coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
		wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'applicaiton/wasm'),
		workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
	})
	message.value = 'Converting OJM'
	let arrayBuffer = await music?.arrayBuffer()
	const uInt8Array = new Uint8Array(arrayBuffer as ArrayBuffer)
	await ffmpeg.writeFile(music.name, uInt8Array)

	const command = ['-i', music.name]
	console.log(props.append)
	if (props.append > 0) {
		// Add silence for append amount
		command.push('-af', `adelay=${props.append}|${props.append}`)
		// command.push('-af', `adelay=10000|10000`)
	} else if (props.append < 0) {
		// Seek to append amount
		command.push('-ss', Math.abs(props.append / 1000).toString())
	}
	command.push('-c:a', 'libvorbis', newOggFileName)
	console.log(command)
	await ffmpeg.exec(command)

	message.value = 'OJM is Done'
	const data = (await ffmpeg.readFile(newOggFileName)) as Uint8Array
	return { name: newOggFileName, data }
}
</script>
