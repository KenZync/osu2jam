import { Buffer } from 'buffer'
export const createOJM = async (name: string, data: Uint8Array, songID: number) => {
	const m30Header = new Uint8Array(28)
	const m30SampleHeader = new Uint8Array(52)
	const dataViewM30Header = new DataView(m30Header.buffer)
	const dataViewmM30SampleHeader = new DataView(m30SampleHeader.buffer)

	let m30HeaderData = {
		signature: Buffer.from('M30\x00'),
		file_format_version: 196608,
		encryption_flag: 0,
		sample_count: 1,
		samples_offset: 28,
		payload_size: 0,
		padding: 0
	}

	let m30SampleHeaderData = {
		// sample_name: Buffer.from(name),
		sample_size: data.byteLength,
		sample_codec_code: 5,
		sample_unk_fixed: 2,
		sample_music_flag: 1,
		sample_ref: 0,
		sample_unk_zero: 0,
		sample_pcm_samples: 0
	}

	let cursor = 0

	dataViewM30Header.setInt32(cursor, m30HeaderData.signature.readUInt32LE(0), true)
	cursor += 4
	dataViewM30Header.setInt32(cursor, m30HeaderData.file_format_version, true)
	cursor += 4
	dataViewM30Header.setInt32(cursor, m30HeaderData.encryption_flag, true)
	cursor += 4
	dataViewM30Header.setInt32(cursor, m30HeaderData.sample_count, true)
	cursor += 4
	dataViewM30Header.setInt32(cursor, m30HeaderData.samples_offset, true)
	cursor += 4
	dataViewM30Header.setInt32(cursor, m30HeaderData.payload_size, true)
	cursor += 4
	dataViewM30Header.setInt32(cursor, m30HeaderData.padding, true)

	cursor = 0
	const nameBuffer = Buffer.from(name, 'binary')
	for (let i = 0; i < Math.min(nameBuffer.length, 32); i++) {
		dataViewmM30SampleHeader.setInt8(cursor + i, nameBuffer[i])
	}
	cursor += 32
	dataViewmM30SampleHeader.setInt32(cursor, m30SampleHeaderData.sample_size, true)
	cursor += 4
	dataViewmM30SampleHeader.setInt16(cursor, m30SampleHeaderData.sample_codec_code, true)
	cursor += 2
	dataViewmM30SampleHeader.setInt16(cursor, m30SampleHeaderData.sample_unk_fixed, true)
	cursor += 2
	dataViewmM30SampleHeader.setInt32(cursor, m30SampleHeaderData.sample_music_flag, true)
	cursor += 4
	dataViewmM30SampleHeader.setInt16(cursor, m30SampleHeaderData.sample_ref, true)
	cursor += 2
	dataViewmM30SampleHeader.setInt16(cursor, m30SampleHeaderData.sample_unk_zero, true)
	cursor += 2
	dataViewmM30SampleHeader.setInt32(cursor, m30SampleHeaderData.sample_pcm_samples, true)

	const fileName = 'o2ma' + songID + '.ojm'
	const blob = new Blob([dataViewM30Header.buffer, dataViewmM30SampleHeader.buffer, data.buffer], {
		type: 'application/octet-stream'
	})
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

// m30_header_format = '<4siiiiii'
// m30_sample_header_format = "<32sihhihhi"

//  {'signature': b'M30\x00', 'file_format_version': 196608, 'encryption_flag': 16, 'sample_count': 1, 'samples_offset': 28, 'payload_size': 2957630, 'padding': 0}
// {'sample_name': b'BSPower Explosion1\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00', 'sample_size': 2957574, 'sample_codec_code': 5, 'sample_unk_fixed': 2, 'sample_music_flag': 1, 'sample_ref': 0, 'sample_unk_zero': 0, 'sample_pcm_samples': 27408768}
