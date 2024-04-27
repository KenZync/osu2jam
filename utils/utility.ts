export async function blobToBase64Async(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader()
		fileReader.onerror = (e) => reject(fileReader.error)
		fileReader.onloadend = (e) => {
			const dataUrl = fileReader.result as string
			// remove "data:mime/type;base64," prefix from data url
			const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1)
			resolve(base64)
		}
		fileReader.readAsDataURL(blob)
	})
}
