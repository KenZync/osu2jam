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
	songID: number
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
