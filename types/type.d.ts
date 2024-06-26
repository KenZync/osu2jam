import { Beatmap } from 'osu-classes'

declare global {
	interface ojnPackage {
		[Measure: string]: {
			[Channel: string]: {
				maxSub: number
				Events: O2Event[]
			}
		}
	}

	interface O2Event {
		type: string
		value: number
		volume?: number
		pan?: number
		noteType?: number
		sub: number
	}

	interface Header {
		songId: number
		bpm: number
		difficulty: Difficulty
		bmpSize: number
		title: string
		artist: string
		noter: string
		ojmFile: string
		coverSize: number
		coverOffset: number
		image: string
		bmp: string
	}

	interface Difficulty {
		easy: DifficultyDetails
		normal: DifficultyDetails
		hard: DifficultyDetails
	}

	interface DifficultyDetails {
		level: number
		noteCount: number
		eventCount: number
		measureCount: number
		packageCount: number
		duration: number
		offset: number
	}

	interface BeatObject {
		offset: number
		bpm: number
		beatLength: number
		measure: number
		sub: number
	}

	interface Metadata {
		title: string
		artist: string
		artistUnicode: string
		titleUnicode: string
		difficulty: number
		creator: string
		bpm: number
		version: string
		background: string | null
		audioFilename: string
	}

	interface Folder {
		id: number
		name: string
		files: File[]
		images: { [imageFileName: string]: string }
	}
	// 	images: { [name: string]: string }
	// }

	interface BeatMapList {
		songId: number
		folderId: number
		beatmap: Beatmap
		stars: number
		// metadata: Metadata
	}

	interface OJM {
		name: string
		data: Uint8Array
	}
}
