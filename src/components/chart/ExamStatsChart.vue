<template>
    <apexchart type="bar" height="300" :options="chartOptions" :series="series" />
  </template>
  
  <script setup>
  import ApexCharts from 'vue3-apexcharts'
  defineExpose({ ApexCharts })
  
  const props = defineProps({
    exams: {
      type: Array,
      required: true
    }
  })
  
  const categories = props.exams.map(e => e.name)
  
  const series = [
    {
      name: '합격자 수',
      data: props.exams.map(e => e.passCount)
    },
    {
      name: '평균 점수',
      data: props.exams.map(e => e.averageScore)
    }
  ]
  
  const chartOptions = {
    chart: {
      type: 'bar',
      stacked: false
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%'
      }
    },
    dataLabels: {
      enabled: true
    },
    xaxis: {
      categories
    },
    yaxis: [
      {
        title: {
          text: '합격자 수'
        }
      },
      {
        opposite: true,
        title: {
          text: '평균 점수'
        }
      }
    ]
  }
  </script>
  