export function round(math: number) {
	return Math.round((math + Number.EPSILON) * 100) / 100
}

export function calKey(position: number) {
	var zoneSize = 512 / 7
	return Math.floor(position / zoneSize) + 2
}

// Function to return gcd of a and b
export function gcds(a: number, b: number) {
	if (a == 0) return b
	return gcds(b % a, a)
}

// Function to find gcd of array
// of numbers
export function findGCD(arr: number[]) {
	let result = arr[0]
	for (let i = 1; i < arr.length; i++) {
		result = gcds(arr[i], result)

		if (result == 1) {
			return 1
		}
	}
	return result
}

export function calculateSubmeasure(measure: number, maxSub: number) {
	return Math.round(measure * maxSub) % maxSub
}

export function calculateMeasureDigit(measure: number) {
	return Math.floor(round(measure))
}

export function calculateMeasure(timing: number, beatLength: number) {
	return timing / (beatLength * 4)
}

export function calculateBeatLength(bpm: number) {
	return parseFloat((60000 / bpm).toFixed(12))
}

export const gcd: (a: number, b: number) => number = (a, b) => (a ? gcd(b % a, a) : b)
export const lcm = (a: number, b: number): number => (a * b) / gcd(a, b)