import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  plugins: [vue()],
  base: isGitHubActions && repository ? `/${repository}/` : '/'
})
