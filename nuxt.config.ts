// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// ssr: false,
	devtools: { enabled: true },
	modules: ['@nuxt/ui', 'nuxt-security'],
	tailwindcss: {
		exposeConfig: true
	},
	colorMode: {
		preference: 'dark'
	},
	vite: {
		optimizeDeps: {
			exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
		},
		server: {
			headers: {
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Cross-Origin-Opener-Policy': 'same-origin'
			}
		}
	},
	security: {
		headers: {
			crossOriginEmbedderPolicy: 'require-corp',
			crossOriginOpenerPolicy: 'same-origin'
		}
	}
	// app: {
	// 	head: {
	// 		script: [{ src: '/coi-serviceworker.min.js' }]
	// 	}
	// }
	// render: {
	// 	static: {
	// 		setHeaders(res: any) {
	// 			res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
	// 			res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
	// 		}
	// 	}
	// }
})
