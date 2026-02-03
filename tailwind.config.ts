export default {
  content: [
    './src/renderer/index.html',
    './src/renderer/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        active: 'rgb(156 163 175 / 0.10)', // gray-400/10
        subtle: 'rgb(156 163 175 / 0.03)', // gray-400/3
      },
    },
  },
}
