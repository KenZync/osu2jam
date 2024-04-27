import { Bitmap, type CanvasLike } from 'binary-bmp'
import { Buffer } from 'buffer'

export function resizeImage(base64Str: string, inputWidth: number, inputHeight: number, type: string) {
	var img = new Image()
	img.src = base64Str
	var canvas = document.createElement('canvas')
	var ctx = canvas.getContext('2d')
	canvas.width = inputWidth
	canvas.height = inputHeight
	if (type == 'bmp') {
		var oc = document.createElement('canvas')
		var octx = oc.getContext('2d')

		canvas.width = inputWidth // destination canvas size
		canvas.height = inputHeight

		var cur = {
			width: Math.floor(img.width * 0.5),
			height: Math.floor(img.height * 0.5)
		}

		oc.width = cur.width
		oc.height = cur.height

		octx?.drawImage(img, 0, 0, cur.width, cur.height)

		while (cur.width * 0.5 > inputWidth) {
			cur = {
				width: Math.floor(cur.width * 0.5),
				height: Math.floor(cur.height * 0.5)
			}
			octx?.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height)
		}

		ctx?.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height)

		const rgba = Bitmap.fromCanvas(canvas as CanvasLike)
		const arrayBuffer = rgba.arrayBuffer()
		return arrayBuffer
	} else {
		ctx?.drawImage(img, 0, 0, inputWidth, inputHeight)
		const coverBase64Str = canvas.toDataURL('image/jpeg').replace(/^.+,/, '')
		const coverBuffer = Buffer.from(coverBase64Str, 'base64')
		return coverBuffer
	}
}
