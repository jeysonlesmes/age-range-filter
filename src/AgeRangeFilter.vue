<template>
<div id="app">
    <div class="panel-heading" style="padding: 0;">
        <div class="row">
            <b class="col-xs-4"></b>
            <b class="col-xs-4 text-center" v-html="labels.total"></b>
            <b class="col-xs-4 text-center" v-html="labels.foreigners"></b>
        </div>
    </div>
    <input type="hidden" min="1" class="form-control" id="passengers" name="passengers" v-model="countPassengers"/>

    <div class="row" v-for="(ageRange, index) in ageRanges">
        <label class="col-xs-4">{{ ageRange.name }}</label>
        <div class="col-xs-4" :id="`total-passengers-range-${ageRange.tag}`">
            <number-input
              inline
              center
              controls
              :inputtable="false"
              min="0"
              placeholder="0"
              size="large"
              :name="`quantity[${ageRange.tag}][total]`"
              id="quantity-total"
              :type="'total'"
              @change="change"
              :data-name="ageRange.tag"
              :value="ageRange.data.total.value"
              v-model="ageRange.data.total.currentValue"
              :age-range="index"
            >
            </number-input>
        </div>
        <div class="col-xs-4" :id="`total-foreigners-range-${ageRange.tag}`">
            <number-input
              inline
              center
              controls
              :inputtable="false"
              min="0"
              placeholder="0"
              size="large"
              :name="`quantity[${ageRange.tag}][foreigners]`"
              id="quantity-foreigners"
              :type="'foreigners'"
              :max="ageRange.data.foreigners.max"
              :disabled="ageRange.data.foreigners.disabled"
              :data-name="ageRange.tag"
              :value="ageRange.data.foreigners.value"
              v-model="ageRange.data.foreigners.currentValue"
              :age-range="index"
              @change="changeForeigner"
            >
            </number-input>
        </div>
    </div>
</div>
</template>

<script>
export default {
  name: 'AgeRangeFilter',
  props: {},
  data() {
    return {
      labels: {
        title: 'Pasajeros',
        total: 'Total',
        foreigners: 'Extranjeros'
      },
      ageRanges: [],
      filters: [],
      countPassengers: 0,
      params: {
        'age-range': {}
      }
    }
  },
  methods: {
    setup() {
      if (this.$options.labels) {
        const labels = this.copyObject(this.$options.labels)

        this.labels.title = labels.title || this.labels.title
        this.labels.total = labels.total || this.labels.total
        this.labels.foreigners = labels.foreigners || this.labels.foreigners
      }

      if (this.$options.ageRanges) {
        const ageRanges = this.copyObject(this.$options.ageRanges)
        this.ageRanges = ageRanges || this.ageRanges
      }

      if (this.$options.filters) {
        this.filters = this.$options.filters
      }
    },
    copyObject(obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    changeForeigner() {
      this.recalculate()
    },
    change(value, oldValue, action, type, ageRange) {
      if (type == "total") {
        if (typeof value == "number" && value >= 0) {
          if (action == "increase") {
            this.countPassengers++;
          } else if (action == "decrease") {
            this.countPassengers--;
          } else {
            this.countPassengers = this.countPassengers + value
          }
        }

        if (this.ageRanges[ageRange].data.foreigners.currentValue > value) {
          this.ageRanges[ageRange].data.foreigners.currentValue = value;
        }

        this.ageRanges[ageRange].data.foreigners.disabled = !(value > 0);
        this.ageRanges[ageRange].data.foreigners.max = value;

        this.ageRanges[ageRange].data.total.currentValue = value;
      } else {
        this.ageRanges[ageRange].data.foreigners.currentValue = value;
      }

      this.recalculate()
    },
    recalculate() {
      Object.values(this.ageRanges).map(function (ageRange) {
        this.addTotalOnRange(ageRange.data.total.currentValue, 'total', ageRange.tag)
        this.addTotalOnRange(ageRange.data.foreigners.currentValue, 'foreigners', ageRange.tag)
      }.bind(this))

      window.EventBus.$emit('age-ranges-changed', this.countPassengers, this.params['age-range'])

      this.$forceUpdate();
    },
    setData() {
      var filtersAgeRanges = typeof this.filters.ageRanges == "undefined" ? [] : this.filters.ageRanges
      filtersAgeRanges = filtersAgeRanges === null ? [] : filtersAgeRanges

      var $this = this

      this.ageRanges.forEach(function (ageRange, key) {
        var filterAgeRange = typeof filtersAgeRanges[ageRange.tag] == "undefined" ? [] : filtersAgeRanges[ageRange.tag];
        var initialValueForeigners = typeof filterAgeRange['foreigners'] == "undefined" ? 0 : filterAgeRange['foreigners'];
        var initialValueTotal = typeof filterAgeRange['total'] == "undefined" ? 0 : filterAgeRange['total'];

        var data = {
          foreigners: {
            show: true,
            disabled: false,
            max: 2000,
            value: initialValueForeigners,
            currentValue: initialValueForeigners
          },
          total: {
            show: true,
            disabled: false,
            value: initialValueTotal,
            currentValue: initialValueTotal,
            limit: false,
            ranges: false
          }
        }

        $this.ageRanges[key].data = data
      })
    },
    addTotalOnRange(value, key, name) {
      if (typeof this.params['age-range'] == 'undefined') {
        this.params['age-range'] = {}
      }
      if (typeof this.params['age-range'][name] == 'undefined') {
        this.params['age-range'][name] = {};
      }
      if (typeof this.params['age-range'][name][key] == 'undefined') {
        this.params['age-range'][name][key] = '';
      }

      this.params['age-range'][name][key] = value;
    }
  },
  created() {
    this.setup()
    this.setData()

    window.EventBus.$on('reset-age-ranges', function () {
      this.ageRanges.forEach(function (ageRange, key) {
        this.ageRanges[key].data.total.value = this.ageRanges[key].data.total.currentValue = 0;
        this.ageRanges[key].data.foreigners.value = this.ageRanges[key].data.foreigners.currentValue = 0;
      }.bind(this))

      this.countPassengers = 0;

      this.$forceUpdate();

      window.EventBus.$emit('cleared-age-ranges')
    }.bind(this))
  }
}
</script>
