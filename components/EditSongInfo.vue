<script lang="ts" setup>
const props = defineProps({
	beatmapList: {
		type: Object as () => BeatMapList,
		required: true
	},
	base64Image: {
		type: String,
		required: true
	},
	useDifficultyAsTitle: {
		type: Boolean,
		required: true
	}
})

const emits = defineEmits<{
	close: []
	download: [chart: BeatMapList, useDifficultyAsTitle: boolean]
}>()

const chart = ref(props.beatmapList.beatmap)

const level = computed({
	get: () => calculateLevelFromStars(props.beatmapList.stars),
	set: (value) => {
		props.beatmapList.stars = value / 10
	}
})

const ojm = computed(() => `o2ma${props.beatmapList.songId}.ojm`)
const noteCount = computed(() => chart.value.hittable + chart.value.holdable * 2)
const bpm = computed(() => round(chart.value.bpm))
</script>

<template>
	<USlideover>
		<UCard
			class="flex flex-col flex-1 overflow-y-auto"
			:ui="{
				body: { base: 'flex-1' },
				header: { padding: 'py-3' },
				ring: '',
				divide: 'divide-y divide-gray-100 dark:divide-gray-800'
			}"
		>
			<template #header>
				<div class="flex items-center justify-between">
					<h3 class="font-semibold">Edit Song Info</h3>
					<UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="emits('close')" />
				</div>
			</template>
			<div class="space-y-2">
				<div class="text-center">Cover Image</div>
				<img class="aspect-[4/3]" :src="props.base64Image" />
				<!-- <div class="flex space-x-2">
					<div class="border rounded-md w-full py-2 space-y-2">
						<div class="text-center">Extract Image</div>
						<div class="flex justify-center space-x-4">
							<UButton color="blue" class="px-4">Large</UButton>
							<UButton color="blue" class="px-4">Small</UButton>
						</div>
					</div>
					<div class="border rounded-md w-full py-2 space-y-2">
						<div class="text-center">Replace Image</div>
						<div class="flex justify-center space-x-4">
							<UButton color="blue" class="px-4">Large</UButton>
							<UButton color="blue" class="px-4">Small</UButton>
						</div>
					</div>
				</div> -->
				<div class="border rounded-md w-full py-2 px-2 space-y-2">
					<div>
						<div class="font-medium">Basic Info</div>
						<div class="flex items-center space-x-2">
							<img class="aspect-[1/1] w-20 h-20" :src="props.base64Image" />
							<div class="space-y-2 w-full">
								<div class="flex items-center space-x-2">
									<div class="w-14 text-end">Title:</div>
									<UInput
										:model-value="props.useDifficultyAsTitle ? chart.metadata.version : chart.metadata.title"
										@update:model-value="
											(val) =>
												props.useDifficultyAsTitle ? (chart.metadata.version = val) : (chart.metadata.title = val)
										"
										class="flex-1"
									/>
								</div>
								<div class="flex items-center space-x-2">
									<div class="w-14 text-end">Artist:</div>
									<UInput v-model="chart.metadata.artist" class="flex-1" />
								</div>
								<div class="flex items-center space-x-2">
									<div class="w-14 text-end">Pattern:</div>
									<UInput v-model="chart.metadata.creator" class="flex-1" />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="rounded-lg border  p-3 space-y-3">
					<div class="font-medium">Extras</div>

					<div class="grid grid-cols-2 gap-2">
						<!-- Row 1 -->
						<div class="flex items-center gap-2">
							<label class="w-12">Level:</label>
							<UInput v-model="level" class="flex-1" />
						</div>
						<div class="flex items-center gap-2">
							<label class="w-12">BPM:</label>
							<UInput disabled :value="bpm" class="flex-1 bg-black" />
						</div>
						<div class="flex items-center gap-2">
							<label class="w-12">Time:</label>
							<UInput disabled :value="fancyTimeFormat(chart.length / 1000)" class="flex-1 bg-black" />
						</div>

						<!-- Row 2 -->
						<div class="flex items-center gap-2">
							<label class="w-12">Notes:</label>
							<UInput disabled :value="noteCount" class="flex-1 bg-black" />
						</div>
						<div class="flex items-center gap-2">
							<label class="w-12">Rice:</label>
							<UInput disabled :value="chart.hittable" class="flex-1 bg-black" />
						</div>
						<div class="flex items-center gap-2">
							<label class="w-12">LN:</label>
							<UInput disabled :value="chart.holdable" class="flex-1 bg-black" />
						</div>

						<!-- Row 3 -->
						<div class="flex items-center gap-2">
							<label class="w-12">ID:</label>
							<UInput v-model="props.beatmapList.songId" class="flex-1" />
						</div>
						<div class="flex items-center gap-2">
							<label class="w-12">OJM:</label>
							<UInput disabled :value="ojm" class="flex-1 bg-black" />
						</div>
					</div>
				</div>
				<div class="flex justify-between">
					<UButton
						@click="emits('download', props.beatmapList, props.useDifficultyAsTitle)"
						color="blue"
						class="w-full justify-center px-4"
						size="xl"
						>Download OJN & OJM</UButton
					>
				</div>
			</div>
		</UCard>
	</USlideover>
</template>
