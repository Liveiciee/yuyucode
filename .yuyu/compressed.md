This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where content has been compressed (code blocks are separated by ⋮---- delimiter).

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: android, dist, .yuyu, coverage, .gradle, build, public, __snapshots__, node_modules
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been compressed - code blocks are separated by ⋮---- delimiter
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
.github/
  icons/
    ic_launcher_background.xml
    ic_launcher_foreground.xml
  workflows/
    build-apk.yml
    codeql.yml
    quality.yml
.tla/
  AgentLoop.cfg
  AgentLoop.tla
patch/
  src/
    App.jsx
src/
  __snapshots__/
    utils.snapshot.test.js.snap
  assets/
    hero.png
    react.svg
    vite.svg
  components/
    AppChat.jsx
    AppHeader.jsx
    AppPanels.jsx
    AppSidebar.jsx
    FileEditor.jsx
    FileTree.jsx
    GlobalFindReplace.jsx
    KeyboardRow.jsx
    LivePreview.jsx
    MsgBubble.jsx
    panels.agent.jsx
    panels.base.jsx
    panels.git.jsx
    panels.jsx
    panels.tools.jsx
    SearchBar.jsx
    Terminal.jsx
    ThemeEffects.jsx
    VoiceBtn.jsx
  hooks/
    useAgentLoop.js
    useAgentSwarm.js
    useApprovalFlow.js
    useBrightness.js
    useChatStore.js
    useDevTools.js
    useFileStore.js
    useGrowth.js
    useMediaHandlers.js
    useNotifications.js
    useProjectStore.js
    useSlashCommands.js
    useUIStore.js
  plugins/
    brightness.js
  themes/
    aurora.js
    index.js
    ink.js
    mybrand.js
    neon.js
    obsidian.js
  api.extended.test.js
  api.js
  api.test.js
  App.jsx
  constants.js
  editor.bench.js
  editor.test.js
  features.extended.test.js
  features.extra.test.js
  features.js
  features.test.js
  globalfind.test.js
  livepreview.test.js
  main.jsx
  multitab.test.js
  setupTest.js
  theme.js
  themes.test.js
  uistore.test.js
  utils.extended.test.js
  utils.integration.test.js
  utils.js
  utils.snapshot.test.js
  utils.test.js
.deepsource.toml
.gitignore
bashrc-additions.sh
capacitor.config.json
eslint.config.js
index.html
LICENSE
llms.txt
NEXT_SESSION_PLAN.md
package.json
README.md
sonar-project.properties
vite.config.js
vitest.config.js
yugit.cjs
yuyu-bench.cjs
yuyu-map.cjs
yuyu-map.test.cjs
yuyu-server.js
yuyu-server.test.cjs
YUYU.md
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path=".github/icons/ic_launcher_background.xml">
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#1e0a3c"/>
</shape>
</file>

<file path=".github/icons/ic_launcher_foreground.xml">
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
  <path android:fillColor="#a78bfa" android:pathData="M54,18 L62,38 L54,34 L46,38 Z"/>
  <path android:fillColor="#8b5cf6" android:pathData="M54,18 L74,26 L70,34 L62,38 Z"/>
  <path android:fillColor="#8b5cf6" android:pathData="M54,18 L34,26 L38,34 L46,38 Z"/>
  <path android:fillColor="#7c3aed" android:pathData="M46,38 L54,34 L62,38 L58,52 L50,52 Z"/>
  <path android:fillColor="#6d28d9" android:pathData="M50,52 L58,52 L60,68 L54,72 L48,68 Z"/>
  <path android:fillColor="#4c1d95" android:pathData="M51,68 L57,68 L57,88 L51,88 Z"/>
  <path android:fillColor="#4c1d95" android:pathData="M38,78 L51,72 L51,80 L38,86 Z"/>
  <path android:fillColor="#4c1d95" android:pathData="M70,78 L57,72 L57,80 L70,86 Z"/>
</vector>
</file>

<file path="src/assets/react.svg">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
</file>

