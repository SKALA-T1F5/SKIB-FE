<template>
  <div class="tag-analysis-chart">
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 350px;">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="error" class="d-flex justify-center align-center" style="height: 350px;">
      <v-alert type="error" variant="tonal" class="ma-4">
        {{ error }}
      </v-alert>
    </div>
    <div v-else-if="!tags.length" class="d-flex justify-center align-center" style="height: 350px;">
      <v-alert type="info" variant="tonal" class="ma-4">
        데이터가 없습니다.
      </v-alert>
    </div>
    <div v-else ref="chartContainer" class="d-flex flex-column">
      <apexchart
        type="radialBar"
        height="350"
        :options="chartOptions"
        :series="chartData"
      />
      <div class="tag-legend mt-4">
        <div v-for="(tag, index) in tags" :key="tag.name" class="d-flex align-center mb-2">
          <div class="legend-color mr-2" :style="{ backgroundColor: getTagColor(index) }"></div>
          <span class="text-body-2">{{ tag.name }}</span>
          <v-spacer></v-spacer>
          <span class="text-body-2 font-weight-medium">{{ tag.score }}점</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import axios from 'axios';

const theme = useTheme();

const props = defineProps({
  examId: {
    type: String,
    required: false
  },
  tags: {
    type: Array,
    required: false
  }
});

const loading = ref(false);
const error = ref(null);
const tags = ref([]);
const chartContainer = ref(null);

// 임시 데이터
const mockTags = [
  { name: "보안 기초", score: 85 },
  { name: "네트워크", score: 70 },
  { name: "시스템", score: 65 },
  { name: "암호화", score: 75 },
  { name: "정책", score: 90 }
];

const fetchData = async () => {
  if (props.tags) {
    tags.value = props.tags;
    return;
  }

  if (!props.examId) {
    tags.value = mockTags;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // 실제 API 연동 시 주석 해제
    // const response = await axios.get(`/api/exam/${props.examId}/tags`);
    // tags.value = response.data;
    
    // 임시 데이터 사용
    tags.value = mockTags;
  } catch (err) {
    console.error('태그 데이터를 가져오는 중 오류가 발생했습니다:', err);
    error.value = err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

const chartData = computed(() => tags.value.map(tag => tag.score));

const getTagColor = (index) => {
  const colors = [
    theme.current.value.colors.primary,
    theme.current.value.colors.secondary,
    theme.current.value.colors.success,
    theme.current.value.colors.warning,
    theme.current.value.colors.error
  ];
  return colors[index % colors.length];
};

const chartOptions = computed(() => ({
  chart: {
    type: 'radialBar',
    height: 350,
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      },
      autoSelected: 'zoom'
    }
  },
  colors: tags.value.map((_, index) => getTagColor(index)),
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        margin: 15,
        size: '70%',
        background: theme.current.value.colors.surface,
        image: undefined,
        imageOffsetX: 0,
        imageOffsetY: 0,
        position: 'front',
        dropShadow: {
          enabled: true,
          top: 3,
          left: 0,
          blur: 4,
          opacity: 0.24
        }
      },
      track: {
        background: theme.current.value.colors.surfaceVariant,
        strokeWidth: '67%',
        margin: 0,
        dropShadow: {
          enabled: true,
          top: -3,
          left: 0,
          blur: 4,
          opacity: 0.15
        }
      },
      dataLabels: {
        name: {
          offsetY: -10,
          color: theme.current.value.colors.onSurface,
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: 'Roboto, sans-serif'
        },
        value: {
          color: theme.current.value.colors.onSurface,
          fontSize: '30px',
          fontWeight: 600,
          fontFamily: 'Roboto, sans-serif',
          formatter: (val) => `${val}점`
        }
      }
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      shadeIntensity: 0.5,
      gradientToColors: tags.value.map((_, index) => getTagColor(index)),
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100]
    }
  },
  stroke: {
    lineCap: 'round'
  },
  labels: tags.value.map(tag => tag.name),
  legend: {
    show: false
  },
  tooltip: {
    theme: theme.current.value.dark ? 'dark' : 'light',
    y: {
      formatter: (val) => `${val}점`
    }
  }
}));

// props.tags가 변경될 때마다 데이터 업데이트
watch(() => props.tags, (newTags) => {
  if (newTags) {
    tags.value = newTags;
  }
}, { immediate: true });

// examId가 변경될 때마다 데이터 다시 가져오기
watch(() => props.examId, () => {
  if (!props.tags) {
    fetchData();
  }
}, { immediate: true });

onMounted(() => {
  if (!props.tags) {
    fetchData();
  }
});
</script>

<style scoped>
.tag-analysis-chart {
  width: 100%;
  min-height: 350px;
  position: relative;
}

.tag-legend {
  padding: 0 16px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

@media (max-width: 600px) {
  .tag-analysis-chart {
    min-height: 300px;
  }

  .tag-legend {
    font-size: 12px;
  }
}
</style> 