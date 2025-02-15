<script lang="ts"></script>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue'
import IconFont from '@comp/IconFont/IconFont.vue'
import {
  useWorkspace,
  type WorkspaceConfig
} from '@apps/store/modules/useWorkspace'
import { useCssVar } from '@apps/store/modules/useCssVar'

const { isFocused } = defineProps({
  isFocused: {
    type: Boolean,
    required: true
  }
})
const cssVar = useCssVar()
const workspace = useWorkspace()

const color = computed(() => {
  return isFocused ? cssVar.vars['base-font-1'] : cssVar.vars['base-font-2']
})

const actionBarConfig = reactive<WorkspaceConfig['title-bar']['action-bar']>({
  'left-panel': { show: false },
  'layout-panel': { show: false },
  'right-panel': { show: false }
})

watch(
  () => workspace.workspaceConfig,
  (v) => {
    if (v) {
      actionBarConfig['left-panel'].show =
        v.value['title-bar']?.['action-bar']?.['left-panel']?.show ?? false
      actionBarConfig['layout-panel'].show =
        v.value['title-bar']?.['action-bar']?.['layout-panel']?.show ?? false
      actionBarConfig['right-panel'].show =
        v.value['title-bar']?.['action-bar']?.['right-panel']?.show ?? false
      v.on('title-bar.action-bar', (actionBar) => {
        console.log('actionBar', actionBar)
        actionBarConfig['left-panel'].show =
          actionBar['left-panel']?.show ?? false
        actionBarConfig['layout-panel'].show =
          actionBar['layout-panel']?.show ?? false
        actionBarConfig['right-panel'].show =
          actionBar['right-panel']?.show ?? false
      })
    }
  }
)

const switchPanel = (panel: 'left-panel' | 'layout-panel' | 'right-panel') => {
  workspace.workspaceConfig?.update(
    ('title-bar.action-bar.' + panel) as 'title-bar.action-bar.left-panel',
    {
      show: !actionBarConfig[panel].show
    }
  )
}
</script>

<template>
  <div class="action-bar">
    <ul>
      <li>
        <a v-tooltip="['left', 'bottom']" @click="switchPanel('left-panel')">
          <IconFont
            :name="
              actionBarConfig['left-panel'].show
                ? 'layout-sidebar-left'
                : 'layout-sidebar-left-off'
            "
            :size="16"
            :color
          />
        </a>
      </li>
      <li>
        <a
          v-tooltip="['bottom', 'bottom']"
          @click="switchPanel('layout-panel')"
        >
          <IconFont
            :name="
              actionBarConfig['layout-panel'].show
                ? 'layout-panel'
                : 'layout-panel-off'
            "
            :size="16"
            :color
          />
        </a>
      </li>
      <li>
        <a v-tooltip="['right', 'bottom']" @click="switchPanel('right-panel')">
          <IconFont
            :name="
              actionBarConfig['right-panel'].show
                ? 'layout-sidebar-right'
                : 'layout-sidebar-right-off'
            "
            :size="16"
            :color
          />
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.action-bar {
  justify-content: flex-end;
  flex: 0 0 89px;

  background-color: transparent;

  & ul {
    width: 100%;
    display: flex;
    justify-content: space-around;
    list-style: none;
    padding: 0;
    margin: 0 7px;

    & li {
      width: 24px;
      height: 24px;
      border-radius: 5px;

      -webkit-app-region: no-drag;

      cursor: pointer;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      & a {
        display: block;
        line-height: 24px;
        text-align: center;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
