import { ElButton } from './elButton'
import { ElCheckbox } from './elCheckbox'
import { ElCheckboxGroup } from './elCheckboxGroup'
import { ElDatePicker } from './elDatePicker'
import { ElInput, defaultProps as ElInputDefaultProps, propertyConfig as ElInputPropertyConfig } from './elInput'
import { ElSelect } from './elSelect'
import { ElSwitch } from './elSwitch'
import { ElTreeSelect } from './elTreeSelect'
import FuniCurd from './funiCurd'
import { FuniDetail } from './funiDetail'
import FuniForm from './funiForm'
import { FuniListPageV2, defaultProps as FuniListPageV2DefaultProps, propertyConfig as FuniListPageV2PropertyConfig } from './funiListPageV2'
import { FuniRegion } from './funiRegion'
// import { FuniRUOC } from './funiRUOC'

const components = [
  {
    name: 'ElButtons',
    component: (
      <ElButton />
    ),
  },
  {
    name: 'ElInput',
    moveable: {
      resizable: true,
      renderDirections: ['e', 'w'],
      keepRatio: false,
    },
    defaultProps: ElInputDefaultProps,
    propertyConfig: ElInputPropertyConfig,
    component: (
      <ElInput
        placeholder="Please input"
        clearable
      />
    ),
  },
  {
    name: 'ElSelect',
    moveable: {
      resizable: true,
      renderDirections: ['e', 'w'],
      keepRatio: false,
    },
    component: (
      <ElSelect
        placeholder="Please select"
        clearable
      />
    ),
  },
  {
    name: 'ElTreeSelect',
    moveable: {
      resizable: true,
      renderDirections: ['e', 'w'],
      keepRatio: false,
    },
    component: (
      <ElTreeSelect
        placeholder="Please select tree"
        clearable
      />
    ),
  },
  {
    name: 'FuniRegion',
    moveable: {
      resizable: true,
      renderDirections: ['e', 'w'],
      keepRatio: false,
    },
    component: (
      <FuniRegion lvl={3} showAddressFull={false} />
    ),
  },
  {
    name: 'ElDatePicker',
    moveable: {
      resizable: true,
      renderDirections: ['e', 'w'],
      keepRatio: false,
    },
    component: (
      <ElDatePicker
        placeholder="Please select date"
        clearable
      />
    ),
  },

  {
    name: 'ElCheckbox',
    component: (
      <ElCheckbox />
    ),
  },
  {
    name: 'ElCheckboxGroup',
    component: (
      <ElCheckboxGroup />
    ),
  },
  {
    name: 'ElSwitch',
    component: (
      <ElSwitch />
    ),
  },
  {
    name: 'FuniCurd',
    moveable: {
      resizable: true,
      renderDirections: ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'],
      keepRatio: true,
    },
    component: (
      <FuniCurd />
    ),
  },
  {
    name: 'FuniForm',
    moveable: {
      resizable: true,
      renderDirections: ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'],
      keepRatio: true,
    },
    component: (
      <FuniForm />
    ),
  },
  {
    name: 'FuniListPageV2',
    moveable: {
      resizable: true,
      renderDirections: ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'],
      keepRatio: true,
    },
    defaultProps: FuniListPageV2DefaultProps,
    hFull: true,
    component: (
      <FuniListPageV2 />
    ),
    propertyConfig: FuniListPageV2PropertyConfig,
  },
  {
    name: 'FuniDetail',
    moveable: {
      resizable: true,
      renderDirections: ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'],
      keepRatio: true,
    },
    hFull: true,
    component: (
      <FuniDetail />
    ),
  },

]
export { components as default }
