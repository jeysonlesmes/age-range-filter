import AgeRangeFilter from './AgeRangeFilter'

const AgeRangeFilterPlugin = {
  install(Vue, options) {
    Vue.component(AgeRangeFilter.name, {
      ...options,
      ...AgeRangeFilter
    })
  },
}

// User has to install the component by themselves, to allow to pass options
if (typeof window !== 'undefined' && window.Vue) {
  window.AgeRangeFilter = AgeRangeFilterPlugin
}

export default AgeRangeFilterPlugin
