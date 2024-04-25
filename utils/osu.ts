import { ControlPointGroup, DifficultyPoint, TimingPoint } from 'osu-classes'
import { BeatmapDecoder } from 'osu-parsers'

const maxSub = 192

export const parseOsuFile = async () => {
	const data: Blob = await $fetch('/one.osu', {})

	const osuTextFile = await data.text()
	const decoder = new BeatmapDecoder()
	const parsedOsu = decoder.decodeFromString(osuTextFile)
	const parsedPackage: ojnPackage = {}

	console.log(parsedOsu.bpm)

	let timing: number
	let sv: number = 1
	let lastTiming = 0
	console.log(parsedOsu)
	const firstTimingBpm = parsedOsu.controlPoints.groups[0].startTime
	// const firstTimingNote = parsedOsu.controlPoints.groups[0].startTime

	// Control points
	if (parsedOsu.controlPoints.groups.length > 0) {
		const lastControlPoint = parsedOsu.controlPoints.groups[parsedOsu.controlPoints.groups.length - 1]
		lastTiming = Math.max(lastTiming, lastControlPoint.startTime)
	}

	// Hit objects
	if (parsedOsu.hitObjects.length > 0) {
		const lastHitObject = parsedOsu.hitObjects[parsedOsu.hitObjects.length - 1]
		if ((lastHitObject as any).endTime) {
			lastTiming = Math.max(lastTiming, lastHitObject.startTime, (lastHitObject as any).endTime)
		} else {
			lastTiming = Math.max(lastTiming, lastHitObject.startTime)
		}
	}

	const mainBpm = round(parsedOsu.bpm)
	const mainBeatLength = calculateBeatLength(mainBpm)

	const appendOffset = mainBeatLength * 4 - firstTimingBpm

	const beatObject: BeatObject[] = []

	//BPM
	let prevBeatLength: number = mainBeatLength
	let prevTiming: number = 0
	let measureDigit = 0
	let nowMeasure: number = 0
	let nowSub = 0
	let bpm = -1
	let timingPoint = []
	parsedOsu.controlPoints.groups.forEach((group, i) => {
		let duration = 0
		// bpm = -1
		group.controlPoints.forEach((point, j) => {
			if (point instanceof TimingPoint) {
				bpm = point.bpm

				timing = point.startTime
			}
			if (point instanceof DifficultyPoint) {
				sv = point.sliderVelocity
				timing = point.startTime
			}
		})

		const nowBpm = round(bpm * sv)
		// console.log('SV', nowBpm'SV', , sv)

		sv = 1
		const nowBeatLength = calculateBeatLength(nowBpm)

		duration = timing - prevTiming
		const relativeMeasureLength = calculateMeasure(duration, prevBeatLength)

		nowMeasure = nowMeasure + relativeMeasureLength
		measureDigit = calculateMeasureDigit(nowMeasure)
		nowSub = calculateSubmeasure(nowMeasure, maxSub)
		prevBeatLength = nowBeatLength
		prevTiming = timing
		// console.log('BPM', nowBpm, timing, prevTiming, duration, nowMeasure)

		if (!parsedPackage[measureDigit]) {
			parsedPackage[measureDigit] = {
				1: {
					maxSub: maxSub,
					Events: []
				}
			}
		}

		const event: O2Event = {
			type: 'bpm',
			value: nowBpm,
			sub: nowSub
		}

		beatObject.push({
			offset: timing,
			beatLength: nowBeatLength,
			bpm: nowBpm,
			measure: nowMeasure,
			sub: nowSub
		})

		parsedPackage[measureDigit][1].Events.push(event)
	})

	// TODO MAKE IT BETTER
	if (beatObject[0].offset !== 0) {
		beatObject.unshift({
			offset: 0,
			beatLength: mainBeatLength,
			bpm: mainBpm,
			measure: 0,
			sub: 0
		})
	}

	//NOTE
	parsedOsu.hitObjects.forEach((note) => {
		const timing = note.startTime
		let measure = 0
		let nowSub = 0
		let measureDigit = 0
		let foundObject: BeatObject = {
			offset: 0,
			bpm: 0,
			beatLength: 0,
			measure: 0,
			sub: 0
		}

		for (const [index, obj] of beatObject.entries()) {
			const nextObj: BeatObject = beatObject[index + 1]
			if (nextObj !== undefined) {
				if (timing >= obj.offset && timing < nextObj.offset) {
					foundObject = obj
					break
				}
			} else {
				foundObject = obj
				break
			}
		}

		const relativeOffset = timing - foundObject.offset

		measure = foundObject.measure + calculateMeasure(relativeOffset, foundObject.beatLength)
		nowSub = calculateSubmeasure(measure, maxSub)
		measureDigit = calculateMeasureDigit(measure)

		const noteEvent: O2Event = {
			type: 'note',
			value: 1,
			volume: 0,
			pan: 0,
			noteType: 0,
			sub: nowSub
		}
		const key = calKey(note.startPosition.x)

		if (!parsedPackage[measureDigit]) {
			parsedPackage[measureDigit] = {
				[key]: {
					maxSub: maxSub,
					Events: []
				}
			}
		}

		if (!parsedPackage[measureDigit][key]) {
			parsedPackage[measureDigit][key] = {
				maxSub: maxSub,
				Events: []
			}
		}

		const hitType = Number(note.hitType)
		if (hitType === 1 || hitType === 5) {
			parsedPackage[measureDigit][key].Events.push(noteEvent)
		}

		if (note.hitType === 128) {
			let startLNEvent: O2Event = {
				type: 'note',
				value: 1,
				volume: 0,
				pan: 0,
				noteType: 2,
				sub: nowSub
			}
			parsedPackage[measureDigit][key].Events.push(startLNEvent)

			let endMeasure = 0
			let endNowSub = 0
			let endMeasureDigit = 0

			for (const [index, obj] of beatObject.entries()) {
				const nextObj: BeatObject = beatObject[index + 1]
				if (nextObj !== undefined) {
					if ((note as any).endTime >= obj.offset && (note as any).endTime < nextObj.offset) {
						foundObject = obj
						break
					}
				} else {
					foundObject = obj
				}
			}

			const relativeOffset = (note as any).endTime - foundObject.offset
			endMeasure = foundObject.measure + calculateMeasure(relativeOffset, foundObject.beatLength)
			endNowSub = calculateSubmeasure(endMeasure, maxSub)
			endMeasureDigit = calculateMeasureDigit(endMeasure)

			let endLNEvent: O2Event = {
				type: 'note',
				value: 1,
				volume: 0,
				pan: 0,
				noteType: 3,
				sub: endNowSub
			}

			if (!parsedPackage[endMeasureDigit]) {
				parsedPackage[endMeasureDigit] = {
					[key]: {
						maxSub: maxSub,
						Events: []
					}
				}
			}

			if (!parsedPackage[endMeasureDigit][key]) {
				parsedPackage[endMeasureDigit][key] = {
					maxSub: maxSub,
					Events: []
				}
			}

			parsedPackage[endMeasureDigit][key].Events.push(endLNEvent)
		}
	})

	for (const measure in parsedPackage) {
		const channels = parsedPackage[measure]
		// Iterating over channels in a measure
		for (const channel in channels) {
			const { maxSub, Events } = channels[channel]
			const numbers: number[] = [192]
			for (const event of Events) {
				// if (event.sub !== 0) {
				numbers.push(event.sub)
				// }
			}
			const dividable = findGCD(numbers)
			const newMaxSub = maxSub / dividable
			parsedPackage[measure][channel].maxSub = newMaxSub

			const newMaxSubArray = Array.from(Array(newMaxSub).keys())

			if (newMaxSubArray.length === 1 && newMaxSubArray[0] === 0) continue

			for (const event of Events) {
				const index = Events.indexOf(event)
				parsedPackage[measure][channel].Events[index].sub = Events[index].sub / dividable
				newMaxSubArray.splice(newMaxSubArray.indexOf(parsedPackage[measure][channel].Events[index].sub), 1)
			}
			newMaxSubArray.forEach((padding) => {
				let paddingNote: O2Event = {
					type: 'padding',
					// type: 'bpm',
					value: 0,
					sub: padding
				}
				parsedPackage[measure][channel].Events.push(paddingNote)
			})
			parsedPackage[measure][channel].Events.sort((a, b) => a.sub - b.sub)
		}
	}
	console.log(parsedPackage)
	createOJN(parsedOsu, parsedPackage, mainBpm)
}

export const parseOsuTextFile = async (data: string) => {
	const decoder = new BeatmapDecoder()
	const parsedOsu = decoder.decodeFromString(data)
	return parsedOsu
}