<file path="src/assets/vite.svg">
<svg xmlns="http://www.w3.org/2000/svg" width="77" height="47" fill="none" aria-labelledby="vite-logo-title" viewBox="0 0 77 47"><title id="vite-logo-title">Vite</title><style>.parenthesis{fill:#000}@media (prefers-color-scheme:dark){.parenthesis{fill:#fff}}</style><path fill="#9135ff" d="M40.151 45.71c-.663.844-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.493c-.92 0-1.457-1.04-.92-1.788l7.479-10.471c1.07-1.498 0-3.578-1.842-3.578H15.443c-.92 0-1.456-1.04-.92-1.788l9.696-13.576c.213-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.472c-1.07 1.497 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.087.89 1.83L40.153 45.712z"/><mask id="a" width="48" height="47" x="14" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha"><path fill="#000" d="M40.047 45.71c-.663.843-2.02.374-2.02-.699V34.708a2.26 2.26 0 0 0-2.262-2.262H24.389c-.92 0-1.457-1.04-.92-1.788l7.479-10.472c1.07-1.497 0-3.578-1.842-3.578H15.34c-.92 0-1.456-1.04-.92-1.788l9.696-13.575c.213-.297.556-.474.92-.474H53.93c.92 0 1.456 1.04.92 1.788L47.37 13.03c-1.07 1.498 0 3.578 1.842 3.578h11.376c.944 0 1.474 1.088.89 1.831L40.049 45.712z"/></mask><g mask="url(#a)"><g filter="url(#b)"><ellipse cx="5.508" cy="14.704" fill="#eee6ff" rx="5.508" ry="14.704" transform="rotate(269.814 20.96 11.29)scale(-1 1)"/></g><g filter="url(#c)"><ellipse cx="10.399" cy="29.851" fill="#eee6ff" rx="10.399" ry="29.851" transform="rotate(89.814 -16.902 -8.275)scale(1 -1)"/></g><g filter="url(#d)"><ellipse cx="5.508" cy="30.487" fill="#8900ff" rx="5.508" ry="30.487" transform="rotate(89.814 -19.197 -7.127)scale(1 -1)"/></g><g filter="url(#e)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.928 4.177)scale(1 -1)"/></g><g filter="url(#f)"><ellipse cx="5.508" cy="30.599" fill="#8900ff" rx="5.508" ry="30.599" transform="rotate(89.814 -25.738 5.52)scale(1 -1)"/></g><g filter="url(#g)"><ellipse cx="14.072" cy="22.078" fill="#eee6ff" rx="14.072" ry="22.078" transform="rotate(93.35 31.245 55.578)scale(-1 1)"/></g><g filter="url(#h)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#i)"><ellipse cx="3.47" cy="21.501" fill="#8900ff" rx="3.47" ry="21.501" transform="rotate(89.009 35.419 55.202)scale(-1 1)"/></g><g filter="url(#j)"><ellipse cx="14.592" cy="9.743" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(39.51 14.592 9.743)"/></g><g filter="url(#k)"><ellipse cx="61.728" cy="-5.321" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 61.728 -5.32)"/></g><g filter="url(#l)"><ellipse cx="55.618" cy="7.104" fill="#00c2ff" rx="5.971" ry="9.665" transform="rotate(37.892 55.618 7.104)"/></g><g filter="url(#m)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#n)"><ellipse cx="12.326" cy="39.103" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 12.326 39.103)"/></g><g filter="url(#o)"><ellipse cx="49.857" cy="30.678" fill="#8900ff" rx="4.407" ry="29.108" transform="rotate(37.892 49.857 30.678)"/></g><g filter="url(#p)"><ellipse cx="52.623" cy="33.171" fill="#00c2ff" rx="5.971" ry="15.297" transform="rotate(37.892 52.623 33.17)"/></g></g><path d="M6.919 0c-9.198 13.166-9.252 33.575 0 46.789h6.215c-9.25-13.214-9.196-33.623 0-46.789zm62.424 0h-6.215c9.198 13.166 9.252 33.575 0 46.789h6.215c9.25-13.214 9.196-33.623 0-46.789" class="parenthesis"/><defs><filter id="b" width="60.045" height="41.654" x="-5.564" y="16.92" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="c" width="90.34" height="51.437" x="-40.407" y="-6.762" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="d" width="79.355" height="29.4" x="-35.435" y="2.801" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="e" width="79.579" height="29.4" x="-30.84" y="20.8" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="f" width="79.579" height="29.4" x="-29.307" y="21.949" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="g" width="74.749" height="58.852" x="29.961" y="-17.13" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="7.659"/></filter><filter id="h" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="i" width="61.377" height="25.362" x="37.754" y="3.055" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="j" width="56.045" height="63.649" x="-13.43" y="-22.082" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="k" width="54.814" height="64.646" x="34.321" y="-37.644" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="l" width="33.541" height="35.313" x="38.847" y="-10.552" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="m" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="n" width="54.814" height="64.646" x="-15.081" y="6.78" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="o" width="54.814" height="64.646" x="22.45" y="-1.645" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter><filter id="p" width="39.409" height="43.623" x="32.919" y="11.36" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_2002_17286" stdDeviation="4.596"/></filter></defs></svg>
</file>

<file path="src/components/VoiceBtn.jsx">
export function VoiceBtn(
⋮----
async function toggle()
⋮----
// Show partial results
⋮----
// Web fallback
⋮----
r.onresult = e => {
      const transcript = e.results[0][0].transcript;
      if (e.results[0].isFinal) { onResult(transcript); setListening(false); setPartial(''); }
      else setPartial(transcript);
r.onerror = () =>
r.onend   = () =>
⋮----
export function PushToTalkBtn(
⋮----
async function onPressIn()
⋮----
async function onPressOut()
</file>

<file path="src/hooks/useAgentSwarm.js">
export function useAgentSwarm({
  callAI, folder,
  setSwarmRunning, setSwarmLog, setMessages,
  sendNotification, haptic, abortRef,
})
⋮----
async function runAgentSwarm(task)
⋮----
const log = msg
</file>

<file path="src/hooks/useMediaHandlers.js">
export function useMediaHandlers(
⋮----
function handleImageAttach(e)
⋮----
reader.onload = ev =>
⋮----
// ── Camera capture (Capacitor native) ────────────────────────────────────────
async function handleCameraCapture()
⋮----
// User cancelled or permission denied — silent fail
⋮----
// ── Gallery pick ──────────────────────────────────────────────────────────────
async function handleGalleryPick()
⋮----
} catch (_e) { /* cancelled */ }
⋮----
function handleDrop(e)
</file>

<file path="src/hooks/useNotifications.js">
export function useNotifications()
⋮----
function sendNotification(title, body)
⋮----
function haptic(type = 'light')
⋮----
function speakText(text)
⋮----
function stopTts()
</file>

<file path="src/themes/aurora.js">
// ── Aurora Glass ───────────────────────────────────────────────────────────────
// Efek: glassmorphism real, aurora bands bergerak, backdrop blur, refraction
// ─────────────────────────────────────────────────────────────────────────────
⋮----
aiBubble: () => (
userBubble: () => (
glowBorder: (color='#8b5cf6') => (
codeBlock: () => (
chipOk: () => (
glowText: () => ({}), // Aurora tidak pakai text glow
inputFocus: () => (
</file>

<file path="src/themes/index.js">
// ── Theme Registry ────────────────────────────────────────────────────────────
// Tambah theme baru di sini:
//   1. Buat file di src/themes/namabaru.js (copy dari template)
//   2. import namabaru from './namabaru.js'
//   3. Tambah ke THEMES_MAP
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// Key yang valid untuk disimpan ke Preferences
⋮----
// Default fallback
</file>

<file path="src/themes/ink.js">
// ── Ink & Paper ────────────────────────────────────────────────────────────────
// Efek: paper grain texture via SVG, brushstroke separators, aged paper feel
// Zero glow — semua matte, kontras tinggi seperti tinta di kertas
// ─────────────────────────────────────────────────────────────────────────────
⋮----
aiBubble: () => (
⋮----
// Ink: no bubble at all — bare text with left rule
⋮----
userBubble: () => (
glowBorder: () => ({}), // No glow in ink
codeBlock: () => (
chipOk: () => (
glowText: () => (
inputFocus: () => (
</file>

<file path="src/themes/neon.js">
// ── Neon Terminal ──────────────────────────────────────────────────────────────
// Efek: real neon glow, flicker animation, cyberpunk grid, scan pulse
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ── CSS injected globally ────────────────────────────────────────────────
⋮----
// ── Per-element effect functions ─────────────────────────────────────────
⋮----
// Extra box-shadow for accented borders
glowBorder: (color='#00ff8c', intensity=1) => (
// AI bubble extra glow
aiBubble: () => (
// User bubble glow
userBubble: () => (
// Neon text glow
glowText: (color='#00ff8c') => (
// Code block glow
codeBlock: () => (
// Action chip glow when ok
chipOk: () => (
// Input focus
inputFocus: () => (
</file>

<file path="src/themes/obsidian.js">
// ── Obsidian Warm ──────────────────────────────────────────────────────────────
// Efek: CRT scanlines rolling, amber phosphor glow, screen vignette, warm static
// ─────────────────────────────────────────────────────────────────────────────
⋮----
aiBubble: () => (
userBubble: () => (
glowBorder: (color='#d97706', intensity=1) => (
codeBlock: () => (
chipOk: () => (
glowText: (color='#d97706') => (
inputFocus: () => (
</file>

<file path="src/theme.js">
// ── YuyuCode Active Theme ────────────────────────────────────────────────────
// Ganti file ini untuk ganti tema — atau import dari themes/ yang udah ada:
//
//   import theme from './themes/aurora.js'
//   import theme from './themes/neon.js'
//   import theme from './themes/ink.js'
//   import theme from './themes/obsidian.js'
//   import theme from './themes/mybrand.js'   ← custom buatan sendiri
//
// Atau edit langsung di sini. Token yang tersedia ada di bawah.
// ─────────────────────────────────────────────────────────────────────────────
</file>

<file path="capacitor.config.json">
{
  "appId": "com.liveiciee.yuyucode",
  "appName": "YuyuCode",
  "webDir": "dist"
}
</file>

<file path="index.html">
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#0C0915" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>YuyuCode</title>
  <meta name="description" content="AI-powered code editor for mobile development" />
  <link rel="manifest" href="/manifest.json" />
  </head>
  <body style="margin:0;padding:0;overflow:hidden;background:#0C0915;">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
</file>

<file path=".tla/AgentLoop.cfg">
\* TLC Model Checker Configuration — AgentLoop
\* Run: java -jar tla2tools.jar -config AgentLoop.cfg AgentLoop.tla

SPECIFICATION Spec

\* Konstanta — nilai kecil untuk model checking (state space tetap finite)
CONSTANTS
  MAX_ITER = 3
  MAX_ACTIONS = 2

\* Invariants yang harus selalu true
INVARIANT
  IterBounded
  NoConflict
  ApprovalSubset

\* Temporal properties (liveness)
PROPERTY
  PendingEventuallyResolved
  AbortIrreversible
</file>

<file path=".tla/AgentLoop.tla">
--------------------------- MODULE AgentLoop ---------------------------
(* TLA+ Formal Specification — YuyuCode Agent Loop & Diff Review Flow
   
   Membuktikan bahwa:
   1. Agent loop TIDAK bisa deadlock (selalu ada transisi yang bisa diambil)
   2. Diff review mode TIDAK bisa "stuck" — pending action pasti selesai
      (approved ATAU rejected, tidak pernah infinite pending)
   3. Abort selalu berhasil terminate dari state manapun
   
   Run dengan TLC model checker:
     java -jar tla2tools.jar -config AgentLoop.cfg AgentLoop.tla
*)

EXTENDS Naturals, Sequences, FiniteSets, TLC

CONSTANTS
  MAX_ITER,    \* Batas iterasi agent loop (10 di kode)
  MAX_ACTIONS  \* Batas action per iterasi

ASSUME MAX_ITER \in Nat /\ MAX_ITER > 0
ASSUME MAX_ACTIONS \in Nat /\ MAX_ACTIONS > 0

(*--algorithm AgentLoop
variables
  \* ── State mesin ──────────────────────────────────────────────────────
  phase \in {"idle", "gathering_context", "thinking", "executing",
             "diff_review_pending", "compact", "done", "error", "aborted"},
  iter = 0,
  
  \* Pending actions (diff review mode)
  pending_writes = {},    \* set of action IDs menunggu approval
  approved_writes = {},   \* set of action IDs yang sudah diapprove
  rejected_writes = {},   \* set of action IDs yang ditolak
  
  \* Control
  aborted = FALSE,
  has_data = FALSE,       \* apakah iter ini menghasilkan data baru
  diff_review_mode = FALSE;

\* ── Definisi state valid ─────────────────────────────────────────────
define
  \* Invariant 1: iter tidak pernah melebihi MAX_ITER
  IterBounded == iter <= MAX_ITER
  
  \* Invariant 2: tidak ada action yang sekaligus approved DAN rejected  
  NoConflict == approved_writes \intersect rejected_writes = {}
  
  \* Invariant 3: approved + rejected ⊆ pending (tidak bisa approve yang tidak pending)
  ApprovalSubset == 
    (approved_writes \union rejected_writes) \subseteq pending_writes
  
  \* Liveness: kalau ada pending writes, pasti akan resolved (tidak stuck selamanya)
  \* Expressed sebagai: pending tidak pernah tumbuh tanpa batas tanpa resolution
  PendingEventuallyResolved ==
    [](pending_writes # {} => 
       <>(pending_writes \subseteq (approved_writes \union rejected_writes)))
  
  \* Safety: dari state aborted, tidak bisa kembali ke active state
  AbortIrreversible ==
    [](aborted => [](phase \in {"aborted", "done", "error"}))
  
  \* Deadlock freedom: selalu ada next step (kecuali terminal states)
  NotDeadlocked ==
    phase \notin {"done", "error", "aborted"} => ENABLED(Next)
end define;

\* ── Transisi state ───────────────────────────────────────────────────
macro abort() begin
  aborted := TRUE;
  phase := "aborted";
end macro;

\* User trigger send message
fair process loop = "agent_loop"
begin
  Start:
    if aborted then goto Done; end if;
    phase := "gathering_context";
  
  GatherCtx:
    if aborted then goto Done; end if;
    phase := "thinking";
    iter := 0;
  
  IterStart:
    if iter >= MAX_ITER \/ aborted then
      phase := "done"; goto Done;
    end if;
    iter := iter + 1;
    phase := "executing";
  
  Execute:
    if aborted then goto Done; end if;
    \* Nondeterministically: ada data baru atau tidak
    either has_data := TRUE; or has_data := FALSE; end either;
    
    \* Nondeterministically: diff review mode aktif atau tidak
    if diff_review_mode then
      \* Ada pending writes — pause loop, tunggu approval
      with n \in 1..MAX_ACTIONS do
        pending_writes := {i : i \in 1..n};
      end with;
      phase := "diff_review_pending";
      goto DiffReview;
    end if;
  
  CheckContinue:
    if ~has_data then
      \* Tidak ada data baru → loop selesai
      phase := "done"; goto Done;
    else
      \* Ada data → iterasi berikutnya
      goto IterStart;
    end if;
  
  DiffReview:
    \* Tunggu semua pending writes di-resolve (approved/rejected)
    await pending_writes \subseteq (approved_writes \union rejected_writes) \/ aborted;
    if aborted then goto Done; end if;
    \* Semua resolved — resume loop
    pending_writes := {};
    approved_writes := {};
    rejected_writes := {};
    goto CheckContinue;
  
  Done: skip;
end process;

\* User bisa approve/reject kapan saja saat diff_review_pending
fair process approval = "user_approval"
begin
  ApprovalLoop:
    while TRUE do
      if phase = "diff_review_pending" /\ pending_writes # {} then
        \* User memilih approve atau reject salah satu pending action
        with a \in pending_writes \ (approved_writes \union rejected_writes) do
          either
            approved_writes := approved_writes \union {a};
          or
            rejected_writes := rejected_writes \union {a};
          end either;
        end with;
      end if;
    end while;
end process;

\* User bisa abort kapan saja
fair process aborter = "user_abort"
begin
  AbortCheck:
    either
      skip;  \* tidak abort
    or
      abort();  \* abort
    end either;
end process;

end algorithm; *)

=============================================================================
THEOREM AgentLoop_Safety ==
  /\ []IterBounded
  /\ []NoConflict
  /\ []ApprovalSubset
  /\ AbortIrreversible
PROOF OMITTED \* Verified by TLC model checker

THEOREM AgentLoop_Liveness ==
  /\ PendingEventuallyResolved
PROOF OMITTED \* Verified by TLC model checker
=============================================================================
\* Modification history
\* 2026-03 — Initial spec. Models iter loop + diff review approval flow.
=============================================================================
</file>

<file path="patch/src/App.jsx">
export default function App()
⋮----
// ── STORES ──
⋮----
// ── Dynamic brightness filter — perceptual compensation ──────────────────
// Humans perceive brightness logarithmically (Weber-Fechner law).
// No filter above 25% brightness — normal usage range stays untouched.
// Below 25%: gentle linear boost max 1.4x + slight desaturation to
// counteract warm/orange shift (CSS brightness() boosts all RGB equally).
⋮----
const t      = 1 - (b / 0.25);           // 0 at 25%, 1 at 0%
const boost  = 1 + t * 0.40;             // 1.0x → 1.4x max
const desat  = 1 - t * 0.18;             // desaturate to prevent warm shift
⋮----
// ── REFS ──
⋮----
// ── HOOKS ──
⋮----
saveCheckpoint: ()
⋮----
// ── EFFECTS ──
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, [project.batteryLevel, project.batteryCharging]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
const on=()
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
useEffect(() => { chat.persistMessages(chat.messages); }, [chat.messages]); // eslint-disable-line react-hooks/exhaustive-deps
useEffect(() => { if(project.folder) project.loadFolderPrefs(project.folder); }, [project.folder]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
function connect()
⋮----
ws.onopen = () => ws.send(JSON.stringify(
ws.onmessage = async (e) =>
ws.onerror = () =>
ws.onclose = () =>
⋮----
}, [project.fileWatcherActive, project.folder]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ── HELPERS ──
function saveFolder(f)
function undoLastEdit()
function saveCheckpoint()
function restoreCheckpoint(cp)
function onSidebarDragStart(e)
⋮----
function onMove(ev)
function onEnd()
⋮----
// ── RENDER ──
⋮----
{/* Brightness screen overlay — mix-blend-mode:screen, no banding */}
⋮----
{/* Badge toast */}
</file>

<file path="src/components/AppHeader.jsx">
// ── AppHeader ─────────────────────────────────────────────────────────────────
// Session color bar, header (title/effort/tokens/xp/palette), folder input,
// UndoBar, dan status bar (offline/ratelimit/agent running).
⋮----
export function AppHeader(
⋮----
{/* Session color strip */}
⋮----
{/* HEADER — 48px */}
⋮----
{/* Folder input */}
⋮----
{/* Status bar — priority-based */}
</file>

<file path="src/components/AppSidebar.jsx">
// ── AppSidebar ────────────────────────────────────────────────────────────────
// Overlay sidebar: backdrop, file tree, recent files, resize handle.
⋮----
export function AppSidebar(
</file>

<file path="src/components/GlobalFindReplace.jsx">
// ── GlobalFindReplace — search & replace across all project files ─────────────
⋮----
export function GlobalFindReplace(
⋮----
const [results,     setResults]     = useState([]); // [{file, matches:[{line,col,text}]}]
⋮----
// ── Search ──────────────────────────────────────────────────────────────────
⋮----
// Build grep command
⋮----
// Parse grep output: "path/to/file:linenum:col: text"
⋮----
// Make path relative
⋮----
// Auto-expand if few files
⋮----
// ── Replace all ─────────────────────────────────────────────────────────────
⋮----
// Read file
⋮----
doSearch(); // re-run search to show updated results
⋮----
{/* Header */}
⋮----
{/* Search bar */}
⋮----
{/* Replace row */}
⋮----
{/* Results */}
⋮----
{/* Replace log */}
⋮----
{/* Summary */}
⋮----
{/* File header */}
⋮----
{/* Match lines */}
</file>

<file path="src/components/KeyboardRow.jsx">
// ── KeyboardRow — extra symbol row above Android soft keyboard ─────────────────
// Inserts symbols at cursor: either into a textarea or a CodeMirror view.
// Shows whenever a file is in edit mode on mobile.
⋮----
{ label: '→',  text: '  ' },  // indent (2 spaces)
⋮----
export function KeyboardRow(
</file>

<file path="src/components/LivePreview.jsx">
// ── LivePreview — live HTML/CSS/JS iframe preview ─────────────────────────────
// Combines open HTML/CSS/JS files into a single srcdoc iframe.
// Intercepts console.log via postMessage for in-app display.
⋮----
function buildSrcdoc(tabs)
⋮----
// Inject CSS and JS into HTML
⋮----
// No HTML tab — synthesize one from CSS + JS
⋮----
export function LivePreview(
⋮----
// Debounced rebuild on tab content change
⋮----
// Manual refresh
⋮----
// Console message listener
⋮----
function onMsg(e)
⋮----
const logColor = (level) =>
⋮----
{/* Toolbar */}
⋮----
{/* Console panel */}
⋮----
{/* iframe */}
</file>

<file path="src/components/panels.agent.jsx">
export function ElicitationPanel(
⋮----
function set(name, val)
⋮----
function handleSubmit()
⋮----
{/* Header */}
⋮----
{/* Fields */}
⋮----
{/* Actions */}
⋮----
// ─── MERGE CONFLICT PANEL ─────────────────────────────────────────────────────
⋮----
export function SkillsPanel(
⋮----
async function handleUpload(e)
⋮----
async function handleAdd()
⋮----
{/* Header */}
⋮----
{/* Inline add form */}
⋮----
{/* Skill list */}
⋮----
{/* Delete — hanya non-builtin */}
⋮----
{/* Toggle */}
⋮----
{/* Footer hint */}
⋮----
// ── DeployPanel ───────────────────────────────────────────────────────────────
⋮----
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
function ElapsedTime(
⋮----
export function BgAgentPanel(
⋮----
{/* Header row */}
⋮----
{/* Progress bar for running */}
⋮----
{/* Log — last 4 entries */}
⋮----
{/* Actions */}
</file>

<file path="src/components/panels.git.jsx">
export function GitComparePanel(
⋮----
const [view, setView]       = useState('unified'); // 'unified' | 'split'
⋮----
async function load(s)
⋮----
// Compute stats
⋮----
useEffect(() => { load(false); }, []); // eslint-disable-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
⋮----
function lineStyle(line)
⋮----
function renderUnified()
⋮----
function renderSplit()
⋮----
// Parse hunk into left (old) and right (new) columns
⋮----
// Try to pair with next + line
⋮----
{/* Left (old) */}
⋮----
{/* Right (new) */}
⋮----
const tabBtn = (label, active, onClick) => (
    <button onClick={onClick} style={{background:active?'rgba(255,255,255,.1)':'none',border:'1px solid '+(active?borderMed:border),borderRadius:'5px',padding:'3px 9px',color:active?text:textMute,fontSize:'11px',cursor:'pointer'}}>{label}</button>
  );
⋮----
{/* Header */}
⋮----
{/* Stats */}
⋮----
{/* Diff content */}
⋮----
// ─── FILE HISTORY PANEL ───────────────────────────────────────────────────────
⋮----
export function FileHistoryPanel(
⋮----
async function preview(hash)
⋮----
async function restore(hash)
⋮----
// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────
⋮----
export function GitBlamePanel(
⋮----
// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
⋮----
export function DepGraphPanel(
⋮----
// Support both new {nodes, edges} format and legacy {file, imports} format
⋮----
// Legacy fallback
⋮----
// Arrow marker
⋮----
}, [depGraph]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ─── ELICITATION PANEL (AI-requested dynamic form) ───────────────────────────
⋮----
export function MergeConflictPanel(
⋮----
async function loadPreview(cf)
⋮----
async function resolve(strategy)
⋮----
async function abortMerge()
⋮----
{/* Header */}
⋮----
{/* Conflict files */}
⋮----
{/* Status */}
⋮----
{/* Actions */}
⋮----
// ── SkillsPanel ───────────────────────────────────────────────────────────────
</file>

<file path="src/components/SearchBar.jsx">
export function SearchBar(
⋮----
async function doSearch()
⋮----
export function UndoBar(
</file>

<file path="src/components/ThemeEffects.jsx">
// ── ThemeEffects ───────────────────────────────────────────────────────────────
// Render semua visual overlay berdasarkan tema aktif:
//   - Atmosphere orbs (semua tema)
//   - Scanlines layer (obsidian, neon)
//   - CRT scan bar (obsidian)
//   - Aurora animated orbs (aurora)
//   - Neon grid + scan pulse (neon)
//   - Paper grain SVG (ink)
//   - Vignette corner (obsidian)
// ─────────────────────────────────────────────────────────────────────────────
⋮----
export function ThemeEffects(
⋮----
// Inject theme CSS once per theme change
⋮----
{/* ── Atmosphere Orbs (semua tema) ──────────────────────────────────── */}
⋮----
{/* ── Scanlines (obsidian, neon) ─────────────────────────────────────── */}
⋮----
{/* ── CRT rolling scan bar (obsidian) ──────────────────────────────── */}
⋮----
{/* Corner vignette */}
⋮----
{/* ── Neon grid + scan pulse (neon) ─────────────────────────────────── */}
⋮----
{/* Subtle perspective grid */}
⋮----
{/* Horizontal scan pulse */}
⋮----
{/* Corner vignette dark */}
⋮----
{/* ── Aurora shimmer overlay (aurora) ───────────────────────────────── */}
⋮----
{/* Diagonal aurora band */}
⋮----
{/* Corner vignette subtle */}
⋮----
{/* ── Paper grain texture (ink) ─────────────────────────────────────── */}
⋮----
{/* SVG turbulence grain */}
⋮----
{/* Subtle paper discoloration */}
</file>

<file path="src/hooks/useApprovalFlow.js">
export function useApprovalFlow({
  messages, setMessages,
  folder, hooks, permissions,
  _editHistory, setEditHistory,
  sendMsgRef, callAI, abortRef,
  setLoading,
})
⋮----
async function handleApprove(idx, ok, targetPath)
⋮----
const isWrite = a
⋮----
// Mark rejected
⋮----
// Feedback ke AI — resume loop dengan info rejection
⋮----
// Backup sebelum tulis
⋮----
// Atomic rollback jika ada yang gagal
⋮----
// Auto-resume agent loop jika semua pending writes di message ini sudah selesai
⋮----
// Syntax verify (jika exec permission aktif)
⋮----
async function handlePlanApprove(idx, approved)
</file>

<file path="src/hooks/useDevTools.js">
export function useDevTools({
  folder, githubRepo, githubToken, setGithubData,
  setMessages, setLoading, setStreaming, setDeployLog,
  callAI, sendMsgRef,
  sendNotification, haptic, abortRef,
  addHistory,
})
⋮----
async function fetchGitHub(action)
⋮----
async function runDeploy(platform)
⋮----
async function generateCommitMsg()
⋮----
async function runTests()
⋮----
async function browseTo(url)
⋮----
async function runShortcut(cmd)
</file>

<file path="src/hooks/useFileStore.js">
export function useFileStore()
⋮----
// ── Multi-tab state ──
const [openTabs, setOpenTabs]       = useState([]);   // [{path, content, dirty}]
⋮----
// ── Legacy single-view state (still used for some flows) ──
const [activeTab, setActiveTab]     = useState('chat'); // 'chat' | 'file'
⋮----
// ── Derived compat ──
⋮----
// ── Lists ──
⋮----
// Ref to always read the latest openTabs in async contexts
⋮----
// ── Persisted setters ──
function setRecentFiles(next)
function setPinnedFiles(next)
⋮----
// ── Load from Preferences ──
function loadFilePrefs(
⋮----
// ── setActiveTabIdx (also switches to file tab) ──
function setActiveTabIdx(idx)
⋮----
// ── openFile — opens in existing tab or new tab ──
async function openFile(path)
⋮----
// Check if already open
⋮----
// Load content
⋮----
// Recent files
⋮----
// ── closeTab ──
function closeTab(idx)
⋮----
// ── updateTabContent — marks a tab dirty (from editor changes) ──
function updateTabContent(idx, content)
⋮----
// ── saveFile — saves current active tab to server ──
async function saveFile(content, onMsg)
⋮----
// ── Backward compat setters ──
function setSelectedFile(path)
⋮----
function setFileContent(content)
⋮----
// ── togglePin ──
function togglePin(path)
⋮----
// ── undoLastEdit ──
async function undoLastEdit(onMsg)
⋮----
// ── readFilesParallel ──
async function readFilesParallel(paths, folder)
⋮----
// ── handleApprove (write file batch with backup + rollback) ──
async function handleApprove(idx, ok, targetPath, messages, setMessages, folder, hooks, runHooksV2, permissions)
⋮----
// Syntax verify
⋮----
// Multi-tab
⋮----
// Backward compat derived
⋮----
// Legacy view state
⋮----
// Lists
⋮----
// Actions
</file>

<file path="src/hooks/useGrowth.js">
// ── useGrowth — Yuyu yang tumbuh + Gamifikasi ─────────────────────────────────
// Yuyu belajar dari setiap sesi: naming style, bahasa dominan, error patterns
// Gamifikasi: streak harian, XP, badge — motivasi solo dev tanpa tim
⋮----
// ── XP table ──
⋮----

⋮----
export function useGrowth()
⋮----
const [newBadge, setNewBadge]       = useState(null); // untuk toast notif
⋮----
// ── Load on mount ──
⋮----
// Update streak on open
⋮----
function setXp(val)
function setBadges(val)
function setLearnedStyle(val)
⋮----
// ── addXP — tambah XP + cek badge baru ──
function addXP(event)
⋮----
// Cek badge baru
⋮----
setNewBadge(earned[earned.length - 1]); // toast badge terakhir
⋮----
// ── learnFromSession — analisis pola coding, update learnedStyle ──
async function learnFromSession(messages, folder)
⋮----
// Minimal 5 pesan dan ada aktivitas file
⋮----
// Ambil sample pesan user
⋮----
// Ambil sample kode yang ditulis AI
⋮----
// Merge dengan style lama — pertahankan yang lama, update/tambah yang baru
⋮----
// ── summary untuk display ──
</file>

<file path="src/plugins/brightness.js">
// ── Brightness Plugin Bridge ───────────────────────────────────────────────
// Wraps native BrightnessPlugin via Capacitor — real-time ContentObserver
⋮----
// Web fallback — tidak ada brightness API di browser
⋮----
getBrightness: async () => (
addListener: () => (
removeAllListeners: async () =>
</file>

<file path="src/themes/mybrand.js">
// ── My Brand Theme — Template untuk Custom Theme ────────────────────────────
// TEMPLATE: Ini bukan tema aktif. Copy, rename, isi token, import di index.js.
// Lihat src/themes/obsidian.js untuk referensi skema lengkap.
// ─────────────────────────────────────────────────────────────────────────────
⋮----
/** @type {import('./index').YuyuTheme} */
⋮----
// ── Global colours ────────────────────────────────────────────────────────
⋮----
// ── Atmosphere (glow blobs di bg) ─────────────────────────────────────────
⋮----
// ── Header ────────────────────────────────────────────────────────────────
⋮----
// ── Chat Bubbles ──────────────────────────────────────────────────────────
⋮----
// ── Action Chips ──────────────────────────────────────────────────────────
⋮----
// ── Code Blocks ───────────────────────────────────────────────────────────
⋮----
// ── Loading dots ──────────────────────────────────────────────────────────
⋮----
// ── Input Area ────────────────────────────────────────────────────────────
⋮----
// ── Slash Command Popup ───────────────────────────────────────────────────
⋮----
// ── Per-theme CSS & Animations ────────────────────────────────────────────
⋮----
// ── Visual FX helpers (dipakai oleh MsgBubble) ───────────────────────────
⋮----
aiBubble:   () => (
userBubble: () => (
glowBorder: (color='#d97706', intensity=1) => (
codeBlock:  () => (
chipOk:     () => (
glowText:   (color='#d97706') => (
inputFocus: () => (
</file>

<file path="src/api.js">
// ── SHARED SSE STREAM READER ───────────────────────────────────────────────────
export async function readSSEStream(resp, onChunk, signal)
⋮----
// flush
⋮----
// ── INJECT VISION IMAGE ────────────────────────────────────────────────────────
function injectVision(messages, imageBase64)
⋮----
// ── CEREBRAS STREAMING ─────────────────────────────────────────────────────────
async function _cerebrasOnce(messages, model, onChunk, signal, options)
⋮----
// ── GROQ STREAMING ─────────────────────────────────────────────────────────────
async function _groqOnce(messages, model, onChunk, signal, options)
⋮----
// ── UNIFIED AI CALL — auto-fallback Cerebras → Groq ───────────────────────────
// - Cerebras model → tries Cerebras, jika rate limit → fallback ke Groq (kimi-k2)
// - Groq model → langsung ke Groq
export async function askCerebrasStream(messages, model, onChunk, signal, options =
⋮----
// ── Groq model: langsung ke Groq ──
⋮----
// ── Cerebras model: try Cerebras, fallback Groq on rate limit ──
⋮----
// Rate limit → auto-switch ke Groq
⋮----
// Groq juga rate limit? lempar error asli biar timer tetap jalan
⋮----
// Server error → retry
⋮----
// ── CALL SERVER (HTTP) ─────────────────────────────────────────────────────────
export async function callServer(payload)
⋮----
// ── EXEC STREAM via WebSocket ──────────────────────────────────────────────────
export function execStream(command, cwd, onLine, signal)
⋮----
const cleanup = () =>
const done = (exitCode) =>
⋮----
ws.onopen = () => ws.send(JSON.stringify(
ws.onmessage = (e) =>
ws.onerror = () =>
ws.onclose = () =>
⋮----
// ── CALL SERVER BATCH ──────────────────────────────────────────────────────────
export async function callServerBatch(payloads)
</file>

<file path="src/main.jsx">
class ErrorBoundary extends React.Component
⋮----
static getDerivedStateFromError(e)
render()
</file>

<file path="src/multitab.test.js">
// ── Mock dependencies ─────────────────────────────────────────────────────────
⋮----
// ── Multi-tab core ────────────────────────────────────────────────────────────
⋮----
// ── Pinned files ──────────────────────────────────────────────────────────────
⋮----
// ── Undo ──────────────────────────────────────────────────────────────────────
</file>

<file path="src/uistore.test.js">
expect(result.current.multiCursor).toBe(true); // default ON
</file>

<file path=".deepsource.toml">
version = 1

[[analyzers]]
name = "javascript"
enabled = true

  [analyzers.meta]
  environment = ["browser", "es2022"]
  plugins = ["react"]

[[analyzers]]
name = "secrets"
enabled = true
# Scan for accidentally committed API keys/tokens.
# CEREBRAS_KEY, GROQ_KEY, GITHUB_TOKEN jangan pernah hardcoded.

[[transformers]]
name = "prettier"
enabled = true

[test_coverage]
reporter = "javascript"
threshold = 60

# ── Suppress false positives ────────────────────────────────────────────────
# JS-C1002: short variable names — T, m, r, e, a, i semua intentional
# (T = theme object, m = messages callback, r = result, i = index)
[[issues]]
issue_code = "JS-C1002"
issue_type = "anti-pattern"
[[issues.suppressed_in]]
file_paths = ["src/**"]

# JS-R1005: cyclomatic complexity — sendMsg & handleSlashCommand
# complex by design (agent loop + 60+ slash commands), refactor hurt readability
[[issues]]
issue_code = "JS-R1005"
issue_type = "anti-pattern"
[[issues.suppressed_in]]
file_paths = [
  "src/hooks/useAgentLoop.js",
  "src/hooks/useSlashCommands.js",
  "src/hooks/useApprovalFlow.js",
  "src/components/FileEditor.jsx",
]

# JS-0067: global scope — bgAgents Map, tokenTracker singleton intentional
[[issues]]
issue_code = "JS-0067"
issue_type = "anti-pattern"
[[issues.suppressed_in]]
file_paths = ["src/features.js", "yuyu-server.js"]
</file>

<file path="eslint.config.js">
// Node.js files (server + git helper)
⋮----
// Source files
⋮----
// Test files — LAST so it overrides source rules for *.test.js inside src/
</file>

<file path="LICENSE">
MIT License

Copyright (c) 2025 YuyuCode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</file>

<file path="sonar-project.properties">
sonar.projectKey=liveiciee_yuyucode
sonar.organization=liveiciee

# Source
sonar.sources=src
sonar.exclusions=src/**/*.test.js,src/**/*.spec.js,src/__snapshots__/**,node_modules/**,android/**,dist/**

# Test files
sonar.tests=src
sonar.test.inclusions=src/**/*.test.js,src/**/*.spec.js

# Coverage — generated by vitest --coverage di quality.yml
sonar.javascript.lcov.reportPaths=coverage/lcov.info

# Language
sonar.sourceEncoding=UTF-8

# Quality Gate thresholds (customize di SonarCloud dashboard):
# Coverage: >= 60%
# Duplicated lines: <= 3%
# Maintainability rating: A
# Reliability rating: A
# Security rating: A
</file>

<file path="yuyu-server.test.cjs">
// @vitest-environment node
// yuyu-server.test.cjs — Test suite untuk yuyu-server.js
// Approach: test handle() function langsung (unit) + HTTP integration via http.request
⋮----
// ── Import handle() via require (CJS) ─────────────────────────────────────────
// yuyu-server.js tidak export handle(), jadi kita test via HTTP
// Tapi beberapa pure functions bisa di-test langsung
// Strategy: spawn server di random port, test via HTTP requests
⋮----
// ── HTTP helper ───────────────────────────────────────────────────────────────
function request(port, payload)
⋮----
function get(port, path = '/')
⋮----
// ── Start server on random port ───────────────────────────────────────────────
⋮----
// Temporarily override PORT constant by patching env
⋮----
// Start server manually since it auto-starts on require
// Use http.createServer with same handle logic via child process approach
// Simpler: just start the actual server on a free port
⋮----
// ── Inline handle() for testing — mirrors yuyu-server.js logic ───────────────
⋮----
function execSafeTest(command, cwd, timeoutMs = 5000)
⋮----
function applyPatchTest(filePath, oldStr, newStr)
⋮----
function handleForTest(payload)
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════
</file>

<file path="YUYU.md">
# YUYU.md — Project Rules
> YuyuCode project-specific constraints. Dibaca Yuyu di setiap sesi.

## Coding Standards
- Gunakan React hooks, bukan class components
- State management: useState + props passing (tidak ada Redux/Zustand)
- File naming: camelCase untuk hooks (useXxx.js), PascalCase untuk components (.jsx)
- Tidak ada TypeScript — project ini pure JavaScript + JSX
- Komentar penting pakai `// ──` style (lihat codebase existing)

## Architecture Decisions
- Agent loop ada di `useAgentLoop.js` — jangan pecah ke file lain
- Semua slash commands di `useSlashCommands.js` — satu file, pakai else-if chain
- Theme system: token-based, zero hardcoded colors di component JSX
- Server communication: selalu lewat `callServer()` di `api.js`
- No npm build lokal — Vite build hanya di CI (ARM64 constraint)

## Forbidden Patterns
- JANGAN `npm run build` lokal — crash di Termux ARM64
- JANGAN upgrade vitest ke v4+ — crash silent di ARM64
- JANGAN hapus `"overrides": { "rollup": "npm:@rollup/wasm-node" }` di package.json
- JANGAN override `global.TextDecoder` di test files — infinite recursion Node 24
- JANGAN edit folder `android/` manual — di-generate Capacitor

## Preferred Libraries
- Code editor: CodeMirror 6
- Terminal: xterm.js
- File search: Fuse.js
- Diff: `diff` library (Myers algorithm)
- Testing: vitest@1 (bukan v4)

## Commands
- Dev: `npm run dev` (port 5173)
- Test: `npx vitest run` (harus 546/546 pass sebelum commit)
- Lint: `npm run lint` (harus 0 problems)
- Bench: `npm run bench`
- Deploy: `node yugit.cjs "feat: ..."`
- Release: `node yugit.cjs "release: vX.Y — deskripsi"`
</file>

<file path=".github/workflows/codeql.yml">
name: CodeQL · SAST

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 3 * * 1'  # Senin 03:00 UTC — weekly deep scan

jobs:
  analyze:
    name: CodeQL · JavaScript
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read

    steps:
      - uses: actions/checkout@v5

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v4
        with:
          languages: javascript
          # Queries:
          # security-extended  — lebih banyak security rules dari default
          # security-and-quality — security + code quality (duplicate, dead code)
          queries: security-extended, security-and-quality

      - name: Autobuild
        uses: github/codeql-action/autobuild@v4

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v4
        with:
          category: codeql-javascript
          # Hasil muncul di: GitHub → Security → Code scanning alerts
</file>

<file path="src/components/FileTree.jsx">
function getFileIconData(name)
⋮----
function FileIcon(
⋮----
export function FileTree(
⋮----
// ── Theme tokens ──
⋮----
useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect
⋮----
async function toggleDir(fullPath)
⋮----
async function doRename(oldPath)
⋮----
async function doCreate(parentPath)
⋮----
async function doDelete(path)
⋮----
// Flatten tree into searchable list
function flattenTree(items, basePath, acc = [])
const allFiles = useMemo(() => tree ? flattenTree(tree, folder) : [], [tree, expanded, folder]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
const inputStyle = (borderColor) => (
⋮----
function renderItems(items, basePath, depth)
⋮----
const iconBtn = (onClick, title, children) => (
    <button onClick={onClick} title={title}
      style={{background:'none',border:'none',color:textMute,cursor:'pointer',padding:'4px 6px',borderRadius:'5px',display:'flex',alignItems:'center'}}
      onMouseEnter={e=>e.currentTarget.style.background=bg3}
      onMouseLeave={e=>e.currentTarget.style.background='none'}>
      {children}
    </button>
  );
⋮----
const ctxItem = (onClick, color, children) => (
    <div onClick={onClick}
      style={{padding:'7px 12px',fontSize:'12.5px',color:color||textSec,cursor:'pointer',borderRadius:'6px',display:'flex',alignItems:'center',gap:'8px'}}
      onMouseEnter={e=>e.currentTarget.style.background=color===error?errorBg:bg3}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      {children}
    </div>
  );
⋮----
{/* Fuzzy search */}
</file>

<file path="src/components/panels.base.jsx">
export function BottomSheet(
⋮----
function onTouchStart(e)
function onTouchMove(e)
function onTouchEnd()
⋮----
{/* drag handle zone */}
⋮----
export function CommandPalette({ onClose, onRun:_onRun, folder:_folder, memories, checkpoints, model, models, T,
  onModelChange, onNewChat, theme, onThemeChange, showSidebar, onToggleSidebar,
  onShowMemory, onShowCheckpoints, onShowMCP, onShowGitHub, onShowDeploy,
  onShowDiff, onShowSearch, onShowSnippets, onShowCustomActions,
  onShowSessions, onShowPermissions, onShowPlugins, onShowConfig,
  onShowSkills,
runTests, generateCommitMsg, exportChat, compactContext })
⋮----

⋮----
action:()=>
⋮----
// ─── DEP GRAPH PANEL (d3 force layout) ───────────────────────────────────────
</file>

<file path="src/hooks/useBrightness.js">
// ── useBrightness — real-time adaptive brightness ────────────────────────
// ContentObserver native → emit setiap slider berubah → scale filter dinamis
// Tidak ada polling. Tidak ada threshold on/off. Murni proporsional.
⋮----
export function useBrightness(setBrightnessLevel)
</file>

<file path="src/hooks/useChatStore.js">
export function useChatStore()
⋮----
// ── Core chat ──
⋮----
const [gracefulStop, setGracefulStop]   = useState(false); // finish iter then stop
const [agentStatus, setAgentStatus]   = useState(''); // e.g. 'Iter 2/10 · exec'
⋮----
// ── Rate limit ──
⋮----
// ── Memories / Checkpoints ──
⋮----
// ── Agent / Plan ──
⋮----
// ── Input extras ──
⋮----
// ── Persisted setters ──
function setMemories(next)
function setCheckpoints(next)
⋮----
// ── Load from Preferences ──
function loadChatPrefs(
⋮----
// ── Persist messages on change (called from useEffect in App) ──
function persistMessages(msgs)
⋮----
// ── trimHistory ──
function trimHistory(msgs)
⋮----
// ── Auto memory extraction ──
async function extractMemories(userMsg, aiReply, folder)
⋮----
// Skip kalau reply terlalu pendek atau tidak technical
⋮----
// ── getRelevantMemories (TF-IDF scoring) ──
function getRelevantMemories(txt)
⋮----
// Fallback to most recent if no scores > 0
⋮----
// ── saveCheckpoint — chat + file snapshot via git stash snapshot ──
async function saveCheckpoint(folder, branch, notes, callServerFn)
⋮----
// Snapshot file state: capture git diff as patch
⋮----
filePatch,                       // git diff snapshot
⋮----
// ── restoreCheckpoint — chat + optional file restore ──
async function restoreCheckpoint(cp, setFolder, setFolderInput, setNotesRaw, callServerFn)
⋮----
// Offer to restore file state via reverse patch
⋮----
// ── exportChat ──
function exportChat()
⋮----
// ── clearChat ──
function clearChat()
⋮----
// ── startRateLimitTimer ──
function startRateLimitTimer(secs)
⋮----
deleteMessage: (idx)
editMessage:   (idx, newContent) => setMessages(m => m.map((msg, i) => i === idx ?
searchMessages: (q) =>
⋮----
// functions
</file>

<file path="src/api.extended.test.js">
// @vitest-environment node
⋮----
// ── Mock constants so import.meta.env doesn't blow up ────────────────────────
⋮----
// ── Helpers ──────────────────────────────────────────────────────────────────
function mockJsonResponse(data, status = 200)
⋮----
json: ()
text: ()
headers:
⋮----
function makeSseResponse(...chunks)
⋮----
getReader: () => (
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// callServer
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// callServerBatch
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// askCerebrasStream
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// Cerebras → 429, Groq → success
⋮----
.mockResolvedValueOnce(
⋮----
// Override setTimeout to not actually wait
</file>

<file path="src/api.test.js">
// @vitest-environment node
⋮----
// Simpan referensi ASLI sebelum override apapun
⋮----
function makeReader(...chunks)
⋮----
function makeResponse(reader)
⋮----
return
</file>

<file path="src/editor.bench.js">
// @vitest-environment node
⋮----
// ── Inline pure functions (copied from FileEditor — cannot import component) ──
function getLangExt(path)
⋮----
function isEmmetLang(path)
⋮----
function isTsLang(path)
⋮----
function buildSrcdoc(tabs)
⋮----
// ── Fixtures ──────────────────────────────────────────────────────────────────
⋮----
// Realistic component — what yuyu-map actually processes
⋮----
// Fixtures for computeSalience
⋮----
// ── getLang benchmark ─────────────────────────────────────────────────────────
⋮----
// ── isEmmetLang benchmark ─────────────────────────────────────────────────────
⋮----
// ── isTsLang benchmark ───────────────────────────────────────────────────────
⋮----
// ── buildSrcdoc benchmark ─────────────────────────────────────────────────────
⋮----
// ── generateDiff benchmark ────────────────────────────────────────────────────
⋮----
// ── Multi-tab state operations (pure JS, no hook) ─────────────────────────────
⋮----
// ── extractSymbols benchmark (NEW) ───────────────────────────────────────────
⋮----
// ── compressSource benchmark (NEW) ────────────────────────────────────────────
⋮----
// ── extractImports benchmark (NEW) ────────────────────────────────────────────
⋮----
// ── computeSalience benchmark (NEW) ───────────────────────────────────────────
⋮----
// Pure scoring pass — no disk I/O, uses pre-built fixtures
⋮----
// ── parseActions hot path benchmark (NEW) ─────────────────────────────────────
</file>

<file path="src/editor.test.js">
// @vitest-environment node
⋮----
// ── Mock CodeMirror — tidak bisa jalan di jsdom tanpa DOM penuh ───────────────
⋮----
vi.mock('lucide-react', () => (
⋮----
// ── Inline pure functions (copied dari FileEditor — tidak bisa import karena mock) ──
function getLangExt(path)
⋮----
function isEmmetLang(path)
⋮----
function isTsLang(path)
⋮----
// ── getLang ───────────────────────────────────────────────────────────────────
⋮----
// ── isEmmetLang ───────────────────────────────────────────────────────────────
⋮----
// ── isTsLang ──────────────────────────────────────────────────────────────────
</file>

<file path="src/features.extended.test.js">
// @vitest-environment node
⋮----
// ── Mock dependencies ─────────────────────────────────────────────────────────
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// TokenTracker
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// runHooksV2
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// mergeBackgroundAgent
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// getBgAgents() reads from the internal Map; we can't easily set it
// but we can verify the function handles missing IDs correctly
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// selectSkills — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// rewindMessages — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// tfidfRank — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// parsePlanSteps — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// checkPermission — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// parseElicitation — edge cases
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// The function looks for the first { after ELICIT:
// space before { is fine
⋮----
// Either null (if whitespace before { matters) or parsed correctly
// just verify no throw
</file>

<file path="src/features.js">
// ── FEATURES v3 — Overhaul ─────────────────────────────────────────────────────
⋮----
// ─── PLAN MODE ────────────────────────────────────────────────────────────────
export function parsePlanSteps(reply)
⋮----
export async function generatePlan(task, folder, callAI, signal)
⋮----
export async function executePlanStep(step, folder, callAI, signal, onChunk)
⋮----
// ─── BACKGROUND AGENTS WITH GIT WORKTREE ISOLATION ───────────────────────────
⋮----
export function getBgAgents()
⋮----
async function execGit(folder, cmd)
⋮----
// Background agent dengan REAL agentic loop (tidak hanya satu call)
export async function runBackgroundAgent(task, folder, callAI, onDone)
⋮----
agent.abort = () =>
⋮----
// Async agent loop in background
⋮----
// 1. Setup worktree
⋮----
// 2. Real agentic loop (up to 8 iterations)
⋮----
// Auto-execute patches in bg agent
⋮----
// Write new files
⋮----
// Break if done
⋮----
// Feed results back
⋮----
// 3. Commit semua perubahan
⋮----
export async function mergeBackgroundAgent(id, folder)
⋮----
export function abortBgAgent(id)
⋮----
// ─── SKILLS SYSTEM ────────────────────────────────────────────────────────────
// ── loadSkills: .yuyu/skills/*.md only ─────────────────────────────────────
export async function loadSkills(folder, activeMap =
⋮----
// .yuyu/skills/*.md
⋮----
active: activeMap[f.name] !== false,   // default on
⋮----
// ── Upload / save skill to .yuyu/skills/ ────────────────────────────────────
export async function saveSkillFile(folder, name, content)
⋮----
// ── Delete skill file ─────────────────────────────────────────────────────────
export async function deleteSkillFile(folder, name)
⋮----
export function selectSkills(skills, taskText)
⋮----
// ─── HOOKS v2 ────────────────────────────────────────────────────────────────
⋮----
export async function runHooksV2(hookList, context, folder)
⋮----
// ─── TOKEN TRACKER ────────────────────────────────────────────────────────────
export class TokenTracker
⋮----
reset()
record(inTk, outTk, model)
lastCost()
summary()
⋮----
// ─── SESSION MANAGER ─────────────────────────────────────────────────────────
export async function saveSession(name, messages, folder, branch)
⋮----
export async function loadSessions()
⋮----
// ─── REWIND ──────────────────────────────────────────────────────────────────
export function rewindMessages(messages, turns)
⋮----
// ─── EFFORT LEVELS ───────────────────────────────────────────────────────────
⋮----
// ─── PERMISSIONS ─────────────────────────────────────────────────────────────
⋮----
write_file:  true,   // auto-execute like Claude Code
⋮----
exec:        true,   // Claude Code runs commands freely
⋮----
delete_file: false,  // tetap false — terlalu destruktif
⋮----
export function checkPermission(permissions, actionType)
⋮----
// normalize: patch_file and write_file use separate permissions now
⋮----
// ─── ELICITATION ─────────────────────────────────────────────────────────────
export function parseElicitation(reply)
⋮----
// ─── TF-IDF MEMORY RANKING ───────────────────────────────────────────────────
export function tfidfRank(memories, queryText, topN = 5)
</file>

<file path="src/features.test.js">
// @vitest-environment node
⋮----
// ── parsePlanSteps ────────────────────────────────────────────────────────────
⋮----
// ── selectSkills ─────────────────────────────────────────────────────────────
⋮----
// ── rewindMessages ───────────────────────────────────────────────────────────
⋮----
// ── checkPermission ───────────────────────────────────────────────────────────
⋮----
// read_file default = true
⋮----
// delete_file default = false
⋮----
// ── parseElicitation ─────────────────────────────────────────────────────────
⋮----
// ── tfidfRank ─────────────────────────────────────────────────────────────────
⋮----
// ── EFFORT_CONFIG ─────────────────────────────────────────────────────────────
</file>

<file path="src/globalfind.test.js">
// @vitest-environment node
⋮----
// ── Pure logic extracted dari GlobalFindReplace ───────────────────────────────
⋮----
function parseGrepOutput(raw, folder)
⋮----
function buildSearchPattern(query, useRegex, matchCase)
⋮----
function applyReplace(content, query, replaceStr, useRegex, matchCase)
⋮----
// ── parseGrepOutput ───────────────────────────────────────────────────────────
⋮----
// ── buildSearchPattern ────────────────────────────────────────────────────────
⋮----
// ── applyReplace ──────────────────────────────────────────────────────────────
</file>

<file path="src/livepreview.test.js">
// @vitest-environment node
⋮----
// ── Inline buildSrcdoc (copied — cannot import component directly in jsdom) ───
⋮----
function buildSrcdoc(tabs)
⋮----
// ── Tests ─────────────────────────────────────────────────────────────────────
⋮----
// Should not inject new script
</file>

<file path="src/setupTest.js">
// Global test setup — vitest isolates modules per file by default
// TextDecoder/TextEncoder are available natively in Node 18+ — do NOT override them
</file>

<file path="src/themes.test.js">
// @vitest-environment node
⋮----
// ── Required top-level tokens every theme must have ──────────────────────────
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// Per-theme schema validation
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// Obsidian/Neon use boxShadow; Aurora uses backdropFilter; Ink uses borderLeft
⋮----
// Some themes (Ink) return {} intentionally — just verify no throw
⋮----
// Aurora and Ink intentionally return {} (no text glow needed)
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// Cross-theme consistency
// ═══════════════════════════════════════════════════════════════════════════════
</file>

<file path="src/utils.extended.test.js">
// @vitest-environment node
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// executeAction — all remaining action types
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// countTokens — extended
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// countTokens does not guard against null entries — documents current behavior
⋮----
const msgs = [{ content: 'abc' }]; // 3/4 = 0.75 → round to 1
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// resolvePath — extended
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// '/base/src/file.js' with leading slash stripped = 'base/src/file.js'
// which does not start with '/base', so it gets joined → '/base/base/src/file.js'
// Use paths WITHOUT leading slash for relative resolution to avoid this
⋮----
// Already-prefixed path (no extra slash) works correctly:
⋮----
expect(typeof result2).toBe('string'); // documents current behavior without asserting wrong
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// generateDiff — extended
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// parseActions — extended
// ═══════════════════════════════════════════════════════════════════════════════
</file>

<file path="src/utils.snapshot.test.js">
// @vitest-environment node
⋮----
// ── Snapshot Tests: hl() output ───────────────────────────────────────────────
// Pertama kali run: vitest simpan "foto" output.
// Run berikutnya: kalau output berubah 1 karakter, test langsung fail.
// Update snapshot: npx vitest run --update-snapshots
</file>

<file path="src/utils.test.js">
// @vitest-environment node
⋮----
// ── TEST countTokens ─────────────────────────────────────────────────────────
⋮----
// (5 + 6) / 4 = 2.75 → rounded to 3
⋮----
{ text: 'No content' }  // no .content field
⋮----
// only 'Hi' counts: 2 / 4 = 0.5 → rounds to 1
⋮----
// ── TEST getFileIcon ─────────────────────────────────────────────────────────
⋮----
// ── TEST hl (syntax highlight) ───────────────────────────────────────────────
⋮----
// ── TEST resolvePath ─────────────────────────────────────────────────────────
⋮----
// ── TEST parseActions ────────────────────────────────────────────────────────
</file>

<file path=".gitignore">
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.env.local
*.zip
commit-history.txt
</file>

<file path="bashrc-additions.sh">
# ── YuyuCode v2.7+ .bashrc additions ─────────────────────────────────────────
# Tambahkan snippet ini ke ~/.bashrc, lalu: source ~/.bashrc

# ── Auto-restart server on crash ─────────────────────────────────────────────
# Ganti baris: node ~/yuyu-server.js > /dev/null 2>&1 &
# Dengan ini:
yuyu-server-start() {
  while true; do
    node ~/yuyu-server.js > ~/.yuyu-server.log 2>&1
    echo "⚠️  yuyu-server crashed — restarting in 2s..." >&2
    sleep 2
  done &
  echo "✅ yuyu-server running (auto-restart enabled)"
}
# Untuk auto-start di setiap sesi, tambahkan di .bashrc:
# yuyu-server-start

# ── yuyu-status — overview satu command ──────────────────────────────────────
yuyu-status() {
  local port=8765
  local server_status
  if curl -sf "http://localhost:${port}/health" > /dev/null 2>&1; then
    local health=$(curl -sf "http://localhost:${port}/health" 2>/dev/null)
    local uptime=$(echo "$health" | python3 -c "import json,sys; d=json.load(sys.stdin); u=d.get('uptime',0); print(f'{u//3600}h {(u%3600)//60}m' if u>=3600 else f'{u//60}m {u%60}s')" 2>/dev/null || echo "?")
    server_status="✅ running (uptime: ${uptime})"
  else
    server_status="❌ not running — jalankan: yuyu-server-start"
  fi

  local branch=$(git -C ~/yuyucode branch --show-current 2>/dev/null || echo "?")
  local ahead=$(git -C ~/yuyucode rev-list @{u}..HEAD --count 2>/dev/null || echo "0")
  local version=$(python3 -c "import json; print(json.load(open('$HOME/yuyucode/package.json'))['version'])" 2>/dev/null || echo "?")
  local dirty=$(git -C ~/yuyucode status --short 2>/dev/null | wc -l | tr -d ' ')

  echo ""
  echo "📡 Server  : ${server_status}"
  echo "🌿 Branch  : ${branch}$([ "$ahead" != "0" ] && echo " (${ahead} commit(s) belum push)")"
  echo "📦 Version : v${version}"
  echo "📝 Dirty   : ${dirty} file(s) uncommitted"
  echo ""
}

# ── yuyu-clean — hapus artifacts ─────────────────────────────────────────────
yuyu-clean() {
  cd ~/yuyucode
  echo "🧹 Cleaning build artifacts..."
  local removed=0

  [ -d "dist" ]      && rm -rf dist      && echo "  🗑  dist/"         && removed=$((removed+1))
  [ -d "coverage" ]  && rm -rf coverage  && echo "  🗑  coverage/"     && removed=$((removed+1))

  for f in .yuyu/compressed*.md; do
    [ -f "$f" ] && rm "$f" && echo "  🗑  $f" && removed=$((removed+1))
  done

  for f in /sdcard/Download/*.zip; do
    [ -f "$f" ] && echo "  ⚠️  Download zip found: $(basename $f) — hapus manual kalau mau"
  done

  if [ "$removed" -eq 0 ]; then
    echo "  ✨ Already clean!"
  else
    echo ""
    echo "✅ Cleaned ${removed} artifact(s)"
  fi
}

# ── yuyu-cp v2 — support subdirectory ────────────────────────────────────────
# Ganti fungsi yuyu-cp yang lama dengan versi ini
yuyu-cp() {
  local file="${1}"
  local dest_dir="${2:-}"   # optional: target subdir relative to yuyucode root

  local src="/sdcard/Download/${file}"
  local base_dest="$HOME/yuyucode"

  if [ ! -f "$src" ]; then
    echo "❌ File '$file' tidak ditemukan di /sdcard/Download/"
    echo "📂 Isi Download terbaru:"
    ls -t /sdcard/Download/ | head -n 5
    return 1
  fi

  if [[ "$file" == *.zip ]]; then
    echo "📦 Zip terdeteksi — delegasi ke yuyu-apply..."
    yuyu-apply "$file"
    return $?
  fi

  # Determine destination
  local dest
  if [ -n "$dest_dir" ]; then
    dest="${base_dest}/${dest_dir}/${file}"
  else
    dest="${base_dest}/${file}"
  fi

  cd ~/yuyucode

  # Warn if git-tracked with uncommitted changes
  local rel_dest="${dest#$base_dest/}"
  if git ls-files --error-unmatch "$rel_dest" &>/dev/null 2>&1; then
    if ! git diff --quiet "$rel_dest" 2>/dev/null; then
      echo "⚠️  '$rel_dest' ada uncommitted changes di git."
      echo -n "Lanjut overwrite? Tekan y/Y untuk lanjut, lainnya batal: "
      read -s -n 1 key
      echo ""
      case "$key" in
        y|Y) echo "👍 Overwriting..." ;;
        *)   echo "✋ Dibatalkan."; return 0 ;;
      esac
    fi
  fi

  mkdir -p "$(dirname "$dest")"
  if cp "$src" "$dest" && rm "$src"; then
    echo "✅ '$file' → ${dest#$HOME/} ✓ (Download dibersihkan)"
  else
    echo "⚠️  Gagal memindahkan file. Cek izin storage Termux!"
    return 1
  fi
}

# ── Tab completions (update) ──────────────────────────────────────────────────
_yuyu_cp_completion() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local files=$(ls /sdcard/Download/ 2>/dev/null)
  COMPREPLY=( $(compgen -W "$files" -- "$cur") )
}
complete -F _yuyu_cp_completion yuyu-cp

# ── yuyu-unstash — pop stash, auto-resolve conflicts ke HEAD ─────────────────
yuyu-unstash() {
  cd ~/yuyucode

  local stash="${1:-stash@{0}}"

  # Cek ada stash
  if ! git stash list | grep -q "stash@"; then
    echo "✅ Tidak ada stash."
    return 0
  fi

  echo "📦 Popping $stash..."
  git stash pop "$stash" 2>&1 | head -20

  # Cek konflik
  local conflicts=$(git diff --name-only --diff-filter=U 2>/dev/null)
  if [ -z "$conflicts" ]; then
    echo "✅ Stash pop bersih, tidak ada konflik."
    return 0
  fi

  echo ""
  echo "⚠️  Konflik ditemukan — auto-resolve ke HEAD:"
  for f in $conflicts; do
    git checkout HEAD -- "$f"
    git add "$f"
    echo "  ✅ $f → kept HEAD"
  done

  git stash drop 2>/dev/null
  echo ""
  echo "✅ Selesai! Perubahan stash yang tidak konflik sudah masuk."
}
</file>

<file path="llms.txt">
# YuyuCode — LLM Context Brief
> Version: 2.5.0 | Generated: 2026-03-20

## What is this project?
YuyuCode is a Claude Code / Cursor-style agentic coding assistant built natively for Android.
Runs entirely on a phone (Oppo A77s, Snapdragon 680) via Termux. No laptop. No desktop.

## Architecture overview
- **Frontend**: React 19 + Vite 5, runs as Capacitor Android app
- **Backend**: `yuyu-server.js` — local Node.js server in Termux (HTTP :8765, WS :8766)
- **Editor**: CodeMirror 6 with full extension suite (vim, emmet, ghost text, LSP, blame, collab)
- **AI**: Cerebras (default, Qwen 3 235B) → Groq (fallback, Kimi K2 262K)
- **Build**: GitHub Actions → signed APK

## Critical constraints — NEVER change without understanding why
- `"overrides": { "rollup": "npm:@rollup/wasm-node" }` — required for ARM64 Termux build
- `vitest@1` — v4 crashes silently on Termux ARM64
- Never override `global.TextDecoder` in tests — infinite recursion on Node 24
- `android/` folder — Capacitor-managed, manual edits break sync

## Hot files (highest salience)
- `src/setupTest.js` — 
- `vitest.config.js` — 
- `src/theme.js` — 
- `src/plugins/brightness.js` — 
- `src/components/panels.jsx` — 
- `src/themes/index.js` — THEMES_MAP, THEME_KEYS, DEFAULT_THEME
- `src/main.jsx` — 
- `src/hooks/useBrightness.js` — useBrightness
- `vite.config.js` — 
- `src/components/AppSidebar.jsx` — AppSidebar

## Hooks
- `src/hooks/useAgentLoop.js` — useAgentLoop
- `src/hooks/useAgentSwarm.js` — useAgentSwarm
- `src/hooks/useApprovalFlow.js` — 
- `src/hooks/useBrightness.js` — useBrightness
- `src/hooks/useChatStore.js` — useChatStore
- `src/hooks/useDevTools.js` — 
- `src/hooks/useFileStore.js` — useFileStore
- `src/hooks/useGrowth.js` — useGrowth
- `src/hooks/useMediaHandlers.js` — useMediaHandlers
- `src/hooks/useNotifications.js` — useNotifications
- `src/hooks/useProjectStore.js` — useProjectStore
- `src/hooks/useSlashCommands.js` — 
- `src/hooks/useUIStore.js` — useUIStore

## Components
- `src/components/AppChat.jsx` (485L)
- `src/components/AppHeader.jsx` (78L)
- `src/components/AppPanels.jsx` (271L)
- `src/components/AppSidebar.jsx` (38L)
- `src/components/FileEditor.jsx` (779L)
- `src/components/FileTree.jsx` (293L)
- `src/components/GlobalFindReplace.jsx` (248L)
- `src/components/KeyboardRow.jsx` (73L)
- `src/components/LivePreview.jsx` (208L)
- `src/components/MsgBubble.jsx` (481L)
- `src/components/SearchBar.jsx` (68L)
- `src/components/Terminal.jsx` (342L)
- `src/components/ThemeEffects.jsx` (168L)
- `src/components/VoiceBtn.jsx` (135L)
- `src/components/panels.agent.jsx` (317L)
- `src/components/panels.base.jsx` (167L)
- `src/components/panels.git.jsx` (537L)
- `src/components/panels.jsx` (19L)
- `src/components/panels.tools.jsx` (605L)

## Agent loop flow
1. User sends message → `useAgentLoop.sendMsg()`
2. Auto-compact if context > 80K chars
3. `gatherProjectContext()` — reads handoff → map → llms.txt → tree → keyword files
4. `buildSystemPrompt()` — injects memories, skills, file context, handoff
5. Stream to AI → parse `<action>` blocks
6. Execute actions (parallel: read/search/list; serial: exec/mcp)
7. Feed results back → loop until done

## Key patterns
- All AI calls via `askCerebrasStream()` in `src/api.js`
- Server actions via `callServer({type, ...})` — see `yuyu-server.js`
- Slash commands in `useSlashCommands.js` (~60 commands)
- /compact is deprecated — use /handoff instead
- Theme tokens: never hardcode colors — use `T.colorName` from active theme
- Tests: `npx vitest run` must pass 546/546. `npm run lint` must be 0 errors.

## Context quantization files (auto-loaded by gatherProjectContext)
- `.yuyu/handoff.md` — session handoff (run /handoff to update)
- `.yuyu/map.md` — symbol index with salience scores
- `.yuyu/compressed.md` — repomix-style compressed source (~70% reduction)
- `llms.txt` — this file

## yuyu-server index endpoint
```js
// Real-time symbol extraction — no file needed
callServer({ type: 'index', path: '/path/to/src' })
// Returns: markdown of all function signatures, no bodies
```

## Run map generator
```bash
node yuyu-map.cjs           # full regeneration
node yuyu-map.cjs --compress-only  # only update compressed.md
```

> Auto-generated by `node yuyu-map.cjs` — run after major refactors
</file>

<file path=".github/workflows/quality.yml">
name: Quality Gate

on:
  push:
    branches: [ main ]
    paths-ignore: ['**.md']
  pull_request:
    branches: [ main ]

jobs:
  # ── SEMGREP SAST ────────────────────────────────────────────────────────────
  semgrep:
    name: SAST · Semgrep
    runs-on: ubuntu-latest
    permissions:
      security-events: write   # diperlukan untuk upload SARIF ke GitHub Security tab
      actions: read
      contents: read
    container:
      image: semgrep/semgrep
    steps:
      - uses: actions/checkout@v5

      - name: Run Semgrep
        # --error dihapus — finding tidak block CI, tetap muncul di Security tab
        run: |
          semgrep scan \
            --config p/javascript \
            --config p/react \
            --config p/secrets \
            --config p/owasp-top-ten \
            --sarif \
            --output semgrep.sarif \
            src/ || true

      - name: Upload SARIF to GitHub Security
        if: always()
        uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: semgrep.sarif
          category: semgrep

  # ── SONARCLOUD ──────────────────────────────────────────────────────────────
  # Setup: sonarcloud.io → import repo → tambah SONAR_TOKEN ke GitHub Secrets
  sonarcloud:
    name: Quality · SonarCloud
    runs-on: ubuntu-latest
    continue-on-error: true   # non-blocking sampai SONAR_TOKEN di-set
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v5
        with:
          node-version: '24'
          cache: 'npm'

      - name: Cache node_modules
        id: nm-cache
        uses: actions/cache@v5
        with:
          path: node_modules
          key: nm-${{ hashFiles('package-lock.json') }}

      - name: Install dependencies
        if: steps.nm-cache.outputs.cache-hit != 'true'
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:ci

      - name: SonarCloud Scan
  
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
</file>

<file path="src/components/Terminal.jsx">
// ── Terminal — xterm.js dengan layout yang benar ─────────────────────────────
⋮----
// xterm CSS diinject manual supaya tidak corrupt global styles
⋮----
// ── TrafficDot — isolated component so onClick never accesses ref during render
function TrafficDot(
⋮----
export function Terminal(
⋮----
const wrapRef   = useRef(null);  // outer wrapper div (flex:1)
const xtermRef  = useRef(null);  // xterm mount target
⋮----
// ── Theme ─────────────────────────────────────────────────────────────────
⋮----
// ── Mount xterm ────────────────────────────────────────────────────────────
⋮----
// Fit after paint
⋮----
// ResizeObserver untuk fit otomatis
⋮----
// ── Update theme realtime ──────────────────────────────────────────────────
⋮----
function detectError(text)
⋮----
function onTextChange(v)
⋮----
function handleKeyDown(e)
⋮----
function cancel()
⋮----
async function run()
⋮----
{/* Inject xterm CSS tanpa pollute global */}
⋮----
{/* macOS header */}
⋮----
{/* Traffic lights — fungsional: merah=stop, kuning=clear, hijau=send to AI */}
⋮----
{/* xterm container — flex:1 dengan overflow hidden */}
⋮----
{/* AI fix button */}
⋮----
{/* Input bar */}
</file>

<file path="src/features.extra.test.js">
// @vitest-environment node
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// saveSession / loadSessions
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
expect(withName).toHaveLength(1); // deduped
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// loadSkills / saveSkillFile / deleteSkillFile
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// spaces and ! are replaced with -; alphanumeric, dots, hyphens preserved
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT_HOOKS shape
// ═══════════════════════════════════════════════════════════════════════════════
⋮----
// ═══════════════════════════════════════════════════════════════════════════════
// generatePlan / executePlanStep (mocked callAI)
// ═══════════════════════════════════════════════════════════════════════════════
</file>

<file path="vite.config.js">
manualChunks(id)
</file>

<file path="yuyu-bench.cjs">
// yuyu-bench.cjs — Benchmark regression detector v2
// Usage:
//   node yuyu-bench.cjs          # run + auto-save (first) or compare (subsequent)
//   node yuyu-bench.cjs --save   # force update baseline
//   node yuyu-bench.cjs --reset  # clear history
⋮----
const THRESHOLD = 1.5; // warn if ratio drops >1.5x from baseline
⋮----
// ── Run vitest bench ──────────────────────────────────────────────────────────
⋮----
// Strip ANSI escape codes before parsing
⋮----
// ── Parse vitest v1 bench Summary ─────────────────────────────────────────────
// Format:
//   winner name - file > suite
//     Nx faster than loser name
//
// Strategy: for each winner, store its ratio vs each loser as score.
// Score = sum of all Nx ratios this bench wins — higher = faster overall.
// Regression = score drops significantly between runs.
⋮----
const scores = {}; // name → total score (sum of ratios won)
⋮----
// Find summary section
⋮----
// Parse blocks: winner line followed by "  Nx faster than loser" lines
⋮----
// Winner line: "  name - file > suite" OR "  name  " (no file)
⋮----
// Simpler: winner lines start with 2 spaces, ratio lines start with 4 spaces
⋮----
// Extract bench name — strip " - file > suite" suffix
⋮----
// ── Load history & compare ────────────────────────────────────────────────────
⋮----
const fmtScore = s => `score $
⋮----
// ── Save ──────────────────────────────────────────────────────────────────────
</file>

<file path=".github/workflows/build-apk.yml">
name: Build APK

on:
  push:
    branches: [ main ]
    paths-ignore:
      - '**.md'
      - 'README.md'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: '24'
          cache: 'npm'

      - name: Cache node_modules
        id: nm-cache
        uses: actions/cache@v5
        with:
          path: node_modules
          key: nm-${{ hashFiles('package-lock.json') }}

      - name: Install dependencies
        if: steps.nm-cache.outputs.cache-hit != 'true'
        run: npm ci

      - name: Build Vite
        run: npm run build
        env:
          VITE_CEREBRAS_API_KEY: ${{ secrets.VITE_CEREBRAS_API_KEY }}
          VITE_TAVILY_API_KEY: ${{ secrets.VITE_TAVILY_API_KEY }}
          VITE_GROQ_API_KEY: ${{ secrets.VITE_GROQ_API_KEY }}

      - uses: actions/setup-java@v5
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        with:
          packages: 'tools platform-tools platforms;android-34 build-tools;34.0.0'

      - name: Cache Gradle
        uses: actions/cache@v5
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: gradle-

      - name: Add Capacitor Android
        run: |
          if [ ! -d "android" ]; then npx cap add android; fi
          npx cap sync android
          # Restore custom icon after cap sync overwrites
          echo "=== RESTORING ICONS ==="
          cp -v .github/icons/ic_launcher_background.xml android/app/src/main/res/drawable/ic_launcher_background.xml
          cp -v .github/icons/ic_launcher_foreground.xml android/app/src/main/res/drawable/ic_launcher_foreground.xml
          echo "=== ICONS RESTORED ==="

      # Auto-bump versionCode = build number, versionName = 1.0.N
      - name: Bump version
        uses: chkfung/android-version-actions@v1.2.1
        with:
          gradlePath: android/app/build.gradle
          versionCode: ${{ github.run_number }}
          versionName: 1.0.${{ github.run_number }}

      - name: Build Release APK
        working-directory: android
        run: |
          chmod +x gradlew
          ./gradlew assembleRelease --parallel --build-cache

      # Decode keystore from secret, sign & zipalign
      - name: Sign APK
        id: sign_apk
        uses: r0adkll/sign-android-release@v1
        with:
          releaseDirectory: android/app/build/outputs/apk/release
          signingKeyBase64: ${{ secrets.ANDROID_KEYSTORE }}
          alias: ${{ secrets.KEY_ALIAS }}
          keyStorePassword: ${{ secrets.KEYSTORE_PASSWORD }}
          keyPassword: ${{ secrets.KEY_PASSWORD }}
        env:
          BUILD_TOOLS_VERSION: "34.0.0"

      - name: Rename signed APK
        run: cp "${{ steps.sign_apk.outputs.signedReleaseFile }}" android/app/build/outputs/apk/release/YuyuCode.apk

      # Keep artifact upload as backup
      - name: Upload APK artifact
        uses: actions/upload-artifact@v4
        with:
          name: YuyuCode-v1.0.${{ github.run_number }}
          path: android/app/build/outputs/apk/release/YuyuCode.apk

      - name: Get version & commit info
        id: info
        run: |
          echo "version=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT
          echo "date=$(date +'%Y-%m-%d')" >> $GITHUB_OUTPUT
          echo "msg=$(git log -1 --pretty=%s)" >> $GITHUB_OUTPUT

      # Create GitHub Release — hanya jika commit message diawali 'release:'
      - name: Create Release
        if: startsWith(github.event.head_commit.message, 'release:')
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ steps.info.outputs.version }}
          name: "YuyuCode v${{ steps.info.outputs.version }} (${{ steps.info.outputs.date }})"
          body: |
            **${{ steps.info.outputs.msg }}**

            | | |
            |---|---|
            | Version | ${{ steps.info.outputs.version }} |
            | Build | #${{ github.run_number }} |
            | Commit | ${{ github.sha }} |
            | Date | ${{ steps.info.outputs.date }} |

            ⬇️ Download **YuyuCode.apk** di bawah
          files: android/app/build/outputs/apk/release/YuyuCode.apk
          make_latest: true
</file>

<file path="src/components/AppPanels.jsx">
// ── AppPanels ─────────────────────────────────────────────────────────────────
// Semua panel overlay, modal, dan floating UI yang render di atas main layout.
// Memory, checkpoints, swarm log, dep graph, semua BottomSheet panels,
// onboarding, dan commit modal.
⋮----
export function AppPanels({
  T, ui, project, file, chat,
  sendMsg, compactContext, runShortcut,
  fetchGitHub, runDeploy, runTests, generateCommitMsg,
  haptic, saveCheckpoint, restoreCheckpoint,
  fileInputRef, handleImageAttach,
})
⋮----
{/* Search */}
⋮----
{/* Light overlays */}
⋮----
{/* Command Palette */}
⋮----
{/* Memory */}
⋮----
{/* Checkpoints */}
⋮----
{/* Swarm log */}
⋮----
{/* Onboarding */}
⋮----
{/* Activity-wrapped panels */}
⋮----
{/* File input (hidden) */}
⋮----
{/* Commit modal */}
</file>

<file path="src/components/panels.tools.jsx">
// ─── CUSTOM ACTIONS PANEL ─────────────────────────────────────────────────────
export function CustomActionsPanel(
⋮----
function save(list)
⋮----
function add()
⋮----
// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────
⋮----
// ─── SHORTCUTS PANEL ──────────────────────────────────────────────────────────
export function ShortcutsPanel(
⋮----
// ─── GIT BLAME PANEL ──────────────────────────────────────────────────────────
⋮----
// ─── SNIPPET LIBRARY ──────────────────────────────────────────────────────────
export function SnippetLibrary(
⋮----
function addSnippet()
⋮----
// ─── THEME BUILDER ────────────────────────────────────────────────────────────
// ThemeBuilder diganti ThemePicker — theme kini dari file src/themes/*.js
⋮----
// ─── THEME BUILDER ────────────────────────────────────────────────────────────
export function ThemeBuilder(
⋮----
{/* accent swatch */}
⋮----
// ─── COMMAND PALETTE ──────────────────────────────────────────────────────────
⋮----
// ── DeployPanel ───────────────────────────────────────────────────────────────
export function DeployPanel(
⋮----
// ── McpPanel ──────────────────────────────────────────────────────────────────
⋮----
// ── McpPanel ──────────────────────────────────────────────────────────────────
export function McpPanel(
⋮----
// ── GitHubPanel ───────────────────────────────────────────────────────────────
⋮----
// ── GitHubPanel ───────────────────────────────────────────────────────────────
export function GitHubPanel(
⋮----
// ── SessionsPanel ─────────────────────────────────────────────────────────────
⋮----
// ── SessionsPanel ─────────────────────────────────────────────────────────────
export function SessionsPanel(
⋮----
// ── PermissionsPanel ──────────────────────────────────────────────────────────
⋮----
// ── PermissionsPanel ──────────────────────────────────────────────────────────
export function PermissionsPanel(
⋮----
// ── PluginsPanel ──────────────────────────────────────────────────────────────
// ── PluginsPanel ──────────────────────────────────────────────────────────────
⋮----
export function PluginsPanel(
⋮----
// ── ConfigPanel ───────────────────────────────────────────────────────────────
export function ConfigPanel({
  effort, fontSize, theme, model, thinkingEnabled, models,
  onEffort, onFontSize, onTheme, onModel, onThinking,
  // Fase 1+2
  vimMode, onVimMode,
  showMinimap, onMinimap,
  ghostTextEnabled, onGhostText,
  lintEnabled, onLint,
  // Fase 3
  tsLspEnabled, onTsLsp,
  blameEnabled, onBlame,
  multiCursor, onMultiCursor,
  stickyScroll, onStickyScroll,
  collabEnabled, onCollab,
  // Visual Diff Review
  diffReview, onDiffReview,
  onClose, T,
})
⋮----
// Fase 1+2
⋮----
// Fase 3
⋮----
// Visual Diff Review
⋮----

⋮----
const makeToggle = (label, sublabel, value, onToggle, color, bg, br)
⋮----
function ToggleRow(
⋮----
// ── BgAgentPanel — live progress tracking ────────────────────────────────────
// ── ElapsedTime — isolated so Date.now() stays out of parent render ──────────
function ElapsedTime(
</file>

<file path="src/hooks/useProjectStore.js">
export function useProjectStore()
⋮----
// ── Battery ──
⋮----
// ── Project / Folder ──
⋮----
// ── Server / Network ──
⋮----
// ── Model / Effort ──
⋮----
// ── Session identity ──
⋮----
// ── Command history ──
⋮----
// ── Permissions / Hooks / Plugins ──
⋮----
// ── GitHub ──
⋮----
// ── Agent memory (cross-session user/project/local) ──
⋮----
// ── Loop / PTT ──
⋮----
// ── File watcher (belongs to project context) ──
⋮----
// ── Persisted setters ──
function setFolder(f)
function saveFolder(f)
function setModel(id)
function setEffort(e)
function setNotes(n, folderKey)
function setSessionColor(c)
function setGithubToken(t)
function setGithubRepo(r)
function setPermissions(p)
function setHooks(h)
function setActivePlugins(p)
⋮----
function setDiffReview(v)
function addHistory(cmd)
⋮----
// ── runHooks wrapper ──
async function runHooks(type, context = '')
⋮----
// ── effortCfg derived ──
⋮----
// ── Load from Preferences ──
function loadProjectPrefs({
    folder: f, cmdHistory: ch, model: mo, pinned: _pinned, recent: _recent,
    memories: _memories, checkpoints: _checkpoints, hooks: hk, githubToken: ght, githubRepo: ghr,
    sessionColor: sc, plugins, effort: ef, thinkingEnabled: th, permissions: perm, diffReview: dr,
})
⋮----
// ── Load folder-specific prefs ──
async function loadFolderPrefs(f)
⋮----
// Auto-load skills dari .yuyu/skills/, respect saved active map
⋮----
// ── Skill helpers ──
async function toggleSkill(name)
async function uploadSkill(name, mdContent)
async function removeSkill(name)
</file>

<file path="src/hooks/useUIStore.js">
export function useUIStore()
⋮----
// ── Ambient brightness ──
⋮----
// ── Panels / Overlays ──
⋮----
// ── Editor feature toggles (Fase 1+2) ──
⋮----
// ── Editor feature toggles (Fase 3) ──
⋮----
// ── Theme / Display ──
⋮----
// ── Misc UI ──
⋮----
// ── Elicitation ──
⋮----
// ── Merge Conflict ──
⋮----
// ── Derived: T = active theme object ──
⋮----
// ── Persisted setters ──
function setTheme(key)
function setFontSize(n)
function setSidebarWidth(w)
function setVimMode(v)
function setShowMinimap(v)
function setGhostTextEnabled(v)
function setLintEnabled(v)
function setTsLspEnabled(v)
function setBlameEnabled(v)
function setMultiCursor(v)
function setStickyScroll(v)
function setCollabEnabled(v)
⋮----
// ── Load from Preferences ──
function loadUIPrefs(
⋮----
// panels
⋮----
// editor feature toggles fase 1+2
⋮----
// editor feature toggles fase 3
⋮----
// theme/display
⋮----
// misc
</file>

<file path="src/utils.integration.test.js">
// @vitest-environment node
⋮----
// ── Dependency injection — NO vi.mock needed, compatible with isolate:false ──
// executeAction(action, folder, _callServer) — inject a mock directly
⋮----
// ── Integration: parseActions → executeAction ─────────────────────────────────
⋮----
// ── generateDiff ───────────────────────────────────────────────────────────────
⋮----
// ── resolvePath ───────────────────────────────────────────────────────────────
⋮----
// resolvePath strips leading slash from p before checking,
// so '/proj/src/App.jsx' becomes 'proj/src/App.jsx' which doesn't startWith '/proj'
// result: base + '/' + stripped = '/proj/proj/src/App.jsx'
// This is the documented behavior — callers should pass relative paths
⋮----
// ── Fuzz: parseActions edge cases ─────────────────────────────────────────────
⋮----
// ── Property-based tests (inline — no external deps needed) ──────────────────
// Minimal fc-like runner — zero dependency, works without npm install
⋮----
assert(prop,
property(arb, fn)
property2(a1, a2, fn)
string(
constantFrom(...vals)
record(shape)
filteredString(filter,
</file>

<file path="src/components/MsgBubble.jsx">
// ── ThinkingBlock — collapsible, pakai count kalau ada newlines ──────────────
export function ThinkingBlock(
⋮----
// Count "steps" = non-empty paragraphs separated by blank lines
⋮----
// ── StreamingBubble — live render saat generate, parse think realtime ─────────
export function StreamingBubble(
⋮----
// Parse <think> dari stream secara realtime
⋮----
// Nothing yet — show blink cursor only
⋮----
// ── MsgContent — markdown + code blocks ──────────────────────────────────────
export function MsgContent(
⋮----
function copyCode(code, idx)
⋮----
function handleCopy(e)
⋮----
table:(
th:(
td:(
h1:(
h2:(
h3:(
p:(
code:(
blockquote:(
hr:(
strong:(
em:(
li:(
ul:(
ol:(
a:(
⋮----
{/* Header: label kiri */}
⋮----
// Code block — lang label kiri, copy button kanan (Claude/Gemini style)
⋮----
{/* Lang label — kiri */}
⋮----
{/* Copy button — kanan, compact */}
⋮----
// ── DiffReviewCard — per-file diff preview dengan accept/reject ───────────────
function DiffReviewCard(
⋮----
const renderDiffLine = (line) =>
⋮----
{/* Header */}
⋮----
{/* Diff preview */}
⋮----
{/* Actions */}
⋮----
// ── ActionChip ────────────────────────────────────────────────────────────────
export function ActionChip(
⋮----
// ── MsgBubble ─────────────────────────────────────────────────────────────────
export function MsgBubble(
⋮----
function doCopy()
⋮----
// ── User bubble ─────────────────────────────────────────────────────────────
⋮----
// ── AI bubble ───────────────────────────────────────────────────────────────
⋮----
onEdit&&
</file>

<file path="src/utils.js">
// ── TOKEN COUNT ──
export function countTokens(msgs)
⋮----
// ── FILE ICON ──
export function getFileIcon(name)
// ── SYNTAX HIGHLIGHT ──
// Baru untuk dimasukkan ke utils.js
// Ganti function hl() yang lama
export function hl(code, lang = '')
⋮----
// Protect already-generated spans from subsequent regex passes
function protect(str, fn)
⋮----
// default JS/JSX/TS/TSX
⋮----
// ── PATH RESOLVER ──
export function resolvePath(base, p)
⋮----
const b = base.replace(/\/$/, '');      // strip trailing slash
const q = p.replace(/^\//, '');          // strip leading slash
⋮----
// ── ACTION PARSER ──
export function parseActions(text)
⋮----
// ── SIMPLE DIFF GENERATOR ──
// Returns a compact unified-diff-style string for display (not patch format).
export function generateDiff(original, patched, maxLines = 40)
⋮----
// ── ACTION EXECUTOR ──
export async function executeAction(action, baseFolder, _callServer = callServer)
</file>

<file path="src/components/AppChat.jsx">
// ── AppChat ───────────────────────────────────────────────────────────────────
// Center area: multi-tab bar, chat, file viewer, file editor, terminal,
// live preview, keyboard row, follow-up chips, quick bar, and composer.
⋮----
export function AppChat({
  T, ui, project, file, chat,
  sendMsg, cancelMsg, retryLast, continueMsg,
  handleApprove, handlePlanApprove,
  handleCameraCapture, fileInputRef,
  runShortcut, stopTts,
  visibleMessages,
})
⋮----
const [searchQ, setSearchQ] = useState(null); // null=hidden, ''=open
⋮----
// editorConfig derived from ui prefs
⋮----
// Fase 3
⋮----
// ── Keyboard row insert handler ──────────────────────────────────────────
function handleKeyboardInsert(text)
⋮----
// If file editor is visible and focused → insert into CM
⋮----
// Fallback: insert into textarea
⋮----
// Active tab object
⋮----
{/* ── MULTI-TAB BAR ── */}
⋮----
{/* Chat tab */}
⋮----
{/* File tabs */}
⋮----
{/* Edit mode toggle */}
⋮----
{/* Close button */}
⋮----
{/* Live Preview button */}
⋮----
{/* Terminal toggle */}
⋮----
{/* ── CHAT ── */}
⋮----
{/* ── FILE VIEWER (read-only) ── */}
⋮----

⋮----
{/* ── FILE EDITOR (CodeMirror) ── */}
⋮----
{/* ── LIVE PREVIEW ── */}
⋮----
{/* ── GLOBAL FIND & REPLACE ── */}
⋮----
{/* ── TERMINAL ── */}
⋮----
{/* ── KEYBOARD ROW (file edit mode only) ── */}
⋮----
{/* ── FOLLOW UPS ── */}
⋮----
{/* ── QUICK BAR ── */}
⋮----
{/* ── INPUT COMPOSER ── */}
⋮----
// Fuzzy prefix + substring match
⋮----
// Context boost: periksa pesan terakhir untuk saran relevan
⋮----
// Sort: context boost dulu, lalu alphabetical
</file>

<file path="src/components/panels.jsx">
// ── panels.jsx — barrel re-export ───────────────────────────────────────────
// Semua panel diimport dari sini supaya App.jsx tidak perlu tahu lokasi internal.
// Edit panel: buka file yang sesuai:
//   panels.base.jsx  — BottomSheet, CommandPalette
//   panels.git.jsx   — GitComparePanel, FileHistoryPanel, GitBlamePanel,
//                      DepGraphPanel, MergeConflictPanel
//   panels.agent.jsx — ElicitationPanel, SkillsPanel, BgAgentPanel
//   panels.tools.jsx — CustomActionsPanel, ShortcutsPanel, SnippetLibrary,
//                      ThemeBuilder, DeployPanel, McpPanel, GitHubPanel,
//                      SessionsPanel, PermissionsPanel, PluginsPanel, ConfigPanel
</file>

<file path="src/hooks/useAgentLoop.js">
export function useAgentLoop({
  project, chat, file, ui,
  sendNotification, haptic, speakText,
  abortRef, handleSlashCommandRef,
  growth,
})
⋮----
// ── callAI ──
function callAI(msgs, onChunk, signal, imageBase64)
⋮----
// Llama 4 Scout support vision, llama-3.3-70b tidak
⋮----
// ── abTest — kirim ke dua model paralel, tampilkan side by side ──
async function abTest(task, modelA, modelB)
⋮----
// Tampilkan hasil side by side
⋮----
...m.slice(0, -1), // hapus "Menunggu..." bubble
⋮----
// ── compactContext ──
// inlineCall=true → dipanggil dari dalam sendMsg, jangan overwrite abortRef atau set loading
async function compactContext(inlineCall = false)
⋮----
// Bug #2 fix: jangan overwrite abortRef saat inline — buat local ctrl
⋮----
// Gunakan signal dari abortRef.current supaya outer abort juga bisa stop compact
⋮----
// Bug #3 fix: jangan reset loading jika inline (sendMsg yang akan reset di akhir)
⋮----
// ── executeWithPermission ──
async function executeWithPermission(a, folder)
⋮----
// ── gatherProjectContext — "read before act" ─────────────────────────────────
// Priority: handoff.md → map.md → llms.txt → tree → keyword heuristic files
async function gatherProjectContext(txt, _signal)
⋮----
// 1. Session handoff — highest priority (previous session context)
⋮----
// 1c. YUYU.md — persistent project rules (reload fresh setiap sesi)
⋮----
// Sync ke project state supaya buildSystemPrompt selalu pakai versi terbaru
⋮----
// 1b. Pinned files — always inject into context
⋮----
// 2. Codebase map — symbol index (signatures only, low token cost)
⋮----
// 2b. Compressed source — repomix-style, bodies stripped (~70% reduction)
// Only load if task is complex (mentions multiple files or refactor keywords)
⋮----
// 3. llms.txt — project brief (architecture, constraints, patterns)
⋮----
// 4. Tree struktur (always — untuk spatial awareness)
⋮----
// 5. Keyword heuristic — file yang spesifik relevan dengan task
⋮----
// Task mentions file name directly
⋮----
// Keyword → relevant file
⋮----
// 6. Baca paralel — max 5 additional files
⋮----
// ── buildSystemPrompt ───────────────────────────────────────────────────────
function buildSystemPrompt(txt, cfg)
⋮----
const stripFrontmatter = s
⋮----
// ── sendMsg — agent loop ──
async function sendMsg(override, _opts =
⋮----
// Slash command
⋮----
// Auto-compact jika context > 80K chars
⋮----
await compactContext(true); // inline — jangan reset abortRef atau loading
// compactContext sudah update chat.messages — tapi kita gunakan history lama
// untuk allMessages awal (messages baru akan terpakai di iter berikutnya via getState)
⋮----
// ── Pre-load pinned files ──
⋮----
// ── Read before act — gather project context sebelum iter 1 ──
⋮----
// ── MAIN AGENT LOOP ──
// ── Server health check before first iter ──
⋮----
// Graceful stop — finish this iteration then stop
⋮----
// content bisa array (vision dari iter sebelumnya) — flatten ke string untuk history
⋮----
// Token tracking
⋮----
// ── Separate actions by type ──
// patch_file  → auto-execute (find-and-replace)
// write_file  → auto-execute WITH backup (Claude Code behavior)
// read_file   → parallel
// web_search  → parallel
// safe others (list,tree,search,mkdir,file_info,find_symbol) → parallel
// exec        → serial (side effects, order matters)
// mcp         → serial
⋮----
// ── Read files (parallel) ──
⋮----
// ── Web search + safe actions (all parallel) ──
⋮----
// ── Exec / MCP (serial — order matters) ──
⋮----
// ── AUTO-EXECUTE / DIFF REVIEW: patch_file ──
⋮----
// ── Diff Review mode — pre-compute diff, pause loop, tunggu user ──
⋮----
// Baca file asli untuk diff preview
⋮----
a.executed = false; // pending — belum dieksekusi
⋮----
// Push message dengan actions pending, break loop — tunggu approval
⋮----
return; // loop pause — resume via /continue setelah user approve
⋮----
// Patch failed → self-correct
⋮----
// ── AUTO-EXECUTE / DIFF REVIEW: write_file ──
⋮----
// ── Diff Review mode — pre-compute diff, pause loop ──
⋮----
// File baru — tidak ada diff, tunjukkan sebagai full add
⋮----
// Backup dulu untuk undo
⋮----
// Store backups for undo
⋮----
// ── Defensive review pass — security & edge cases ──
⋮----
// ── Auto-verify after write — run file, feed error back ──
⋮----
break; // re-enter loop with error context
⋮----
// ── Auto-load imports dari file yang dibaca ──
⋮----
// ── Exec error → auto-fix loop ──
⋮----
// ── Build feedback ──
⋮----
// ── Tidak ada data baru → done ──
⋮----
// ── Ada data → feed back ke AI ──
⋮----
// Tambah XP per sesi dan pelajari style
⋮----
// Auto-continue
⋮----
// PROJECT_NOTE extraction
⋮----
// Elicitation
⋮----
// Tambah XP per sesi dan pelajari style — hanya jika bukan cancel
⋮----
// ── Derived actions ──
function cancelMsg()
⋮----
// XP & learnFromSession tidak di sini — ditangani di catch sendMsg (hanya jika bukan AbortError)
⋮----
async function continueMsg()
⋮----
async function retryLast()
</file>

<file path="src/hooks/useSlashCommands.js">
export function useSlashCommands({
  // state
  model, folder, branch, messages, selectedFile, fileContent, notes,
  memories, checkpoints: _checkpoints, skills, thinkingEnabled, effort, loopActive,
  loopIntervalRef, agentMemory, splitView, pushToTalk, sessionName,
  sessionColor, fileWatcherActive, fileWatcherInterval,
  // setters
  setModel, setMessages, setFolder: _setFolder, setFolderInput: _setFolderInput, setLoading, setStreaming: _setStreaming,
  setThinkingEnabled, setEffort, setLoopActive, setLoopIntervalRef,
  setSplitView, setPushToTalk, setSessionName, setSessionColor,
  setSkills: _setSkills, setFileWatcherActive, setFileWatcherInterval, setFileSnapshots,
  setYuyuMd: _setYuyuMd,
  setPlanSteps, setPlanTask, setAgentMemory, setSessionList,
  setShowCheckpoints, setShowMemory: _setShowMemory, setShowMCP, setShowGitHub, setShowDeploy,
  setShowSessions, setShowPermissions, setShowPlugins, setShowConfig,
  setShowCustomActions, setShowFileHistory, setShowThemeBuilder,
  setShowDepGraph,
  setDepGraph, setFontSize,
  setShowMergeConflict, setMergeConflictData,
  setShowSkills, setShowBgAgents,
  // functions
  sendMsg, compactContext, saveCheckpoint, exportChat, searchMessages,
  setGracefulStop, loading,
  editHistory, setEditHistory, pinnedFiles, togglePin,
  browseTo, runAgentSwarm, callAI, abTest,
  growth,
  sendNotification, haptic,
  // refs
  abortRef,
})
⋮----
// state
⋮----
// setters
⋮----
// functions
⋮----
// refs
⋮----
// ⚠️ Recursive summary anti-pattern — bisa degradasi accuracy seiring waktu
⋮----
// Generate session handoff — structured context for next session
// Better than /compact: creates a forward-looking brief, not recursive summary
⋮----
// Save to .yuyu/handoff.md
⋮----
// Ensure .yuyu dir exists
⋮----
// Add estimated savings vs OpenAI GPT-4
⋮----
// /review --all — review semua changed files vs HEAD
⋮----
// Baca semua file changed (max 8)
⋮----
// /review src/api.js — load file directly
⋮----
// Also get full diff if small
⋮----
async function parseFile(path, depth)
⋮----
// Auto-discover .db files
⋮----
// /db use <file.db> — persist active db per folder di ref
⋮----
// Real-time symbol index via yuyu-server — all function signatures, no bodies
⋮----
// undo N file edits from editHistory
⋮----
// /rules            → tampilkan isi YUYU.md
// /rules add "..."  → append rule baru
// /rules clear      → hapus semua rules
// /rules edit       → buka YUYU.md di editor
⋮----
// Tampilkan YUYU.md
⋮----
// Baca existing dulu
⋮----
// Append rule baru ke section ## Rules, atau buat baru jika belum ada
⋮----
// Generate template YUYU.md dari project context
⋮----
// Delegasi ke sendMsg untuk buka dan edit YUYU.md
⋮----
// Gather project info
⋮----
// /ask <model> <prompt> — tanya model tertentu sekali tanpa ganti default
// contoh: /ask kimi "review kode ini" atau /ask llama8b "explain this"
⋮----
// eslint-disable-next-line react-hooks/exhaustive-deps
</file>

<file path="src/constants.js">
// Re-export THEMES_MAP as THEMES untuk backward compat (panels.jsx, App.jsx)
⋮----
// ── Agent loop limits ─────────────────────────────────────────────────────────
export const AUTO_COMPACT_CHARS   = 80_000;  // trigger auto-compact
export const CONTEXT_WARN_CHARS    = 50_000;  // show yellow context bar warning
export const AUTO_COMPACT_MIN_MSG = 12;      // min messages before auto-compact
export const MAX_FILE_PREVIEW     = 2_000;   // chars of open file injected to context
export const MAX_SKILL_PREVIEW    = 6_000;   // max chars per skill in context
export const CONTEXT_RECENT_KEEP  = 6;       // messages kept after compact
⋮----
// ── Vision ───────────────────────────────────────────────────────────────────
⋮----
// Cerebras — ultra-fast inference
⋮----
// Groq — large context, fallback
⋮----
// ── SIAPA YUYU ───────────────────────────────────────────────────────────
</file>

<file path="vitest.config.js">
// vmThreads is potentially 4x faster but unstable on ARM64 (Termux).
// Auto-detect: use vmThreads on x64, fallback to threads on ARM64.
⋮----
environment: 'jsdom',      // happy-dom faster but not in lockfile → CI fails
⋮----
pool,                      // vmThreads on x64, threads on ARM64 (safe)
isolate: false,            // shared module cache — faster when mocks use DI
css: false,                // skip CSS processing, zero tests need it
</file>

<file path="yuyu-map.cjs">
// ============================================================
//  yuyu-map.cjs — YuyuCode Codebase Quantizer v2
//
//  Inspired by repomix --compress + Aider repomap patterns.
//  Generates:
//    .yuyu/map.md     — symbol index with salience scores
//    .yuyu/compressed.md — repomix-style: signatures only, bodies stripped (~70% token reduction)
//    llms.txt         — high-level project brief
//    .yuyu/handoff.md — session handoff template (if not exists)
//
//  Usage:
//    node yuyu-map.cjs            # generate all
//    node yuyu-map.cjs --verbose  # show progress
//    node yuyu-map.cjs --compress-only  # only update compressed.md
// ============================================================
⋮----
function log(...args)
⋮----
// ── FILE WALKER ────────────────────────────────────────────────────────────────
function walkFiles(dir, exts)
⋮----
function relPath(p)
⋮----
// ── SYMBOL EXTRACTOR (regex-based) ────────────────────────────────────────────
function extractSymbols(src, filePath)
⋮----
// Custom hooks (useXxx) — MUST come before fn patterns to avoid misclassification
⋮----
// export const = arrow hook (useXxx = () =>)
⋮----
// React components (Uppercase) — before generic fn to catch non-exported components
⋮----
// export function / async function (non-hook, non-component)
⋮----
// export const = arrow (non-hook)
⋮----
// Named exports
⋮----
// ── REPOMIX-STYLE COMPRESSOR ──────────────────────────────────────────────────
// Strips function bodies, keeps:
//   - JSDoc / block comments above functions
//   - Function signatures
//   - Import statements
//   - Export declarations
//   - Constants (first line only)
// Result: ~60-75% token reduction while preserving semantic meaning
function compressSource(src, filePath)
⋮----
// Always keep: imports, exports (non-function), comments, blank lines
⋮----
// Detect function/method start — keep signature, strip body
⋮----
// Keep the signature line
⋮----
// Check if body starts on same line
⋮----
// Body starts — skip until balanced
⋮----
// Fast-forward through body
⋮----
// Keep export const = value (first line only for long values)
⋮----
// ── IMPORT EXTRACTOR ──────────────────────────────────────────────────────────
function extractImports(src)
⋮----
// ── SALIENCE SCORER ───────────────────────────────────────────────────────────
function computeSalience(files)
⋮----
} catch { /* skip */ }
⋮----
// Build import graph — count how many files import each file
⋮----
// ── MAP.MD GENERATOR ──────────────────────────────────────────────────────────
function generateMap(fileData)
⋮----
// ── COMPRESSED.MD GENERATOR ───────────────────────────────────────────────────
function generateCompressed(fileData)
⋮----
// ── LLMS.TXT GENERATOR ────────────────────────────────────────────────────────
function generateLlmsTxt(fileData)
⋮----
// ── HANDOFF TEMPLATE ──────────────────────────────────────────────────────────
function ensureHandoffTemplate(_yuyuDir = YUYU_DIR)
⋮----
// ── REPOMIX RUNNER ────────────────────────────────────────────────────────────
// Tries to run `npx repomix --compress` and write to compressed-repomix.md.
// Returns the output string on success, null on any failure (offline, not
// installed, non-zero exit, timeout, etc.).
function tryRepomix(_spawnSync = spawnSync, _outFile)
⋮----
timeout:  90_000,          // 90 s — generous for slow Termux NPX
⋮----
// ── MAIN ──────────────────────────────────────────────────────────────────────
⋮----
// ── INCREMENTAL UPDATE — git diff helper ──────────────────────────────────────
// Returns set of absolute paths changed since last commit.
// Falls back to null (= full scan) if git unavailable or no prior commits.
function getChangedFiles(root, _spawnSync = spawnSync)
⋮----
function main(_opts =
⋮----
// Incremental: if only a few files changed, skip unchanged files for salience
⋮----
// Generate compressed.md — repomix first, regex fallback if offline/unavailable
⋮----
// map.md
⋮----
// llms.txt
⋮----
// handoff template
⋮----
// Dynamic hint — suggest commit message based on changed files
</file>

<file path="src/components/FileEditor.jsx">
// ── FileEditor — CodeMirror 6 · Full IDE ─────────────────────────────────────
// Fase 1+2: Multi-tab, Vim, Emmet, Ghost Text, Minimap, Lint
// Fase 3:   TypeScript LSP, Inline Blame, Sticky Scroll, Code Fold,
//           Multi-Cursor, Breadcrumb, Realtime Collab
⋮----
// ── TypeScript LSP — lazy load @valtown/codemirror-ts ────────────────────────
⋮----
async function getTsExtensions()
⋮----
// ── Language detector ─────────────────────────────────────────────────────────
function getLang(path)
⋮----
function isEmmetLang(path)
⋮----
function isTsLang(path)
⋮----
// ── Theme builder ─────────────────────────────────────────────────────────────
function buildTheme(T)
⋮----
// ── Ghost text ────────────────────────────────────────────────────────────────
⋮----
create: () => (
update(val, tr)
⋮----
// L2 ghost text — deeper preview (dimmer, different color)
⋮----
if (e.is(setGhostEffect))     return { text: '', pos: 0 }; // clear L2 saat L1 datang
⋮----
class GhostWidget extends WidgetType
⋮----
toDOM()
⋮----
// L1: putih-biru transparan (sudah ada). L2: lebih gelap, multi-line preview
⋮----
eq(other)
ignoreEvent()
⋮----
// Hanya tampilkan L2 kalau tidak ada L1 aktif
⋮----
run(view)
⋮----
// Tab+Tab: cek double-tab via timestamp
⋮----
// accept L2
⋮----
// double-tap Tab → accept L2
⋮----
// ── L1: fast, Llama 8B, 300ms debounce — next line ──
async function fetchL1Suggestion(prefix)
⋮----
// ── L2: deeper, Llama 8B dengan max_tokens lebih besar, 900ms debounce — next function body ──
async function fetchL2Suggestion(prefix)
⋮----
function makeGhostPlugin()
⋮----
update(upd)
⋮----
// L1: 300ms debounce — immediate next line
⋮----
// L2: 900ms debounce — deeper multi-line preview
⋮----
destroy()
⋮----
// ── Inline blame gutter ───────────────────────────────────────────────────────
class BlameMarker extends GutterMarker
⋮----
function makeBlameGutter(blameMap)
⋮----
lineMarker(view, line)
initialSpacer: ()
⋮----
async function fetchBlame(folder, filePath)
⋮----
// git blame --abbrev=7 format: "^abc1234 (Author   2024-01-01 1) code"
⋮----
// ── Syntax lint ───────────────────────────────────────────────────────────────
function makeSyntaxLinter(path, folder)
⋮----
// ── Minimap ───────────────────────────────────────────────────────────────────
function Minimap(
⋮----
function draw()
⋮----
// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb(
⋮----
// Listen to cursor movement via a plugin attached after mount
⋮----
function update(v)
// Initial read
⋮----
// Subscribe via updateListener extension — inject as a state facet
// Since view is already created, we use a transaction listener
⋮----
// Inject via a new compartment on existing view
⋮----
// ── Collab WS plugin ──────────────────────────────────────────────────────────
function makeCollabPlugin(wsRef)
⋮----
schedule()
async push()
⋮----
// sendableUpdates is accessed from the view in update()
⋮----
// ── Build optional extensions ─────────────────────────────────────────────────
function buildOptionalExtensions(cfg, path, _folder, collabWsRef)
⋮----
// ── Main FileEditor ───────────────────────────────────────────────────────────
⋮----
insert(text)
focus()
foldAll()
unfoldAll()
⋮----
// ── Mount ──────────────────────────────────────────────────────────────────
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ── Theme sync ──────────────────────────────────────────────────────────────
⋮----
// ── Lang sync ───────────────────────────────────────────────────────────────
⋮----
// ── Optional extensions sync ────────────────────────────────────────────────
⋮----
}, [ // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ── Blame toggle ────────────────────────────────────────────────────────────
⋮----
// ── Blame gutter update ─────────────────────────────────────────────────────
⋮----
// ── TS LSP lazy attach ──────────────────────────────────────────────────────
⋮----
// Further TS integration would attach completionSource + hoverTooltip here
// Requires a tsserver worker — deferred to when worker is available
⋮----
// ── Collab WS ───────────────────────────────────────────────────────────────
⋮----
ws.onopen = () =>
ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
⋮----
? null // fallback
⋮----
ws.onclose = () =>
⋮----
// ── Tab swap ─────────────────────────────────────────────────────────────────
⋮----
}, [tab?.path]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ── External content sync ────────────────────────────────────────────────────
⋮----
// ── Save ──────────────────────────────────────────────────────────────────
⋮----
function onKey(e)
⋮----
const tbBtn = (active) => (
⋮----
{/* Toolbar */}
⋮----
{/* badges */}
⋮----
{/* fold/unfold */}
⋮----
{/* Breadcrumb */}
⋮----
{/* Editor + minimap */}
</file>

<file path="yugit.cjs">
// yugit.cjs — YuyuCode git helper v2
// Usage:
//   node yugit.cjs "feat(api): add endpoint"          # commit + push
//   node yugit.cjs "fix: broken layout" --no-push     # commit only
//   node yugit.cjs "docs: update readme" --amend      # amend last commit
//   node yugit.cjs "revert: bad deploy" --hash abc123 # git revert <hash>
//   node yugit.cjs "feat: thing" "body text" "BREAKING CHANGE: x"  # with body/footer
//   node yugit.cjs "release: v2.x — desc"             # auto version bump + push
//   node yugit.cjs --push                              # push existing local commits
//   node yugit.cjs --squash 3                         # squash last N commits
//   node yugit.cjs --status                           # show branch + changes + recent commits
⋮----
// ── Parse args ────────────────────────────────────────────────────────────────
⋮----
// Filter flags out — remaining args are: [msg, body?, footer?]
⋮----
function run(cmd)
⋮----
function tryRun(cmd)
⋮----
// ── Conventional commit type extractor (scope-aware) ─────────────────────────
// Handles: feat(api): desc → type=feat, scope=api
function parseCommitType(m)
⋮----
// ── Auto version bump ─────────────────────────────────────────────────────────
function bumpVersion()
⋮----
// Explicit vX.Y or vX.Y.Z in message → set directly
⋮----
// ── Diff stat display ─────────────────────────────────────────────────────────
function showDiffStat()
⋮----
// ── Build commit message (multi-line support) ─────────────────────────────────
function buildCommitArgs(finalMsg)
⋮----
// ── Sanity check ──────────────────────────────────────────────────────────────
⋮----
// ── STATUS mode ───────────────────────────────────────────────────────────────
⋮----
// ── PUSH-ONLY mode ────────────────────────────────────────────────────────────
⋮----
// ── SQUASH mode ───────────────────────────────────────────────────────────────
⋮----
// Get the commit message of the oldest commit being squashed
⋮----
// ── AMEND mode ────────────────────────────────────────────────────────────────
⋮----
// ── REVERT mode ───────────────────────────────────────────────────────────────
⋮----
// ── Auto bump version on release ──────────────────────────────────────────────
⋮----
// ── Re-check status after possible package.json edit ─────────────────────────
⋮----
// ── git add ───────────────────────────────────────────────────────────────────
⋮----
// ── git commit ────────────────────────────────────────────────────────────────
⋮----
// ── git push ──────────────────────────────────────────────────────────────────
</file>

<file path="yuyu-map.test.cjs">
// @vitest-environment node
// globals: true — vi, describe, it, expect, beforeEach, afterEach injected by vitest
⋮----
// Lazy-load once at module level for pure-function tests
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// tryRepomix — uses dependency injection: tryRepomix(_spawnSync?)
// ─────────────────────────────────────────────────────────────────────────────
⋮----
const ghostFile   = path.join(tmpDir, '.yuyu', 'ghost-repomix.md'); // never written
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// extractSymbols
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// hook pattern now comes before fn pattern — useXxx is correctly classified as 'hook'
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// compressSource
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// extractImports
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// regex: (?:import|require)\s+ — requires whitespace after keyword
// require('fs') with no space is NOT matched — documented behavior
const src = "const x = require ('fs');"; // space before ( — matches
⋮----
// No space after require — regex \s+ does not match
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// walkFiles
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// computeSalience
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// generateMap
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// generateCompressed
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// generateLlmsTxt
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// ensureHandoffTemplate
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// Just ensure the function signature is backwards-compatible
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// main() — integration tests in tmp dir
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// Fast mock: repomix "offline" — returns error immediately, no 90s timeout
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// getChangedFiles — incremental map update
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// extractSymbols — property-based (inline runner)
// ─────────────────────────────────────────────────────────────────────────────
⋮----
// Inline minimal runner — zero deps
function repeat(n, fn)
const randStr = (len = 20) => Array.from(
⋮----
// ─────────────────────────────────────────────────────────────────────────────
// compressSource — property-based
// ─────────────────────────────────────────────────────────────────────────────
</file>

<file path="yuyu-server.js">
// yuyu-server.js — v5
// Run dari ~: node ~/yuyu-server.js &
// Flags: --verbose (log every request)
⋮----
// ── Simple read cache — TTL 10s ──────────────────────────────────────────────
// Prevents duplicate reads of same file in same agent loop iteration.
const _readCache = new Map(); // path → { data, meta, ts }
const READ_CACHE_TTL = 10_000; // 10 seconds
⋮----
function getCached(path)
function setCache(path, data, meta)
⋮----
// Limit cache size to 50 entries
⋮----
// ── Simple in-memory rate limiter ─────────────────────────────────────────────
// Prevents runaway agent loops from hammering the server.
// Default: 120 requests/minute per IP (generous for normal use).
const RATE_LIMIT    = 120;   // max requests per window
const RATE_WINDOW   = 60_000; // 1 minute
const _rateCounts   = new Map(); // ip → { count, windowStart }
⋮----
function checkRateLimit(ip)
⋮----
// ── MCP TOOL REGISTRY ─────────────────────────────────────────────────────────
⋮----
// ── HELPERS ────────────────────────────────────────────────────────────────────
function resolvePath(filePath)
⋮----
// Shell-safe escaping untuk string yang diinterpolasi ke command.
// Escape: null bytes, backslash, double quote, backtick, $() substitution.
function shellEsc(str)
⋮----
// Whitelist type yang diizinkan — cegah remote property injection
⋮----
function execSafe(command, cwd, timeoutMs = 60000)
⋮----
// ── PATCH ─────────────────────────────────────────────────────────────────────
// find-and-replace dengan fallback whitespace normalization
function applyPatch(filePath, oldStr, newStr)
⋮----
// Exact match
⋮----
// Whitespace-normalized fallback
const normalize = s
⋮----
// Trim-lines fallback (untuk trailing space)
const trimLines  = s
⋮----
// Not found: return context around closest match for debugging
⋮----
// ── DIRECTORY TREE ────────────────────────────────────────────────────────────
function buildTree(dirPath, depth, maxDepth, prefix)
⋮----
// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
function handle(payload)
⋮----
// Validate type against whitelist — prevent remote property injection
⋮----
// ── BATCH — run multiple actions in one request ────────────────────────────
// { type: 'batch', actions: [{type,path,...}, ...] }
// Returns: { ok: true, results: [{ok, data}, ...] }
⋮----
// ── CODEBASE INDEX — real-time symbol extraction ──────────────────────────
// Returns function/component/hook signatures for entire src/ directory.
// No body, just signatures — low token cost, high signal.
⋮----
function walkSync(dir)
⋮----
function extractSigs(src, _filePath)
⋮----
// export function / async function
⋮----
// export const = arrow
⋮----
// function Component / function useHook
⋮----
// Format as compact markdown
⋮----
// ── FILE OPS ──
⋮----
// Use cache for full reads (no from/to) — saves disk I/O in agent loops
⋮----
// ── BATCH READ ──
⋮----
_readCache.delete(full); // invalidate cache
⋮----
// ── PATCH — CRITICAL FIX ──
⋮----
// ── MOVE / RENAME ──
⋮----
// ── MKDIR ──
⋮----
// ── TREE ──
⋮----
// ── SEARCH (ripgrep → grep fallback) ──
⋮----
// try rg first (faster, respects .gitignore)
⋮----
// grep fallback
⋮----
// lgtm[js/command-line-injection] — intentional: yuyu-server is a local-only
// coding assistant that executes commands on behalf of the authenticated user.
// Server binds to 127.0.0.1 only — not accessible from external network.
⋮----
return execSafe(command, cwd); // nosemgrep: dangerous-exec
⋮----
// ── MCP HANDLER ───────────────────────────────────────────────────────────────
function handleMCP(tool, action, params)
⋮----
// ── HTTP SERVER ───────────────────────────────────────────────────────────────
⋮----
// Rate limit — only applies to POST (action requests)
⋮----
// ── WEBSOCKET SERVER (port 8766) ──────────────────────────────────────────────
// Dipakai untuk: (1) file watcher, (2) streaming exec (live terminal)
⋮----
// Map: watcherId → fs.watch instance
const _watchers  = new Map(); // reserved for future use
// Map: execId → child process
⋮----
// Map: roomId → { version, updates, clients }
⋮----
// ── File Watcher ──
⋮----
// ── Streaming Exec ──
⋮----
// ── Kill Exec ──
⋮----
// ── Realtime Collab ──
⋮----
// Send current version to new client
⋮----
// Send current updates so client can rebase
⋮----
// Broadcast to all other clients in room
⋮----
// Leave collab room
⋮----
// Kill all exec procs for this client
⋮----
// ── ERROR GUARDS ──────────────────────────────────────────────────────────────
</file>

<file path="NEXT_SESSION_PLAN.md">
# YuyuCode — Flagship Plan
> Dibuat: 2026-03-21 | **Update terakhir: 2026-03-21 (post v4.1)**
> Pesan dari owner: "Berat, Lama, Susah Bukan Hambatan. All in selama sesuai ekspektasi."
> Riset: Cursor, Claude Code, Windsurf, Copilot, Devin 2026 — ambil yang terbaik, beat yang bisa dibeat.

---

## 🏆 VISI — "The Phone That Codes Like a Senior Engineer"

> **Autonomous. Context-aware. Self-improving. Runs entirely on a $130 phone.**

Benchmark: feature-parity dengan Cursor Pro ($20/month) — tapi gratis, offline-capable, dan dari HP.

---

## ✅ SUDAH SELESAI

### v4.0
- Bug #1–5 di useAgentLoop.js + handoff.md ✅
- **1.1 Visual Diff Review** — DiffReviewCard, diff preview merah/hijau, pause loop, toggle /config ✅
- **1.2 Multi-Level Ghost Text** — L1 300ms + L2 900ms, Tab/Tab+Tab accept ✅
- **1.3 YUYU.md** — auto-load, inject system prompt, /rules command, template default ✅

### v4.1
- **1.1 Reject feedback loop** — reject → feedback ke AI + auto-resume setelah approve ✅
- **2.5 /review --all** — batch review semua changed files vs HEAD, severity report ✅
- **2.6 Contextual slash suggestions** — fuzzy match + context boost dari isi chat ✅

---

## 🔴 TIER 1 — Game Changers

### 1.4 Parallel Agent Swarm v2 — "Background VM-style" 🔲
**Gap vs Cursor:** Cursor jalankan background agents di isolated VM. YuyuCode /bg masih single-instance.

**Yang sudah ada:** `runBackgroundAgent()` di features.js, git worktree, /bgstatus, /bgmerge.

**Yang perlu:**
- `/bg task1 && /bg task2` → max 3 agents paralel di worktrees berbeda
- Progress dashboard: semua agents sekaligus (running/done/stuck/error)
- Rate limit aware queue: throttle → antri, jalan satu per satu
- `/bgkill all` → abort semua sekaligus
- Auto-merge: selesai → show diff, 1 tap merge

**File:** `src/features.js`, `src/hooks/useSlashCommands.js`, `src/components/panels.agent.jsx`

---

## 🟠 TIER 2 — Significant Upgrades

### 2.1 Click-to-Edit di Live Preview 🔲
- Klik elemen di iframe → popup "edit ini?" → agent patch CSS/JSX langsung
- Inspector mode: hover → tampilkan component name + file path
**File:** `src/components/LivePreview.jsx`

### 2.2 Auto Test Generation — post-write hook 🔲
**Yang sudah ada:** `/test` command.
**Yang belum:**
- Setelah agent tulis function baru → auto-suggest "Mau generate tests?"
- Coverage badge di header dari vitest --coverage
- Failed test → 1 tap agent auto-fix
**File:** `src/hooks/useAgentLoop.js`

### 2.3 Smart Context Compression v2 🔲
**Gap:** /compact sekarang lossy recursive summary.
- Semantic chunking: extract `[FILE_EDIT]`, `[ERROR_FIX]`, `[ARCH_DECISION]`
- Discard: verbose explanations, duplicate reads
- Size indicator: "47K → 12K, 94% signal"
**File:** `src/hooks/useAgentLoop.js` (compactContext), `src/hooks/useSlashCommands.js`

### 2.4 Dependency Graph Visual 🔲
**Yang sudah ada:** /deps tapi output text.
- Interactive force-directed graph (d3.js)
- Tap node → jump to file, circular dep → merah
**File:** `src/components/panels.git.jsx`

---

## 🟡 TIER 3 — Premium Polish

### 3.1 Voice-First Agent Mode 🔲
**Yang sudah ada:** PTT button, TTS.
- Wake word "Hey Yuyu" → Web Speech API continuous
- PTT → langsung trigger agent loop
**File:** `src/components/VoiceBtn.jsx`

### 3.2 Snippet Library dengan AI 🔲
**Yang sudah ada:** SnippetLibrary panel di panels.tools.jsx.
- /snippet save/use dengan AI adapt ke context
**File:** `src/components/panels.tools.jsx`, `src/hooks/useSlashCommands.js`

### 3.3 Commit Message AI — /commit command 🔲
- /commit → analyze changed files → generate semantic commit → push
- Breaking change detection, scope otomatis
**File:** `src/hooks/useSlashCommands.js`, `src/hooks/useDevTools.js`

### 3.4 Error Lens — Inline error display 🔲
**Yang sudah ada:** gutter marker lint (yc_lint).
- Error message tampil inline di baris (bukan hanya dot)
- Periodic ESLint via yuyu-server → inject ke CM diagnostics
- 1 tap → agent auto-fix
**File:** `src/components/FileEditor.jsx`

### 3.5 Multi-cursor AI Edit 🔲
**Yang sudah ada:** multi-cursor Ctrl+D.
- Select multiple → "AI: rename all?" context menu
- Region select → "AI: refactor this block"
**File:** `src/components/FileEditor.jsx`

### 3.6 Keyboard Shortcut Row Customizable 🔲
**Yang sudah ada:** KeyboardRow.jsx fixed symbols.
- Drag-reorder, add custom symbols, per-project save ke YUYU.md
**File:** `src/components/KeyboardRow.jsx`, `src/components/panels.tools.jsx`

---

## 🔵 TIER 4 — Ambitious / Experimental

### 4.1 Self-Healing App — Runtime Error Recovery 🔲
- xterm.js output → intercept runtime errors → auto-trigger agent fix
- "Auto-fix mode" toggle
**File:** `src/components/Terminal.jsx`, `src/hooks/useAgentLoop.js`

### 4.2 Codebase Q&A — /ask upgrade 🔲
**Yang sudah ada:** /ask untuk one-shot model override.
- /ask "bagaimana flow auth?" → agent trace + explain (bukan hanya grep)
- Kimi K2 262K context → bisa hold full codebase
**File:** `src/hooks/useSlashCommands.js`

### 4.3 Automated Changelog Generation 🔲
- /changelog → HEAD vs last release tag → grouped changelog
- Auto-update README
**File:** `src/hooks/useSlashCommands.js`

### 4.4 Live Performance Profiler 🔲
- PerformanceObserver di live preview srcdoc
- Render time, JS time, memory — flag komponen lambat
**File:** `src/components/LivePreview.jsx`

### 4.5 AI-Powered Merge Conflict Resolution 🔲
**Yang sudah ada:** MergeConflictPanel manual.
- Auto-resolve whitespace/rename conflicts
- Complex → "AI merge" per-conflict block
**File:** `src/components/panels.git.jsx`

---

## 📋 CONTEXT UNTUK SESI BERIKUTNYA

### State saat ini v4.1:
- Version: 4.1.0
- Tests: 546 ✅
- Slash commands: ~68
- Done: YUYU.md, Visual Diff Review, Ghost Text L1+L2, reject feedback, /review --all, contextual slash

### Urutan wajib sesi berikutnya (tidak ada yang dilewat):
```
1.  1.4  Parallel Agent Swarm v2
2.  2.2  Auto test generation post-write hook
3.  2.3  Smart context compression v2
4.  2.1  Click-to-edit live preview
5.  2.4  Dependency graph visual
6.  3.4  Error Lens inline
7.  3.3  Commit Message AI /commit
8.  3.2  Snippet Library upgrade
9.  3.5  Multi-cursor AI edit
10. 3.6  Keyboard Row customizable
11. 3.1  Voice-First Agent Mode
12. 4.2  Codebase Q&A /ask upgrade
13. 4.3  Changelog generation
14. 4.1  Self-Healing Runtime
15. 4.4  Live Performance Profiler
16. 4.5  AI Merge Conflict Resolution
```

### Hot files — baca dulu sebelum mulai:
- `src/hooks/useAgentLoop.js`
- `src/hooks/useSlashCommands.js`
- `src/features.js`
- `src/components/FileEditor.jsx`

### Release command:
```bash
npm run lint && npx vitest run
node yugit.cjs "release: vX.X — deskripsi"
```

### Reminder zip:
Kirim **hanya file yang disentuh** — cek `git diff --name-only HEAD`.

---

> "Berat, Lama, Susah Bukan Hambatan."
> Tidak ada fitur yang dilewat. Satu per satu sampai selesai. 🚀
</file>

<file path="src/App.jsx">
export default function App()
⋮----
// ── STORES ──
⋮----
// ── Dynamic brightness filter — perceptual compensation ──────────────────
// Humans perceive brightness logarithmically (Weber-Fechner law).
// No filter above 25% brightness — normal usage range stays untouched.
// Below 25%: gentle linear boost max 1.4x + slight desaturation to
// counteract warm/orange shift (CSS brightness() boosts all RGB equally).
⋮----
const t      = 1 - (b / 0.25);           // 0 at 25%, 1 at 0%
const boost  = 1 + t * 0.40;             // 1.0x → 1.4x max
const desat  = 1 - t * 0.18;             // desaturate to prevent warm shift
⋮----
// ── REFS ──
⋮----
// ── HOOKS ──
⋮----
saveCheckpoint: ()
⋮----
// ── EFFECTS ──
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, [project.batteryLevel, project.batteryCharging]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
const on=()
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
}, []); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
useEffect(() => { chat.persistMessages(chat.messages); }, [chat.messages]); // eslint-disable-line react-hooks/exhaustive-deps
useEffect(() => { if(project.folder) project.loadFolderPrefs(project.folder); }, [project.folder]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
function connect()
⋮----
ws.onopen = () => ws.send(JSON.stringify(
ws.onmessage = async (e) =>
ws.onerror = () =>
ws.onclose = () =>
⋮----
}, [project.fileWatcherActive, project.folder]); // eslint-disable-line react-hooks/exhaustive-deps
⋮----
// ── HELPERS ──
function saveFolder(f)
function undoLastEdit()
function saveCheckpoint()
function restoreCheckpoint(cp)
function onSidebarDragStart(e)
⋮----
function onMove(ev)
function onEnd()
⋮----
// ── RENDER ──
⋮----
{/* Brightness screen overlay — mix-blend-mode:screen, no banding */}
⋮----
{/* Badge toast */}
</file>

<file path="README.md">
<div align="center">

<img src="public/yuyu-icon.png" width="96" alt="YuyuCode icon" />

# YuyuCode

### A full agentic coding assistant.
### Built entirely on an Android phone.

<br/>

[![Build APK](https://github.com/liveiciee/yuyucode/actions/workflows/build-apk.yml/badge.svg)](https://github.com/liveiciee/yuyucode/actions)
[![Version](https://img.shields.io/badge/version-4.1.0-blue)](#)
[![Tests](https://img.shields.io/badge/tests-546%20passing-brightgreen)](#testing--benchmarks)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Android%20(Termux)-3DDC84?logo=android&logoColor=white)
![Stack](https://img.shields.io/badge/React%2019%20+%20Capacitor%208-20232A?logo=react&logoColor=61DAFB)
![Editor](https://img.shields.io/badge/CodeMirror%206-full%20extension%20suite-orange)

<br/>

> *Every line of code in this repo was written from a phone, in Termux, using Claude AI.*
> *No laptop. No desktop. Ever.*

</div>

---

## Status

> **v4.1.0** — Personal tool. Works on one phone — mine. Not production software. Tested on one device (Oppo A77s, Snapdragon 680, Android 14). No contributions expected, though issues are welcome. Use at your own risk.

---

## What is this?

YuyuCode is a **Claude Code / Cursor-style agentic coding assistant** that runs natively on Android. Not a web app forced into a mobile shell — designed from the ground up for the phone.

It connects to a local Node.js server (`yuyu-server.js`) running in Termux, giving it full filesystem access, shell execution, WebSocket streaming, and MCP support — all from your pocket.

**In one sentence:** You type a task → YuyuCode streams a response, automatically executes file reads/writes/patches, feeds results back into the loop, and keeps going until the task is done. Background agents run in isolated git worktrees so your main branch stays clean the whole time.

---

## Demo

> 📸 *Screenshots and GIF demos coming soon — drop a ⭐ to get notified*

---

## Features that don't exist anywhere else

### 🔆 Perceptual Brightness Compensation
A native Capacitor plugin streams real-time brightness values from `Settings.System.SCREEN_BRIGHTNESS` via `ContentObserver`. Below 25% screen brightness, the UI compensates using **Weber-Fechner perceptual scaling** — humans perceive brightness logarithmically, so linear boosts feel wrong. The compensation applies a gentle `brightness(1.0–1.4×)` + slight desaturation to counteract the warm-orange shift CSS `brightness()` introduces. A frosted overlay (`backdrop-filter: blur`) adds depth at extreme low-light. Zero processing above 25% — no visible effect in normal use.

### 📷 Camera-to-Code
Capture a photo of a whiteboard, a printed error, a diagram — directly from the native Android camera. Routes automatically to a vision-capable model. Zero friction, zero file management.

### 🤖 Background Agents with Git Worktree Isolation
`/bg <task>` spins up an agent in a separate git worktree. Your main branch stays clean while the agent works up to 8 agentic iterations. Live progress tracking, abort anytime, merge when ready.

### 🐝 Agent Swarm Pipeline
`/swarm <task>` runs: **Architect** → **FE Agent + BE Agent** (parallel) → **QA Engineer** → **auto-fix pass**. Multi-agent coordination, single command.

### 📋 YUYU.md — Persistent Project Rules
Drop a `YUYU.md` in your project root — Yuyu reads it every session, before every agent loop. Define coding standards, architecture decisions, forbidden patterns, preferred libraries. `/rules add "..."` to append from chat. `/rules init` to auto-generate one from your codebase.

### 🔍 Visual Diff Review
Toggle **Diff Review** in `/config` — agent pauses before applying any `patch_file` or `write_file`. Each pending change shows a colour-coded diff (green adds, red removes) inline in chat. Accept per-file or all at once. Reject sends the reason back to the agent — it self-corrects and tries again. Approving resumes the loop automatically.

### 🗂️ Multi-Tab Editor
Each tab maintains its own independent CodeMirror `EditorState` — cursor position, scroll, undo history all preserved on switch. Dirty indicator (●) per tab. Like VS Code tabs, on a phone.

### ✏️ Full Mobile Code Editor

CodeMirror 6 with a complete extension suite:

| Feature | Details |
|---|---|
| **Vim mode** | normal/insert/visual, full `hjkl`, `:wq` saves |
| **Emmet** | `div.container>ul>li*3` → HTML via Ctrl+E |
| **AI Ghost Text L1+L2** | L1: next line 300ms (Tab) · L2: 2–3 lines 900ms (Tab+Tab), distinct colour |
| **Minimap** | 64px canvas overview, semantic colors, click to jump |
| **Inline Lint** | Syntax error gutter markers (JSON + JS) |
| **Code Folding** | Fold all / unfold all |
| **Multi-cursor** | Ctrl+D next occurrence, Ctrl+Shift+L select all |
| **Sticky Scroll** | Scope header stays visible while scrolling into a function |
| **Breadcrumb** | Live scope path — `App > useEffect > callback` — derived from syntax tree |
| **Git Inline Blame** | Per-line gutter: commit hash + author + date via `git blame` |
| **TypeScript LSP** | `@valtown/codemirror-ts` autocomplete + type info on JS/TS |

### ⌨️ Extra Keyboard Row
A row of coding symbols (`{ } [ ] ( ) ; => // : . ! ?` + indent) above the soft keyboard. Inserts at cursor in both CodeMirror and the chat textarea.

### 👁️ Live HTML/CSS/JS Preview
Split view with a live `<iframe srcdoc>` that rebuilds 300ms after any edit. Auto-combines open HTML/CSS/JS tabs. Console output intercepted via `postMessage` and shown inline.

### 🔍 Global Find & Replace
Grep across all project files — grouped by file, expandable, match highlighted. Regex mode, case-sensitive toggle. Replace all: reads, patches, re-searches automatically.

### 📌 Pinned Context Files
`/pin src/api.js` — file always injected into every agent loop. `/unpin` to release.

### 🔍 Chat Search
`/search <query>` — search across full chat history. Click result → scroll to message.

### ⏸ Graceful Stop
⏸ button during agent loop — finishes current iteration cleanly before stopping. Different from ■ hard abort.

### ↩ Global Undo
`/undo` or `/undo 3` — roll back N last file edits made by the agent.

### 🤖 One-shot Model Override
`/ask kimi review this` — query a specific model once without changing the default. Aliases: `kimi`, `llama`, `llama8b`, `qwen`, `scout`, `qwen235`.

### 🤝 Realtime Collaboration
`/collab <room>` connects two devices to the same editing session via WebSocket. OT-based sync using `@codemirror/collab`. No third-party service needed.

### 🧠 Surgical Context Editor
Remove specific sections from any AI message without deleting the whole thing. Code blocks, exec results, text — tap to mark, save. The AI won't see those parts next turn.

### 💭 Live Chain of Thought
`<think>` blocks stream live — collapsible "N langkah berpikir". Brain icon pulses while thinking, collapses with step count when done.

### 💻 xterm.js Terminal
Full terminal emulator: 2000-line scrollback, ANSI escape support. Traffic lights are functional: red = kill process, yellow = clear, green = send output to AI.

### 🔎 Fuse.js Fuzzy File Search
`cmpt` finds `components/`, `astst` finds `useAgentStore`. Full fuzzy match on filename + path.

### 📝 /review --all
`/review --all` reads all files changed vs HEAD (up to 8) and runs a structured PR-level review — missing error handling, security issues, missing tests, performance flags — with severity per finding (🔴 High / 🟡 Medium / 🟢 Low).

---

## Technically interesting things

- **Perceptual brightness compensation** — `ContentObserver` streams brightness changes from native Android. Below 25%, applies Weber-Fechner-scaled `brightness(1.0–1.4×)` + desaturation (-18%) via CSS filter. Frosted `backdrop-filter: blur` overlay for extreme low-light depth. Zero cost above 25%.
- **Per-theme token system** — every component reads colour tokens from the active theme object; zero hardcoded colours in component JSX
- **EditorState swap per tab** — `view.setState()` on tab switch, no remount, cursor and undo history fully preserved
- **Two-level ghost text** — L1: `StateField` + 300ms debounce, Llama 8B, next-line. L2: `ghostL2Field` + 900ms, 2–3 line lookahead, dimmer colour. Tab accepts L1; double-Tab (< 400ms gap) accepts L2 via timestamp delta.
- **Diff review intercept** — `diffReview` ON → agent pre-computes `generateDiff()` on all write/patch actions, marks them `pending`, pushes to chat, `return`s — loop pauses. `useApprovalFlow.handleApprove()` resumes via `sendMsgRef`. Reject sends AI feedback; agent self-corrects without full restart.
- **YUYU.md context injection** — loaded in `gatherProjectContext()` each session, injected into `buildSystemPrompt()` after AGENTS.md. State synced via `project.setYuyuMd()` so mid-session edits take effect next iteration.
- **Inline blame gutter** — custom `GutterMarker` + `gutter()` extension; data from `git blame --abbrev=7` via yuyu-server
- **Breadcrumb from syntax tree** — `syntaxTree(state).resolveInner(pos)` walks AST upward collecting `FunctionDeclaration`, `ClassDeclaration`, etc.
- **Collab via `@codemirror/collab`** — OT-based update sync over yuyu-server WebSocket; `collabRooms` Map tracks version + update log per room
- **Minimap as canvas** — 64px `<canvas>` with `requestAnimationFrame`; colors code semantically (imports=purple, comments=green, strings=yellow)
- **Parallel action execution** — `read_file`, `web_search`, `list_files`, `tree`, `search`, `mkdir` run in parallel; `exec` and `mcp` serial
- **TF-IDF + age decay memory ranking** — memories scored by relevance + recency (14-day linear decay). Mini-RAG pipeline, fully client-side, no vector DB.
- **`protect()` pattern in syntax highlighter** — prevents regex passes from matching inside already-highlighted `<span>` tags
- **3-fallback patch handler** — `patch_file` tries exact match → whitespace-normalized → trim-lines before giving up
- **Myers diff** — `generateDiff()` uses the `diff` library for accurate line tracking; includes line numbers
- **Batch server action** — `{ type: 'batch', actions: [...] }` runs multiple ops in one HTTP request; reduces agent loop roundtrips
- **Incremental codebase map** — `yuyu-map.cjs` runs `git diff --name-only HEAD` before scanning; only changed files re-analyzed
- **Benchmark regression detector** — `yuyu-bench.cjs` stores results in `.yuyu/bench-history.json`; flags 2× regressions vs baseline
- **Property-based test coverage** — `parseActions` and `resolvePath` fuzz-tested with 100 random inputs each; inline fast-check-style runner, zero extra deps
- **Auto version bump** — `yugit.cjs` detects `release: vX.Y` commits, sets `package.json` version, triggers CI APK build. Supports `--no-push`, `--amend`, `--hash` revert, scopes, breaking changes, `--push`, `--squash N`, `--status`.

---

## Testing & Benchmarks

```
546 tests passing. 0 lint warnings. Runs on Termux ARM64.
50 of which are property-based (inline fast-check-style, 100 random inputs each).
```

| File | Type | Tests |
|------|------|-------|
| `api.test.js` | Unit | 5 |
| `api.extended.test.js` | Unit + Retry/Fallback | 15 |
| `utils.test.js` | Unit | 22 |
| `utils.extended.test.js` | Unit — all action types | 42 |
| `utils.integration.test.js` | Integration + Fuzz | 18 |
| `utils.snapshot.test.js` | Snapshot | 7 |
| `features.test.js` | Unit | 29 |
| `features.extended.test.js` | Unit + Edge cases | 48 |
| `features.extra.test.js` | Unit — sessions, skills, plan | 21 |
| `themes.test.js` | Schema validation — all 4 themes | 103 |
| `editor.test.js` | Unit — getLang, isEmmet, isTsLang | 21 |
| `livepreview.test.js` | Unit — buildSrcdoc | 12 |
| `multitab.test.js` | Unit — useFileStore multi-tab | 18 |
| `uistore.test.js` | Unit — useUIStore | 25 |
| `globalfind.test.js` | Unit — grep parser + regex + replace | 18 |
| `yuyu-map.test.cjs` | Unit — map, symbols, compress, handoff, llms.txt | 80 |
| `yuyu-server.test.cjs` | Integration — HTTP, read/write/patch/batch/exec | 30 |

### Benchmarks (Termux ARM64)

```
getLangExt          5.89x  faster than 10 mixed extensions
isEmmetLang         4.46x  faster than 10 mixed
isTsLang            4.77x  faster than 10 mixed
buildSrcdoc         4.59x  faster than html + css + js combined
multi-tab open     37.19x  faster than open 50 tabs sequentially
generateDiff     5815.78x  faster than large diff (500 lines)
extractSymbols    218.21x  faster than large file (10 components, ~500 lines)
compressSource    636.52x  faster than large file (500 lines)
parseActions       84.22x  faster than mixed valid/invalid blocks (agent loop hot path)
```

> The Myers diff number isn't a typo. Small diffs exit the algorithm early — large diffs don't.
>
> Benchmarks run on Oppo A77s (Snapdragon 680, 8GB RAM) via Termux ARM64.
> Not a MacBook. Not a server. A ~$130 phone from 2022.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 5 |
| Mobile | Capacitor 8 |
| Backend | Node.js (yuyu-server.js, local in Termux) |
| Code Editor | CodeMirror 6 + full extension suite |
| Terminal | xterm.js |
| File Search | Fuse.js |
| Diff | diff library (Myers algorithm) |
| Build | GitHub Actions → signed APK |
| ARM64 compat | `@rollup/wasm-node` override |
| AI Providers | Cerebras (default) + Groq (fallback + vision) |

---

## Why Cerebras + Groq instead of Claude?

Both are **free tier** with fast inference. Cerebras runs Qwen 3 235B at remarkable speed. Groq runs Kimi K2 (262K context) as fallback — large enough to hold a full codebase in context. Rate limit on Cerebras → auto-switch to Groq, silently, without interrupting the session.

The irony: this entire project was built *with* Claude AI (via claude.ai), but the app itself runs on open models due to API cost constraints. A tool built by Claude, that doesn't use Claude.

---

## Getting started

You need an Android phone with Termux.

```bash
# Clone
git clone https://github.com/liveiciee/yuyucode
cd yuyucode
npm install

# Start dev server
npm run dev
# Open localhost:5173 in browser
```

> **Note:** `yuyu-server.js` must be running before using the app.

Get free API keys:
- [Cerebras](https://cloud.cerebras.ai) — main AI
- [Groq](https://console.groq.com) — fallback + vision

**Option A — Termux `.bashrc` (recommended):** See full setup template in the Developer Documentation section below.

**Option B — `.env.local`:**
```
VITE_CEREBRAS_API_KEY=your_key
VITE_GROQ_API_KEY=your_key
```

> **Note:** `npm run build` works on ARM64 (Termux) via the `@rollup/wasm-node` override — takes ~1-2 minutes. The signed APK is produced by CI. Do NOT remove that override.

---

## Known limitations

- **Requires `yuyu-server.js` running in Termux at all times.** If Termux gets killed by Android's memory manager, the app stops working.
- **Depends entirely on free-tier AI APIs.** Rate limits are real. Both Cerebras and Groq exhausted mid-task = agent loop stops.
- **Single-developer bus factor.** Core logic is concentrated in a small number of large files — built for speed, not for onboarding strangers.
- **Not tested on other devices.** All development and benchmarking was done on one Oppo A77s.
- **`npm run build` takes ~1-2 minutes on ARM64.** Signed APK requires GitHub Actions.

---

## Project origin

Started as a question: *can Claude Code be replicated on a phone?*

Turned out: yes, mostly. Built patch by patch, from morning to past midnight, using only a phone and an AI chat interface. Core features — streaming, file patching, background agents, multi-tab editor, visual diff review, persistent project memory — all work. The remaining gap is model quality and context window size, not features.

It's not a polished product. It's proof that the constraints were never the hardware.

---

## Acknowledgements

- **[CodeMirror 6](https://codemirror.net/)** by Marijn Haverbeke — the editor that made all of this possible.
- **[Capacitor](https://capacitorjs.com/)** by Ionic — the bridge that turned a web app into a real Android app.
- **[xterm.js](https://xtermjs.org/)** — a terminal emulator that actually works inside a WebView on Android.
- **[Termux](https://termux.dev/)** — the reason any of this was possible in the first place.
- **[Cerebras](https://cloud.cerebras.ai/)** and **[Groq](https://groq.com/)** — for making fast AI inference accessible without a credit card.
- **[Claude](https://claude.ai/)** by Anthropic — every architectural decision, every tricky bug, every refactor in this codebase was worked through in a Claude chat window.
- **`@valtown/codemirror-ts`**, **`@replit/codemirror-vim`**, **`@emmetio/codemirror6-plugin`**, **`@codemirror/collab`**, **`@capgo/capacitor-brightness`** — each one saved weeks of work.

---

<details>
<summary>Developer Documentation (internal / AI context)</summary>

---

## Yang Tidak Boleh Diubah Tanpa Konfirmasi

- `"overrides": { "rollup": "npm:@rollup/wasm-node" }` di `package.json` — ini yang bikin Vite jalan di Termux ARM64. Hapus = build mati.
- Folder `android/` — di-generate Capacitor, edit manual bisa rusak sync.
- `vitest@1` — v4 crash silent di Termux ARM64. Jangan upgrade.
- Jangan override `global.TextDecoder` di test files — infinite recursion di Node 24.
- Keystore encoding: `openssl base64` + `tr -d '\n'`, bukan `base64 -w 0`.

## Workflow Harian

```bash
node ~/yuyu-server.js &
cd ~/yuyucode && npm run dev &

# Apply dari Claude — kirim hanya file yang disentuh (cek: git diff --name-only HEAD):
yuyu-apply yuyu-patch.zip       # zip — unzip + lint + test + rollback otomatis
yuyu-apply --dry-run            # preview dulu
yuyu-cp README.md               # file tunggal

# Selalu setelah apply:
npm run lint        # 0 problems
npx vitest run      # harus 546/546 pass
node yuyu-map.cjs   # update codebase map

# Push
node yugit.cjs "feat: ..."
node yugit.cjs "feat(api): add endpoint"
node yugit.cjs "feat!: overhaul"            # breaking change
node yugit.cjs "fix: typo" --amend
node yugit.cjs "revert: bad" --hash=abc123
node yugit.cjs --push
node yugit.cjs --squash 3
node yugit.cjs --status

# Release — auto bump version + trigger CI APK
node yugit.cjs "release: v4.x — deskripsi"

npm run bench           # benchmark + compare ke history
npm run bench:save      # set/update baseline
```

## Arsitektur

```
src/
├── App.jsx                 # Root — mounts semua stores + hooks, brightness compensation
├── components/
│   ├── AppHeader.jsx       # Header bar (status, model, tools)
│   ├── AppSidebar.jsx      # File tree sidebar
│   ├── AppChat.jsx         # Main area: tabs, chat, editor, terminal, preview
│   ├── AppPanels.jsx       # Semua overlay panels
│   ├── FileEditor.jsx      # CodeMirror 6 — multi-tab, vim, ghost text L1+L2, blame, collab
│   ├── KeyboardRow.jsx     # Extra symbol row above keyboard
│   ├── LivePreview.jsx     # iframe HTML/CSS/JS preview
│   ├── GlobalFindReplace.jsx
│   ├── Terminal.jsx        # xterm.js terminal
│   ├── FileTree.jsx        # Fuse.js fuzzy file tree
│   ├── MsgBubble.jsx       # Chat message renderer + DiffReviewCard
│   ├── SearchBar.jsx
│   ├── ThemeEffects.jsx
│   ├── VoiceBtn.jsx
│   ├── panels.base.jsx     # BottomSheet, CommandPalette
│   ├── panels.git.jsx      # GitCompare, FileHistory, GitBlame, DepGraph, MergeConflict
│   ├── panels.agent.jsx    # Elicitation, Skills, BgAgent
│   └── panels.tools.jsx    # Config, Deploy, MCP, GitHub, Sessions, Permissions, Plugins
├── hooks/
│   ├── useAgentLoop.js     # Core AI loop — stream, parse, execute, diff review intercept
│   ├── useAgentSwarm.js    # Multi-agent swarm pipeline
│   ├── useApprovalFlow.js  # Write approval + reject feedback + atomic rollback + auto-resume
│   ├── useBrightness.js    # Real-time brightness via @capgo/capacitor-brightness
│   ├── useChatStore.js     # Messages, streaming, memories, checkpoints
│   ├── useDevTools.js      # GitHub, deploy, commit msg, tests, browse
│   ├── useFileStore.js     # Multi-tab state
│   ├── useGrowth.js        # XP, streak, badge, learnedStyle
│   ├── useMediaHandlers.js # Camera, image attach, drag & drop
│   ├── useNotifications.js # Push notification, haptic, TTS
│   ├── useProjectStore.js  # Folder, model, effort, permissions, YUYU.md, diffReview
│   ├── useSlashCommands.js # ~68 slash commands
│   └── useUIStore.js       # All UI state + editor feature toggles
├── themes/
│   ├── obsidian.js         # Obsidian Warm (default)
│   ├── aurora.js, ink.js, neon.js, mybrand.js
│   └── index.js
└── plugins/
    └── brightness.js       # Bridge untuk @capgo/capacitor-brightness
```

## Editor Feature Toggles (/config)

| Toggle | Key | Default | Keterangan |
|--------|-----|---------|------------|
| Vim Mode | `yc_vim` | off | hjkl, normal/insert/visual |
| AI Ghost Text | `yc_ghosttext` | off | L1+L2, Tab / Tab+Tab |
| Minimap | `yc_minimap` | off | Canvas scroll overview |
| Inline Lint | `yc_lint` | off | JSON + JS syntax check |
| TypeScript LSP | `yc_tslsp` | off | Autocomplete + types |
| Inline Blame | `yc_blame` | off | git blame per line |
| Multi-cursor | `yc_multicursor` | **on** | Ctrl+D, Ctrl+Shift+L |
| Sticky Scroll | `yc_stickyscroll` | off | Scope header sticky |
| Realtime Collab | `yc_collab` | off | OT sync via WebSocket |
| Diff Review | `yc_diff_review` | off | Pause loop, show diff sebelum apply |

## Cara Kerja Agent Loop

`src/hooks/useAgentLoop.js`. Setiap pesan masuk → loop sampai MAX_ITER:

1. Auto-compact kalau context > 80.000 chars dan pesan > 12
2. `gatherProjectContext` — handoff.md → YUYU.md → map.md → llms.txt → tree → keyword files (paralel)
3. Set `agentStatus` → tampil di UI
4. Kirim ke AI (streaming) — `<think>` blocks tampil live
5. Parse semua `action` blocks
6. Parallel: read/search/list/tree/mkdir — Serial: exec/mcp
7. **diffReview ON** → pre-compute diff, mark `pending`, pause — tunggu user
8. **diffReview OFF** → auto-execute dengan backup
9. Reject → kirim feedback ke AI, loop lanjut. Approve → resume via sendMsgRef.
10. Feed hasil ke AI → lanjut loop

## AI Provider

### Cerebras (default)
| Model | ID |
|-------|-----|
| Qwen 3 235B | `qwen-3-235b-a22b-instruct-2507` |
| Llama 3.1 8B | `llama3.1-8b` |

### Groq (fallback + vision)
| Model | ID | Note |
|-------|-----|------|
| Kimi K2 | `moonshotai/kimi-k2-instruct-0905` | 262K context, fallback utama |
| Llama 3.3 70B | `llama-3.3-70b-versatile` | Serbaguna |
| Llama 4 Scout | `meta-llama/llama-4-scout-17b-16e-instruct` | Vision — auto-route kalau ada gambar |
| Qwen 3 32B | `qwen/qwen3-32b` | Coding |
| Llama 8B Fast | `llama-3.1-8b-instant` | Hemat rate limit |

Auto-fallback: Cerebras 429 → Kimi K2. Vision: Cerebras → Llama 4 Scout. Retry 5xx: 2× backoff 2s/4s.

## YuyuServer v4-async

```bash
node ~/yuyu-server.js &  # dari ~, bukan project folder
```

HTTP :8765 — `ping`, `read`, `read_many`, `write`, `append`, `patch`, `delete`, `move`, `mkdir`, `list`, `tree`, `info`, `search`, `web_search`, `exec`, `browse`, `fetch_json`, `sqlite`, `mcp`, `mcp_list`, `batch`, `index`

REST — `GET /health`, `GET /status`

WebSocket :8766 — `watch`, `exec_stream`, `kill`, `collab_join`, `collab_push`, `collab_updates`

## CI/CD

1. Install deps (cached)
2. `npm run build` → dist/
3. Java 21 + Android SDK 34
4. `cap sync android` + restore icons
5. Auto-bump `versionCode` = GitHub run number
6. `./gradlew assembleRelease`
7. Sign APK
8. GitHub Release hanya kalau commit diawali `release:`
9. Push yang hanya ubah `.md` → skip CI

**Secrets:** `VITE_CEREBRAS_API_KEY`, `VITE_GROQ_API_KEY`, `VITE_TAVILY_API_KEY`, `ANDROID_KEYSTORE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`

## State v4.1

- Version: 4.1.0 · Tests: 546 ✅ · Slash commands: ~68
- Features: YUYU.md, visual diff review + reject feedback, ghost text L1+L2, /review --all, contextual slash suggestions, context bar, graceful stop, chat search, /pin, /undo, /diff, /ask, offline detect, read cache

</details>

---

<div align="center">
  <sub>built on a phone · for a phone · with love 🌸</sub>
</div>
</file>

<file path="package.json">
{
  "name": "yuyucode",
  "private": true,
  "version": "4.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "echo '🔍 Scouring the codebase...' && eslint . && echo '✨ 0 problems found! Code is pure.'",
    "preview": "vite preview",
    "test": "vitest",
    "test:ci": "vitest run --coverage --coverage.provider=v8 --coverage.reporter=lcov --coverage.reporter=text",
    "bench": "node yuyu-bench.cjs",
    "bench:save": "node yuyu-bench.cjs --save",
    "bench:reset": "node yuyu-bench.cjs --reset"
  },
  "dependencies": {
    "@capacitor-community/speech-recognition": "^7.0.1",
    "@capacitor/android": "^8.2.0",
    "@capacitor/camera": "^8.0.1",
    "@capacitor/core": "^8.2.0",
    "@capacitor/filesystem": "^8.1.2",
    "@capacitor/preferences": "^8.0.1",
    "@capgo/capacitor-brightness": "^8.0.7",
    "@codemirror/collab": "^6.1.1",
    "@codemirror/commands": "^6.8.0",
    "@codemirror/lang-css": "^6.2.1",
    "@codemirror/lang-html": "^6.4.9",
    "@codemirror/lang-javascript": "^6.2.5",
    "@codemirror/lang-json": "^6.0.2",
    "@codemirror/lang-markdown": "^6.2.5",
    "@codemirror/lang-python": "^6.2.1",
    "@codemirror/language": "^6.11.0",
    "@codemirror/lint": "^6.8.4",
    "@codemirror/state": "^6.5.2",
    "@codemirror/view": "^6.36.6",
    "@emmetio/codemirror6-plugin": "^0.4.0",
    "@replit/codemirror-vim": "^6.0.0",
    "@valtown/codemirror-ts": "^2.2.0",
    "@xterm/addon-fit": "^0.10.0",
    "@xterm/xterm": "^5.5.0",
    "codemirror": "^6.0.2",
    "d3": "^7.9.0",
    "diff": "^8.0.3",
    "fuse.js": "^7.1.0",
    "lucide-react": "^0.577.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.1",
    "typescript": "^5.8.3"
  },
  "devDependencies": {
    "@capacitor/cli": "^8.2.0",
    "@eslint/js": "^9.39.4",
    "@testing-library/react": "^16.3.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "fast-check": "^3.22.0",
    "globals": "^17.4.0",
    "happy-dom": "^14.0.0",
    "jsdom": "^29.0.0",
    "vite": "^5.4.0",
    "vitest": "^1.6.1",
    "@vitest/coverage-v8": "^1.6.1"
  },
  "overrides": {
    "rollup": "npm:@rollup/wasm-node"
  }
}
</file>

</files>
