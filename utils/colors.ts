export const getColor = (level: number) => {
	if (level > 140) {
		return 'purple'
	} else if (level > 130) {
		return 'fuchsia'
	} else if (level > 120) {
		return 'pink'
	} else if (level > 110) {
		return 'rose'
	} else if (level > 100) {
		return 'red'
	} else if (level > 90) {
		return 'orange'
	} else if (level > 80) {
		return 'amber'
	} else if (level > 70) {
		return 'yellow'
	} else if (level > 60) {
		return 'blue'
	} else if (level > 50) {
		return 'cyan'
	} else if (level > 40) {
		return 'teal'
	} else if (level > 30) {
		return 'emerald'
	} else if (level > 20) {
		return 'green'
	} else if (level > 10) {
		return 'lime'
	} else {
		return 'gray'
	}
}
