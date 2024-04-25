<
<template>
	<UButton color="pink" @click="parseOsuFile">Osu</UButton>

	<DropZone class="drop-area text-center" @files-dropped="onInputChange" #default="{ dropZoneActive }">
		<div class="flex items-center">
			<label for="file-input" class="border-dashed border-2 cursor-pointer py-32 px-2 w-full">
				<span v-if="dropZoneActive">
					<span>Drop Them Here </span>
					<span>to add them</span>
				</span>
				<span v-else>
					<div>Drag & Drop</div>
					<span>
						.osz files here or osu song folder or
						<span class="font-bold italic">click</span>
					</span>
				</span>

				<input class="hidden" type="file" id="file-input" @change="onInputChange" multiple accept=".osz" />
			</label>
		</div>
	</DropZone>
	{{ folderList }}
	<!-- {{ entryList }} -->
	<!-- <div v-for="file in osuFileList">
		<div class="">{{ file.name }}</div>
		<div v-for="beatmap in osuBeatmap">
			{{ beatmap.bpm }}
		</div>
	</div> -->
</template>

<script setup lang="ts">
import { BlobReader, BlobWriter, TextReader, TextWriter, ZipReader, ZipWriter, type Entry } from '@zip.js/zip.js'
import type { Beatmap } from 'osu-classes'

// const osuFileList = ref<File[]>([])
const osuBeatmap = ref<BeatMapList[]>([])
const folderList = ref<Folder[]>([])
// const entryList = ref<EntryList[]>([])

interface Folder {
	id: number
	name: string
	files: File[]
}

interface BeatMapList {
	folder_id: string
	beatmap: Beatmap
}

const onInputChange = async (e: any) => {
	folderList.value = []
	osuBeatmap.value = []
	// entryList.value = []
	console.log(typeof e)
	let originalFiles
	let drop = false
	if (e.target.files) {
		originalFiles = e.target.files
	} else {
		originalFiles = e.dataTransfer.items
		drop = true
	}

	try {
		let files: any[] = []
		if (drop) {
			for (let item of originalFiles) {
				if (item != null && item.kind == 'file') files.push(item.webkitGetAsEntry())
			}
		} else {
			files = originalFiles
		}
		// console.log(files)
		// Array.from(files).map(async (file) => {
		// if (file.isDirectory) {
		// 	let fileEntries = file.readEntries
		// }
		// console.log('isFile', file.name)
		// console.log('isFolder', file.name)
		// })
		let allFiles = await parseFiles(files, drop)
		// console.log(allFiles)

		let id = 0
		let unknownFolder: Folder = {
			id: id,
			name: 'unknown',
			files: []
		}
		Array.from(allFiles).map(async (file) => {
			id++

			if (file.name.match(/\.osz$|\.zip$|\.7zip$\.rar$/i)) {
				let osz: Folder = {
					id: id,
					name: file.name,
					files: []
				}
				const zipFileReader = new BlobReader(file)
				const zipReader = new ZipReader(zipFileReader)
				const entries = await zipReader.getEntries()

				await Promise.all(
					entries.map(async (entry) => {
						const blob = await entry.getData!(new BlobWriter())
						let extractedFile = new File([blob], entry.filename)
						osz.files.push(extractedFile)
					})
				)
				// entries.forEach(async (entry) => {
				// 	const textWriter = new TextWriter()

				// 	const blobWriter = new BlobWriter()

				// 	// entryListObj.entry.push(entry)
				// 	// console.log(entry.filename)
				// 	// oneFolder.files.push(entry)
				// 	// console.log('FILE IN OSZ')
				// 	// if (!entry.filename.match(/\.osu$/i)) {
				// 	// 	const osu = await entry.getData!(textWriter)
				// 	// }
				// 	const blob = await entry.getData!(blobWriter)

				// 	// 	console.log(entry.filename)
				// 	// console.log(entry.filename, await blobToDataURL(osu))
				// 	// console.log(entry.filename, await blobToBase64Async(osu))
				// 	let extractedFile = new File([blob], entry.filename)
				// 	osz.files.push(extractedFile)
				// 	// console.log(extractedFile)

				// 	// }
				// 	// 	console.log(await parseOsuTextFile(osu))
				// 	// 	osuBeatmap.value.push(await parseOsuTextFile(osu))
				// 	// }
				// })
				folderList.value.push(osz)
			} else {
				if (Array.isArray(file.files)) {
					let oneFolder: Folder = {
						id: id,
						name: 'unknown',
						files: []
					}
					// console.log('FOUND FOLDER')
					oneFolder.name = file.name
					Array.from(file.files).map((oneFile) => {
						oneFolder.files.push(oneFile as File)
					})
					folderList.value.push(oneFolder)
				} else {
					// console.log('FOUND FILES')
					unknownFolder.files.push(file)
					// folderList.value.push(oneFolder)
				}
				// if (file.name.match(/\.osu$/i)) {
				// 	const fileReader = new FileReader()
				// 	fileReader.readAsText(file)
				// 	const osu: string = await new Promise((resolve, reject) => {
				// 		fileReader.onload = function (event) {
				// 			resolve(fileReader.result as string)
				// 		}
				// 	})
				// 	console.log(await parseOsuTextFile(osu))
				// }
			}
		})

		if (unknownFolder.files.length !== 0) {
			folderList.value.push(unknownFolder)
		}

		// Array.from(allFiles).map(async (file) => {
		// 	if (file.name.match(/\.osz$|\.zip$|\.7zip$\.rar$/i)) {
		// 		const zipFileReader = new BlobReader(file)
		// 		const zipReader = new ZipReader(zipFileReader)
		// 		const entries = await zipReader.getEntries()
		// 		const textWriter = new TextWriter()

		// 		entries.forEach(async (entry) => {
		// 			if (entry.filename.match(/\.osu$/i)) {
		// 				const osu = await entry.getData!(textWriter)
		// 				console.log(await parseOsuTextFile(osu))
		// 			}
		// 		})
		// 	} else {
		// 		console.log('here')
		// 		if (file.name.match(/\.osu$/i)) {
		// 			const fileReader = new FileReader()
		// 			fileReader.readAsText(file)
		// 			const osu: string = await new Promise((resolve, reject) => {
		// 				fileReader.onload = function (event) {
		// 					resolve(fileReader.result as string)
		// 				}
		// 			})
		// 			console.log(await parseOsuTextFile(osu))
		// 		}
		// 	}
		// })
	} catch (err) {
		alert('err' + err)
	} finally {
	}
}

// onMounted(() => {
// 	parseOsuFile()
// })
</script>
