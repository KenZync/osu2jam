import { type Beatmap } from 'osu-classes'
import { ManiaRuleset } from 'osu-mania-stable'
import { Buffer } from 'buffer'

export const createOJN = (parsedOsu: Beatmap, parsedPackage: ojnPackage, mainBpm: number) => {
	const ruleset = new ManiaRuleset()
	console.log(parsedOsu)
	const difficultyCalculator = ruleset.createDifficultyCalculator(parsedOsu)
	const difficultyAttributes = difficultyCalculator.calculate()
	const level = Math.round(difficultyAttributes.starRating * 10)
	const noteCount = parsedOsu.hittable + parsedOsu.holdable * 2
	const packageCount = Object.values(parsedPackage).reduce((acc, measure) => acc + Object.keys(measure).length, 0)
	const songID = 10000

	const songData = {
		songid: songID,
		signature: Buffer.from('ojn\x00'),
		genre: 0,
		bpm: round(mainBpm),
		level_ex: level,
		level_nx: level,
		level_hx: level,
		unknown: 0,
		event_ex: 2,
		event_nx: 2,
		event_hx: 2,
		notecount_ex: noteCount,
		notecount_nx: noteCount,
		notecount_hx: noteCount,
		measure_ex: 1,
		measure_nx: 1,
		measure_hx: 1,
		package_ex: packageCount,
		package_nx: packageCount,
		package_hx: packageCount,
		old_1: 0,
		old_2: 0,
		old_3: Buffer.from(''),
		bmp_size: 19254,
		old_4: 0,
		title: Buffer.from(parsedOsu.metadata.title),
		artist: Buffer.from(parsedOsu.metadata.artist),
		noter: Buffer.from(parsedOsu.metadata.creator),
		ojm_file: Buffer.from(`o2ma${songID}.ojm`),
		cover_size: 112060,
		time_ex: 4,
		time_nx: 4,
		time_hx: 4,
		note_ex: 300,
		note_nx: 300,
		note_hx: 300,
		cover_offset: 364
	}

	const packedDataT = new Uint8Array(100000000)
	const dataView = new DataView(packedDataT.buffer)
	let cursor = 0
	dataView.setInt32(cursor, songData.songid, true)
	cursor += 4
	dataView.setInt32(cursor, songData.signature.readUInt32LE(0), true) // Assuming signature is a Buffer, use readUInt32LE to convert it to an integer
	cursor += 4
	// Check signature
	if (songData.signature.toString() !== 'ojn\x00') throw 'OJN_SIGNATURE ERROR'

	dataView.setUint8(cursor, 154)
	dataView.setUint8(cursor + 1, 153)
	dataView.setUint8(cursor + 2, 57)
	dataView.setUint8(cursor + 3, 64)

	cursor += 4
	dataView.setInt32(cursor, songData.genre, true)
	cursor += 4
	dataView.setFloat32(cursor, songData.bpm, true)
	cursor += 4

	// Set difficulty levels
	dataView.setInt16(cursor, songData.level_ex, true)
	cursor += 2
	dataView.setInt16(cursor, songData.level_nx, true)
	cursor += 2
	dataView.setInt16(cursor, songData.level_hx, true)
	cursor += 2
	cursor += 2 // Ignore next short

	// Set event counts
	dataView.setInt32(cursor, songData.event_ex, true)
	cursor += 4
	dataView.setInt32(cursor, songData.event_nx, true)
	cursor += 4
	dataView.setInt32(cursor, songData.event_hx, true)
	cursor += 4

	// Set note counts
	dataView.setInt32(cursor, songData.notecount_ex, true)
	cursor += 4
	dataView.setInt32(cursor, songData.notecount_nx, true)
	cursor += 4
	dataView.setInt32(cursor, songData.notecount_hx, true)
	cursor += 4

	// Set measure counts
	dataView.setInt32(cursor, songData.measure_ex, true)
	cursor += 4
	dataView.setInt32(cursor, songData.measure_nx, true)
	cursor += 4
	dataView.setInt32(cursor, songData.measure_hx, true)
	cursor += 4

	// Set package counts
	dataView.setInt32(cursor, songData.package_ex, true)
	cursor += 4
	dataView.setInt32(cursor, songData.package_nx, true)
	cursor += 4
	dataView.setInt32(cursor, songData.package_hx, true)
	cursor += 4

	// Set old values
	dataView.setInt16(cursor, songData.old_1, true)
	cursor += 2
	dataView.setInt16(cursor, songData.old_2, true)
	cursor += 2
	cursor += 20 // Assuming old_3 is a Buffer of length 0
	let bmpSize = cursor
	dataView.setInt32(cursor, songData.bmp_size, true)
	cursor += 4
	dataView.setInt32(cursor, songData.old_4, true)
	cursor += 4

	// Set title
	const titleBuffer = Buffer.from(songData.title.toString(), 'binary')
	for (let i = 0; i < Math.min(titleBuffer.length, 64); i++) {
		dataView.setInt8(cursor + i, titleBuffer[i])
	}
	cursor += 64

	// Set artist
	const artistBuffer = Buffer.from(songData.artist.toString(), 'binary')
	for (let i = 0; i < Math.min(artistBuffer.length, 32); i++) {
		dataView.setInt8(cursor + i, artistBuffer[i])
	}
	cursor += 32

	// Set noter
	const noterBuffer = Buffer.from(songData.noter.toString(), 'binary')
	for (let i = 0; i < Math.min(noterBuffer.length, 32); i++) {
		dataView.setInt8(cursor + i, noterBuffer[i])
	}
	cursor += 32

	// Set ojm_file
	const ojmFileBuffer = Buffer.from(songData.ojm_file.toString(), 'binary')
	for (let i = 0; i < Math.min(ojmFileBuffer.length, 32); i++) {
		dataView.setInt8(cursor + i, ojmFileBuffer[i])
	}
	cursor += 32

	let coverSize = cursor
	dataView.setInt32(cursor, songData.cover_size, true)
	cursor += 4

	// Set durations
	dataView.setInt32(cursor, songData.time_ex, true)
	cursor += 4
	dataView.setInt32(cursor, songData.time_nx, true)
	cursor += 4
	dataView.setInt32(cursor, songData.time_hx, true)
	cursor += 4

	// Set note offsets
	dataView.setInt32(cursor, songData.note_ex, true)
	cursor += 4
	dataView.setInt32(cursor, songData.note_nx, true)
	cursor += 4
	dataView.setInt32(cursor, songData.note_hx, true)
	cursor += 4

	// Set cover offset
	let coverOffset = cursor
	dataView.setInt32(cursor, songData.cover_offset, true)
	cursor += 4

	for (const measure in parsedPackage) {
		for (const channel in parsedPackage[measure]) {
			// Measure
			dataView.setInt32(cursor, Number(measure), true)
			cursor += 4

			//Channel
			dataView.setInt16(cursor, Number(channel), true)
			cursor += 2

			//Events
			dataView.setInt16(cursor, parsedPackage[measure][channel].maxSub, true)
			cursor += 2

			for (const event in parsedPackage[measure][channel].Events) {
				if (parsedPackage[measure][channel].Events[event].type === 'bpm') {
					// //BPM
					dataView.setFloat32(cursor, parsedPackage[measure][channel].Events[event].value, true)
					cursor += 4
				}

				if (parsedPackage[measure][channel].Events[event].type === 'padding') {
					// //BPM
					dataView.setInt32(cursor, 0, true)
					cursor += 4
				}

				if (parsedPackage[measure][channel].Events[event].type === 'note') {
					//VALUE
					dataView.setInt16(cursor, 1, true)
					cursor += 2
					//VolumePan
					dataView.setInt8(cursor, 0)
					cursor += 1
					//TYPE
					if (parsedPackage[measure][channel].Events[event].noteType !== undefined) {
						dataView.setInt8(cursor, parsedPackage[measure][channel].Events[event].noteType)
					}
					cursor += 1
				}
			}
		}
	}

	// dataView.buffer
	// const newBuffer = new ArrayBuffer(cursor)
	// const newIntArray = new Uint8Array(newBuffer)
	// newIntArray.set(new Uint8Array(dataView.buffer)) // 1s

	// Set the desired file name
	const fileName = 'o2ma10000.ojn'
	const blob = new Blob([dataView.buffer.slice(0, cursor)], { type: 'application/octet-stream' })
	// Create an object URL for the blob
	const url = URL.createObjectURL(blob)
	// Create an anchor element to trigger the download
	const a = document.createElement('a')
	a.href = url
	a.download = fileName
	// Append the anchor to the document body and trigger the click event
	document.body.appendChild(a)
	a.click()
	// Clean up by removing the anchor and revoking the object URL
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}
