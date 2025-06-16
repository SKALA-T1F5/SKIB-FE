<template>
  <div class="student-analysis-chart">
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 350px;">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="error" class="d-flex justify-center align-center" style="height: 350px;">
      <v-alert type="error" variant="tonal" class="ma-4">
        {{ error }}
      </v-alert>
    </div>
    <div v-else-if="!students.length" class="d-flex justify-center align-center" style="height: 350px;">
      <v-alert type="info" variant="tonal" class="ma-4">
        데이터가 없습니다.
      </v-alert>
    </div>
    <div v-else ref="chartContainer">
      <apexchart
        type="bar"
        height="350"
        :options="chartOptions"
        :series="chartData"
      />
    </div>
    
    <v-table density="compact" class="mt-4 student-table">
      <thead>
        <tr>
          <th>학습자</th>
          <th class="text-right">점수</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(student, index) in students" :key="index">
          <td>{{ student.name }}</td>
          <td class="text-right">
            <v-chip
              size="small"
              :color="getScoreColor(student.score)"
              class="score-chip"
            >
              {{ student.score }}점
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
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
  students: {
    type: Array,
    required: false
  }
});

const loading = ref(false);
const error = ref(null);
const students = ref([]);
const chartContainer = ref(null);

// 임시 데이터
const mockStudents = [
  { name: "김철수", score: 85 },
  { name: "이영희", score: 92 },
  { name: "박지민", score: 78 },
  { name: "최수진", score: 65 },
  { name: "정민호", score: 88 },
  { name: "강다은", score: 72 },
  { name: "윤서연", score: 95 },
  { name: "임재현", score: 68 },
  { name: "한미영", score: 82 },
  { name: "송태호", score: 75 }
];

const fetchData = async () => {
  if (props.students) {
    students.value = props.students;
    return;
  }

  if (!props.examId) {
    students.value = mockStudents;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // 실제 API 연동 시 주석 해제
    // const response = await axios.get(`/api/exam/${props.examId}/students`);
    // students.value = response.data;
    
    // 임시 데이터 사용
    students.value = mockStudents;
  } catch (err) {
    console.error('학생 데이터를 가져오는 중 오류가 발생했습니다:', err);
    error.value = err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

const chartData = computed(() => [{
  name: '점수',
  data: students.value.map(student => student.score)
}]);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
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
  colors: [theme.current.value.colors.primary],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: [theme.current.value.colors.secondary],
      inverseColors: false,
      opacityFrom: 0.8,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: false,
      columnWidth: '55%',
      distributed: false
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val}점`,
    style: {
      fontSize: '12px',
      colors: [theme.current.value.colors.onSurface]
    }
  },
  xaxis: {
    categories: students.value.map(student => student.name),
    labels: {
      style: {
        colors: theme.current.value.colors.onSurface,
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    title: {
      text: '점수',
      style: {
        color: theme.current.value.colors.onSurface
      }
    },
    labels: {
      style: {
        colors: theme.current.value.colors.onSurface
      }
    }
  },
  grid: {
    borderColor: theme.current.value.colors.surfaceVariant,
    strokeDashArray: 4
  },
  tooltip: {
    theme: theme.current.value.dark ? 'dark' : 'light',
    y: {
      formatter: (val) => `${val}점`
    }
  }
}));

// props.students가 변경될 때마다 데이터 업데이트
watch(() => props.students, (newStudents) => {
  if (newStudents) {
    students.value = newStudents;
  }
}, { immediate: true });

// examId가 변경될 때마다 데이터 다시 가져오기
watch(() => props.examId, () => {
  if (!props.students) {
    fetchData();
  }
}, { immediate: true });

onMounted(() => {
  if (!props.students) {
    fetchData();
  }
});

// 점수에 따른 색상 반환 함수
const getScoreColor = (score) => {
  if (score >= 90) return 'success';
  if (score >= 70) return 'primary';
  if (score >= 60) return 'warning';
  return 'error';
};
</script>

<style scoped>
.student-analysis-chart {
  width: 100%;
  min-height: 350px;
  position: relative;
}

.student-table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.student-table th {
  background-color: #f5f5f5;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.student-table td {
  padding: 8px 16px;
}

.student-table tr:hover {
  background-color: #fafafa;
}

.score-chip {
  min-width: 60px;
  justify-content: center;
}

@media (max-width: 600px) {
  .student-analysis-chart {
    min-height: 300px;
  }

  .student-table {
    font-size: 12px;
  }

  .student-table td {
    padding: 4px 8px;
  }

  .score-chip {
    min-width: 50px;
    font-size: 11px;
  }
}
</style> 