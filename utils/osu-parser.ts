import { HitObject, TimingPoint } from 'osu-classes'
import { BeatmapDecoder } from 'osu-parsers'

const maxSub = 192

export const parseOsuFile = async (beatMapList: BeatMapList, base64Image: string, base64Bmp: string) => {
	const parsedPackage: ojnPackage = {}
	parsedPackage[0] = {
		9: {
			maxSub: 2,
			Events: [
				{
					type: 'padding',
					value: 0,
					sub: 0
				},
				{
					noteType: 0,
					type: 'ogg',
					value: 1,
					sub: 1
				}
			]
		}
	}

	let lastTiming = 0
	let firstTimingBpm = 0
	let firstBpm = 0
	let firstTimingNote = 0
	let firstTiming = 0
	const firstTimingLine = beatMapList.beatmap.controlPoints.groups[0].startTime
	outerLoop: for (const group of beatMapList.beatmap.controlPoints.groups) {
		for (const point of group.controlPoints) {
			if (point instanceof TimingPoint) {
				firstTimingBpm = point.startTime // Storing the start time of the first timing point
				firstBpm = calculateBpm((point.startTime as any)._beatLength)
				break outerLoop // Break out of both loops
			}
		}
	}

	// Control points
	if (beatMapList.beatmap.controlPoints.groups.length > 0) {
		const lastControlPoint =
			beatMapList.beatmap.controlPoints.groups[beatMapList.beatmap.controlPoints.groups.length - 1]
		lastTiming = Math.max(lastTiming, lastControlPoint.startTime)
	}

	// Hit objects
	if (beatMapList.beatmap.hitObjects.length > 0) {
		firstTimingNote = beatMapList.beatmap.hitObjects[0].startTime
		const lastHitObject = beatMapList.beatmap.hitObjects[beatMapList.beatmap.hitObjects.length - 1]
		if ((lastHitObject as any).endTime) {
			lastTiming = Math.max(lastTiming, lastHitObject.startTime, (lastHitObject as any).endTime)
		} else {
			lastTiming = Math.max(lastTiming, lastHitObject.startTime)
		}
	}

	const mainBpm = round(beatMapList.beatmap.bpm)
	const mainBeatLength = calculateBeatLength(mainBpm)
	const mainOneMeasureOffset = mainBeatLength * 4

	let appendOffset = mainOneMeasureOffset - firstTimingBpm
	firstTiming = Math.min(firstTimingNote, firstTimingLine)
	while (firstTiming + appendOffset < mainOneMeasureOffset) {
		appendOffset = appendOffset + mainOneMeasureOffset
	}
	const beatObject: BeatObject[] = []

	//BPM
	let prevBeatLength: number = mainBeatLength
	let prevTiming: number = 0
	let measureDigit = 0
	let nowMeasure: number = 0
	let nowSub = 0

	const newTiming = beatMapList.beatmap.controlPoints.groups.map((group) => {
		const timingPoint = beatMapList.beatmap.controlPoints.timingPointAt(group.startTime)
		const difficultyPoint = beatMapList.beatmap.controlPoints.difficultyPointAt(group.startTime)

		let bpm = calculateBpm((timingPoint as any)._beatLength)
		let calBpm = bpm * round(difficultyPoint.sliderVelocity)

		if (calBpm <= mainBpm / 3) {
			calBpm = mainBpm / 3
		}
		return {
			offset: Math.max(timingPoint.startTime, difficultyPoint.startTime) + appendOffset,
			bpm: calBpm
		}
	})
	interface TimingPoint {
		offset: number
		bpm: number
	}

	const uniqueTiming: TimingPoint[] = newTiming.reduce((acc: TimingPoint[], current: TimingPoint) => {
		const duplicate = acc.find((item) => item.offset === current.offset && item.bpm === current.bpm)
		if (!duplicate) {
			acc.push(current)
		}
		return acc
	}, [])

	uniqueTiming.forEach((timing) => {
		const nowBeatLength = calculateBeatLength(timing.bpm)

		let duration = timing.offset - prevTiming
		const relativeMeasureLength = calculateMeasure(duration, prevBeatLength)

		nowMeasure = nowMeasure + relativeMeasureLength
		measureDigit = calculateMeasureDigit(nowMeasure, maxSub)
		nowSub = calculateSubmeasure(nowMeasure, maxSub)
		prevBeatLength = nowBeatLength
		prevTiming = timing.offset

		if (!parsedPackage[measureDigit]) {
			parsedPackage[measureDigit] = {
				1: {
					maxSub: maxSub,
					Events: []
				}
			}
		}
		if (!parsedPackage[measureDigit][1]) {
			parsedPackage[measureDigit][1] = {
				maxSub: maxSub,
				Events: []
			}
		}

		const event: O2Event = {
			type: 'bpm',
			value: timing.bpm,
			sub: nowSub
		}

		beatObject.push({
			offset: timing.offset,
			beatLength: nowBeatLength,
			bpm: timing.bpm,
			measure: nowMeasure,
			sub: nowSub
		})

		// Check if there's already an event with the same nowSub
		const existingEventIndex = parsedPackage[measureDigit][1].Events.findIndex(
			(existingEvent) => existingEvent.sub === event.sub
		)

		// If there's an existing event with the same nowSub, replace it
		if (existingEventIndex !== -1) {
			parsedPackage[measureDigit][1].Events[existingEventIndex] = event
		} else {
			// If no existing event with the same nowSub, push the new event
			parsedPackage[measureDigit][1].Events.push(event)
		}
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
	beatMapList.beatmap.hitObjects.forEach((note: HitObject) => {
		const timing = note.startTime + appendOffset
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
		measureDigit = calculateMeasureDigit(measure, maxSub)

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
			const startLNEvent: O2Event = {
				type: 'note',
				value: 1,
				volume: 0,
				pan: 0,
				noteType: 2,
				sub: nowSub
			}
			parsedPackage[measureDigit][key].Events.push(startLNEvent)

			let endTime = (note as any).endTime + appendOffset
			let endMeasure = 0
			let endNowSub = 0
			let endMeasureDigit = 0

			for (const [index, obj] of beatObject.entries()) {
				const nextObj: BeatObject = beatObject[index + 1]
				if (nextObj !== undefined) {
					if (endTime >= obj.offset && endTime < nextObj.offset) {
						foundObject = obj
						break
					}
				} else {
					foundObject = obj
				}
			}

			const relativeOffset = endTime - foundObject.offset
			endMeasure = foundObject.measure + calculateMeasure(relativeOffset, foundObject.beatLength)
			endNowSub = calculateSubmeasure(endMeasure, maxSub)
			endMeasureDigit = calculateMeasureDigit(endMeasure, maxSub)

			const endLNEvent: O2Event = {
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
			const numbers: number[] = [maxSub]
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
					value: 0,
					sub: padding
				}
				parsedPackage[measure][channel].Events.push(paddingNote)
			})
			parsedPackage[measure][channel].Events.sort((a, b) => a.sub - b.sub)
		}
	}

	const measureNumbers = Object.keys(parsedPackage)
	const lastMeasureNumber = measureNumbers.length > 0 ? parseInt(measureNumbers[measureNumbers.length - 1]) : 0

	// Increment the last measure number by 1
	const newLastMeasure = lastMeasureNumber + 1

	const event: O2Event = {
		type: 'bpm',
		value: mainBpm,
		sub: 0
	}

	// Create the new measure with channel 1
	const lastMeasure = {
		'1': {
			maxSub: 1,
			Events: [event]
		}
	}

	parsedPackage[newLastMeasure.toString()] = lastMeasure

	createOJN(beatMapList.songId, beatMapList.beatmap, parsedPackage, mainBpm, base64Image, base64Bmp, beatMapList.stars)
	return appendOffset - mainBeatLength * 2
}

export const parseOsuTextFile = async (data: string) => {
	const decoder = new BeatmapDecoder()
	const parsedOsu = decoder.decodeFromString(data)
	return parsedOsu
}
