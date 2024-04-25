// //**dataURL to blob**
// export function dataURLtoBlob(dataurl) {
// 	var arr = dataurl.split(','),
// 		mime = arr[0].match(/:(.*?);/)[1],
// 		bstr = atob(arr[1]),
// 		n = bstr.length,
// 		u8arr = new Uint8Array(n)
// 	while (n--) {
// 		u8arr[n] = bstr.charCodeAt(n)
// 	}
// 	return new Blob([u8arr], { type: mime })
// }

// //**blob to dataURL**
// export function blobToDataURL(blob, callback) {
// 	var a = new FileReader()
// 	a.onload = function (e) {
// 		callback(e.target.result)
// 	}
// 	a.readAsDataURL(blob)
// }

// Convert data URL to Blob
// export function dataURLtoBlob(dataurl: string): Blob {
// 	const arr: string[] = dataurl.split(',')
// 	const mime: string | null = arr[0].match(/:(.*?);/)?.[1] || ''
// 	const bstr: string = atob(arr[1])
// 	const n: number = bstr.length
// 	const u8arr: Uint8Array = new Uint8Array(n)
// 	while (n--) {
// 		u8arr[n] = bstr.charCodeAt(n)
// 	}
// 	return new Blob([u8arr], { type: mime })
// }

// // Convert Blob to data URL
// export function blobToDataURL(blob: Blob): Promise<string> {
// 	return new Promise<string>((resolve, reject) => {
// 		const reader = new FileReader()
// 		reader.onload = () => {
// 			if (typeof reader.result === 'string') {
// 				resolve(reader.result)
// 			} else {
// 				reject(new Error('Failed to convert blob to data URL'))
// 			}
// 		}
// 		reader.onerror = reject
// 		reader.readAsDataURL(blob)
// 	})
// }

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
