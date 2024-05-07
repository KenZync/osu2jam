import { get, set } from 'idb-keyval'

const KEY = 'ffmpeg-core.wasm'

export async function getFfmpegWasmPath() {
	let buffer = await get(KEY)
	if (!buffer) {
		console.log('fetching wasm file...')
		const response = await fetch('/ffmpeg-core.wasm')
		buffer = await response.arrayBuffer()
		set(KEY, buffer)
		console.log('wasm file fetched and stored in indexedDB')
	}
	console.log('wasm file loaded')
	const blob = new Blob([buffer], { type: 'application/wasm' })
	const url = URL.createObjectURL(blob)

	return url
}
