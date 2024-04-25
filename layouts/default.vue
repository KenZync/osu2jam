<template>
	<div class="sticky top-0 z-20 border-b border-gray-700 backdrop-blur-md h-16">
		<UContainer class="flex items-center h-full justify-between">
			<div class="text-xl font-bold">
				<NuxtLink to="/">Osu2Jam</NuxtLink>
			</div>
			<!-- <ClientOnly>
				<div class="hidden md:block">
					<UHorizontalNavigation :links="links">
						<template #default="{ link }">
							<span class="group-hover:text-primary relative">{{ link.label }}</span>
						</template>
					</UHorizontalNavigation>
				</div>
				<UPopover v-if="user" mode="click">
					<div class="flex items-center h-full space-x-4">
						<div>
							{{ user.user_metadata.custom_claims.global_name }}
						</div>
						<div>
							<img class="rounded-full w-10" :src="user.user_metadata.avatar_url" />
						</div>
					</div>
					<template #panel>
						<div class="p-4">
							<UButton @click="signOut"> Logout </UButton>
						</div>
					</template>
				</UPopover>
				<div v-else>
					<UButton @click="signInWithDiscord" size="2xs">
						<UIcon name="fa6-brands:discord" dynamic class="text-3xl" />
						<div>Login with Discord</div>
					</UButton>
				</div>

				<template #fallback>
					<UButton loading variant="ghost" color="white" />
				</template>
			</ClientOnly> -->
		</UContainer>
	</div>
	<slot />
</template>

<script setup lang="ts">
// import type { Database } from '~/types/supabase'

// const user = useSupabaseUser()
// const client = useSupabaseClient<Database>()

// let links = [
// 	{
// 		label: 'Servers',
// 		icon: 'i-heroicons-server-stack',
// 		to: '/'
// 	}
// ]

// if (user.value) {
// 	links.push({
// 		label: 'Search',
// 		icon: 'i-heroicons-magnifying-glass',
// 		to: `/search`
// 	})
// }

// const signInWithDiscord = async () => {
// 	if (process.env.NODE_ENV === 'development') {
// 		await client.auth.signInWithOAuth({
// 			provider: 'discord'
// 		})
// 	} else {
// 		await client.auth.signInWithOAuth({
// 			provider: 'discord',
// 			options: {
// 				redirectTo: 'https://ojn-database.kenzync.dev/'
// 			}
// 		})
// 	}
// }

// const signOut = async () => {
// 	await client.auth.signOut()
// }
</script>
