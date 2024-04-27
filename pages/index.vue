<template>
	<DropZone class="drop-area text-center" @files-dropped="onInputChange" #default="{ dropZoneActive }">
		<div class="flex items-center">
			<label
				for="file-input"
				class="border-dashed border-2 cursor-pointer w-full h-[140px] flex justify-center items-center"
			>
				<span v-if="dropZoneActive">
					<span>Drop Them Here </span>
					<span>to add them</span>
				</span>
				<span v-else>
					<div>Drag & Drop</div>
					<span>
						osu! song folder or .osz files here or
						<span class="font-bold italic">click</span>
					</span>
				</span>

				<input class="hidden" type="file" id="file-input" @change="onInputChange" multiple accept=".osz" />
			</label>
		</div>
	</DropZone>

	<div class="grid lg:grid-cols-2 gap-3 pt-4">
		<UCard class="group min-h-[140px]" v-for="(chart, i) in osuBeatmapList" :ui="{ body: { padding: '' } }">
			<div class="flex relative">
				<img
					class="absolute rounded-l-md h-[140px] max-w-[186px] min-w-[186px]"
					:src="getImage(chart.folder_id, chart.beatmap.events.backgroundPath || '')"
				/>
				<div class="h-[140px] min-w-[186px] z-10 flex flex-row-reverse">
					<div class="pt-2 pr-2">
						<UTooltip text="o2maID">
							<UBadge
								color="white"
								class="opacity-70 hover:opacity-100 transition"
								size="xs"
								:label="chart.beatmap.metadata.beatmapId"
							/>
						</UTooltip>
					</div>
				</div>

				<div class="flex relative w-full bg-gradient-to-r from-gray-900 rounded-md -ml-1">
					<img
						class="absolute object-cover w-full h-[140px] opacity-10 rounded-md"
						:src="getImage(chart.folder_id, chart.beatmap.events.backgroundPath || '')"
					/>
					<div class="flex flex-col justify-between w-full relative p-2">
						<div class="z-10">
							<div class="font-bold">
								{{ chart.beatmap.metadata.titleUnicode }}
							</div>
							<div class="font-bold text-sm">by {{ chart.beatmap.metadata.artistUnicode }}</div>
						</div>
						<div class="text-sm text-gray-300">
							{{ chart.beatmap.metadata.version }}
						</div>
						<div class="z-10">
							<div class="leading-none text-sm">
								<span class="text-gray-400">charted by </span>
								<span class="font-bold text-gray-200">{{ chart.beatmap.metadata.creator }}</span>
							</div>
							<div class="flex gap-4">
								<UTooltip text="Time / Duration" class="flex text-xs items-center">
									<UIcon name="i-heroicons-clock-solid" />
									<div class="">{{ fancyTimeFormat(chart.beatmap.length / 1000) }}</div>
								</UTooltip>
								<UTooltip text="BPM" class="flex text-xs items-center">
									<UIcon name="i-heroicons-chevron-double-up-solid" />
									<div class="">{{ round(chart.beatmap.bpm) }}</div>
								</UTooltip>
								<UTooltip text="Notes" class="flex text-xs items-center">
									<UIcon name="i-mdi-music-note" dynamic />
									<div class="">{{ chart.beatmap.hittable + chart.beatmap.holdable * 2 }}</div>
								</UTooltip>
							</div>
							<div class="flex justify-between pt-1">
								<UTooltip text="Mode">
									<UBadge color="pink" label="osu!mania 7K" />
								</UTooltip>

								<div class="flex gap-1">
									<UTooltip text="Level Hard / HX">
										<UBadge color="red" :label="Math.round(chart.stars * 10)" />
									</UTooltip>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div
					class="flex-col justify-center items-center space-y-4 flex transition-all opacity-0 group-hover:opacity-100 group-hover:w-16 w-2"
				>
					<UTooltip text="Edit (WIP)">
						<UButton color="pink" variant="ghost" icon="i-heroicons-pencil-square-20-solid" />
					</UTooltip>
					<UTooltip text="Download">
						<UButton
							color="pink"
							variant="ghost"
							icon="i-heroicons-arrow-down-tray"
							@click="
								parseOsuFile(chart as BeatMapList, getImage(chart.folder_id, chart.beatmap.events.backgroundPath || ''))
							"
						/>
					</UTooltip>
				</div>
			</div>
		</UCard>
	</div>
</template>

<script setup lang="ts">
import { BlobReader, BlobWriter, ZipReader } from '@zip.js/zip.js'
import { ManiaRuleset } from 'osu-mania-stable'

useHead({
	title: 'Osu2Jam',
	meta: [{ name: 'description', content: 'Osu to O2Jam Converter' }]
})

const osuBeatmapList = ref<BeatMapList[]>([])
const folderList = ref<Folder[]>([])

const getImage = (folderId: number, imageName: string) => {
	const folder = folderList.value.find((folder) => folder.id === folderId)
	if (!folder) {
		return 'Folder not found'
	}

	// Check if the specified imageName exists in the folder's images
	const imagePath = folder.images[imageName]
	if (!imagePath) {
		return ''
	}

	// You can perform additional operations here, like loading the image
	// For now, just return the imagePath
	return imagePath
}

const onInputChange = async (e: any) => {
	folderList.value = []
	osuBeatmapList.value = []
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
		let allFiles = await parseFiles(files, drop)

		let id = 0
		let unknownFolder: Folder = {
			id: id,
			name: 'unknown',
			files: [],
			images: {}
		}
		await Promise.all(
			Array.from(allFiles).map(async (file) => {
				id++

				if (file.name.match(/\.osz$|\.zip$|\.7zip$|\.rar$/i)) {
					let osz: Folder = {
						id: id,
						name: file.name,
						files: [],
						images: {}
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
					folderList.value.push(osz)
				} else {
					if (Array.isArray(file.files)) {
						let oneFolder: Folder = {
							id: id,
							name: 'unknown',
							files: [],
							images: {}
						}
						oneFolder.name = file.name
						Array.from(file.files).map((oneFile) => {
							oneFolder.files.push(oneFile as File)
						})
						folderList.value.push(oneFolder)
					} else {
						unknownFolder.files.push(file)
					}
				}
			})
		)
		if (unknownFolder.files.length !== 0) {
			folderList.value.push(unknownFolder)
		}
		for (const [index, folder] of folderList.value.entries()) {
			for (const file of folder.files) {
				if (file.name.match(/\.osu$/i)) {
					const fileReader = new FileReader()
					fileReader.readAsText(file)
					const osu: string = await new Promise((resolve) => {
						fileReader.onload = function () {
							resolve(fileReader.result as string)
						}
					})
					const parsedOsu = await parseOsuTextFile(osu)
					const ruleset = new ManiaRuleset()
					if (parsedOsu.difficulty.circleSize === 7) {
						const difficultyCalculator = ruleset.createDifficultyCalculator(parsedOsu)
						const difficultyAttributes = difficultyCalculator.calculate()
						osuBeatmapList.value.push({
							folder_id: folder.id,
							beatmap: parsedOsu,
							stars: difficultyAttributes.starRating
							// metadata: metadata
						})
					}
				}
				if (file.name.match(/\.png$|\.jpg$|\.jpeg$/i)) {
					let base64 = await blobToBase64Async(file)

					// Push the new image object into the images array
					folderList.value[index].images[file.name] = 'data:image/png;base64,' + base64
				}
			}
		}
	} catch (err) {
		alert('err' + err)
	} finally {
	}
}
</script>
