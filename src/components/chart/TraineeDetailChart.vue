<template>
    <div>
      <apexchart type="area" height="300" :options="chartOptions" :series="series" />
    </div>
  </template>
  
  <script setup>
  import ApexCharts from 'vue3-apexcharts'
  defineOptions({
    components: {
      apexchart: ApexCharts
    }
  })
  
  import { computed } from 'vue'
  
  // ✅ props 정의
  const props = defineProps({
    scoreList: {
      type: Array,
      required: true
    },
    targetScore: {
      type: Number,
      required: true
    }
  })
  
  // ✅ 점수 분포 계산: 10점 간격 (0~100 구간 11개)
  const binCounts = computed(() => {
    const bins = Array(11).fill(0)
    props.scoreList.forEach(score => {
      const idx = Math.min(Math.floor(score / 10), 10)
      bins[idx]++
    })
    return bins
  })
  
  const categories = [
    '0~9', '10~19', '20~29', '30~39', '40~49',
    '50~59', '60~69', '70~79', '80~89', '90~99', '100'
  ]
  
  const series = [
    {
      name: '점수 분포',
      data: binCounts.value,
    }
  ]
  
  // ✅ 차트 설정
  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories,
      title: { text: '점수 구간' }
    },
    yaxis: {
      title: { text: '응시생 수' }
    },
    markers: {
      size: 5,
    //   colors: ['#FF9800'],
      discrete: [
        {
          seriesIndex: 0,
          dataPointIndex: Math.min(Math.floor(props.targetScore / 10), 10),
        //   fillColor: '#FF9800',
          strokeColor: '#fff',
          size: 7
        }
      ]
    },
    tooltip: {
      y: {
        formatter: val => `${val}명`
      }
    }
  }
  </script>
  