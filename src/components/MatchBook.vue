<template>
  <div class="p-4 flex flex-col w-full min-w-[1200px]">
    <!-- 顶部控制栏，添加水平滚动 -->
    <div class="flex flex-row space-x-2 h-12 bg-white w-full overflow-x-auto pb-2 sticky top-0 z-10">
      <div class="flex flex-row space-x-2 flex-nowrap items-center">
        <label class="input input-bordered input-sm flex items-center gap-1 min-w-[150px]">
          竞彩返点:
          <input v-model="returnRateChina" type="number" class="grow w-20" step="0.001" @input="handleInputChange" />
        </label>
        <label class="input input-bordered input-sm flex items-center gap-1 min-w-[150px]">
          平台返点:
          <input v-model="returnRateSB" type="number" class="grow w-20" step="0.001" @input="handleInputChange" />
        </label>
        <label class="input input-bordered input-sm flex items-center gap-1 min-w-[180px]">
          竞彩侧总投注额:
          <input v-model="totalBetChina" type="number" class="grow w-20" step="1000" @input="handleInputChange" />
        </label>
        <label class="input input-bordered input-sm flex items-center gap-1 min-w-[150px]">
          美元汇率:
          <input v-model="exchangeRate" type="number" class="grow w-20" step="0.01" @input="handleInputChange" />
        </label>
        <label class="flex items-center gap-1 min-w-[120px]">
          <input type="checkbox" class="toggle toggle-info toggle-sm" v-model="useUSD" @change="handleInputChange"/>
          使用美元
        </label>
        <div class="join flex items-center gap-1 min-w-[150px]">
          <span class="label join-item">星期:</span>
          <select class="select select-bordered select-sm join-item" @change="handleWeekendChange($event.target.value)">
            <option value="all" selected>全部</option>
            <option v-for="(weekend, index) in weekends" :key="index" :value="weekend">{{ weekend }}</option>
          </select>
        </div>
        <button class="btn btn-outline btn-sm min-w-[180px]" @click="resetOddsChange">重置手动修改的赔率</button>
        <button class="btn btn-outline btn-sm min-w-[120px]" @click="reset">重置所有</button>
        <div role="tablist" class="tabs tabs-lifted min-w-[200px]">
          <a
            v-for="(tab, index) in tabs"
            :key="index"
            role="tab"
            :class="['tab', { 'tab-active': activeTab === index }]"
            @click="activeTab = index"
          >
            <b>{{ tab }}</b>
          </a>
        </div>
        
        <label class="flex items-center gap-1 min-w-[150px]">
          刷新：
          <progress class="progress progress-accent w-32" :value="progressValue" max="100"></progress>
        </label>
      </div>
    </div>
    
    <!-- 表格容器，添加水平和垂直滚动 -->
    <div class="overflow-auto w-full mt-2 flex-1 border rounded-lg">  
      <table v-if="activeTab === 0 || activeTab === 1" class="table table-fixed w-full">
        <!-- 固定表头 -->
        <thead class="sticky top-0 bg-white z-10">
          <tr>
            <th class="w-[120px]">赛事编号</th>
            <th class="w-[120px]">赛事</th>
            <th class="w-[120px]">开赛时间</th>
            <th class="w-[120px]">主队 VS 客队</th>
            <th class="w-[120px]">赔率更新时间</th>
            <th class="w-[80px] text-center">GoalLine</th>
            <th class="w-[120px] text-center">
              <label class="btn btn-circle btn-xs swap swap-rotate">
                <input type="checkbox" @click="triggerZeroIgnore" />
                <!-- hamburger icon -->
                <svg 
                  t="1742436974139" 
                  class="swap-off icon" 
                  viewBox="0 0 1024 1024" 
                  version="1.1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  p-id="1012" 
                  width="24" 
                  height="24">
                  <path d="M512 899.5c-213.668 0-387.5-173.832-387.5-387.5S298.332 124.5 512 124.5 899.5 298.332 899.5 512 725.668 899.5 512 899.5z" fill="#4472C4" p-id="1013"></path>
                  <path d="M512 137c-206.776 0-375 168.224-375 375s168.224 375 375 375 375-168.224 375-375-168.224-375-375-375m0-25c220.914 0 400 179.086 400 400S732.914 912 512 912 112 732.914 112 512s179.086-400 400-400z" fill="#4472C4" p-id="1014"></path>
                  <path d="M647.03 472.831C647.03 366.006 609.048 312 533.677 312q-71.217 0-115.727 78.338Q377 462.445 377 561.258c0 48.665 10.089 85.46 31.454 111.573C429.226 698.944 460.086 712 500.442 712c50.445 0 89.021-26.706 115.134-80.712 20.771-42.73 31.454-95.549 31.454-158.457z m-44.51 5.341c0 49.852-8.9 93.175-26.706 131.157-20.178 41.543-45.1 62.315-75.371 62.315-52.226 0-78.338-37.389-78.338-113.353q0-81.9 32.047-144.214c21.365-40.95 46.291-61.721 75.371-61.721 48.664 0 72.996 42.137 72.996 125.816z" fill="#FFFFFF" p-id="1015"></path>
                </svg>
                <!-- close icon -->
                <svg
                  class="swap-on fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 512 512">
                  <polygon
                    points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                </svg>
              </label>
            </th>
            <th class="w-[120px] text-center">
              <label class="btn btn-circle btn-xs swap swap-rotate">
                <input type="checkbox" @click="triggerOneIgnore" />
                <!-- hamburger icon -->
                <svg 
                  t="1742437285758" 
                  class="swap-off icon" 
                  viewBox="0 0 1024 1024" 
                  version="1.1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  p-id="1180" 
                  width="24" 
                  height="24">
                  <path d="M512 899.5c-213.668 0-387.5-173.832-387.5-387.5S298.332 124.5 512 124.5 899.5 298.332 899.5 512 725.668 899.5 512 899.5z" fill="#4472C4" p-id="1181"></path>
                  <path d="M512 137c-206.776 0-375 168.224-375 375s168.224 375 375 375 375-168.224 375-375-168.224-375-375-375m0-25c220.914 0 400 179.086 400 400S732.914 912 512 912 112 732.914 112 512s179.086-400 400-400z" fill="#4472C4" p-id="1182"></path>
                  <path d="M597.681 335.009c0-7.67-2.36-13.569-7.08-17.109a35.115 35.115 0 0 0-20.061-5.9c-3.54 0-6.49 1.77-10.029 4.13-3.54 2.95-6.49 5.31-8.26 7.08a75.758 75.758 0 0 0-11.211 13.569c-3.54 4.72-7.67 9.44-11.209 13.569-11.209 12.979-23.009 27.139-35.988 41.3-13.569 14.749-26.549 27.729-38.938 39.528-1.18 1.18-2.95 2.36-4.13 3.54l-4.72 2.36c-1.77 1.18-3.54 1.77-4.72 2.95l-5.31 3.54c-2.95 2.36-5.31 4.13-7.08 5.9-2.36 2.36-2.95 4.13-2.95 5.9 0 7.08 2.95 12.389 10.03 16.519 5.9 4.72 12.979 6.49 20.059 6.49a31.985 31.985 0 0 0 14.756-3.543c4.13-2.36 8.26-5.9 12.979-10.619 2.95-3.54 6.49-7.67 11.209-12.979l11.8-12.979c2.95-2.95 7.67-7.67 13.569-14.159s12.389-14.159 20.649-23.009c-1.77 9.44-3.54 20.649-4.72 33.628-2.36 12.979-4.13 25.959-5.9 40.118l-4.72 41.888c-1.18 14.159-2.36 27.729-2.95 39.528-1.18 22.419-2.36 44.838-2.95 67.257q-1.77 33.628-1.77 58.407c0 9.44 2.36 16.519 7.67 21.829 5.31 5.9 12.389 8.26 21.829 8.26a43.479 43.479 0 0 0 15.929-3.54c4.72-2.36 7.67-5.31 7.67-8.85 0-1.77-0.59-5.31-0.59-11.209a149.392 149.392 0 0 1-2.36-18.879 116.91 116.91 0 0 1-2.36-21.239 132.008 132.008 0 0 1-1.18-20.649c0-41.3 1.18-82.6 4.72-124.484 3.54-41.3 10.03-82.6 20.649-123.3a106.366 106.366 0 0 1 2.95-11.209l2.36-11.209 1.77-11.209c-0.002-3.547 0.588-7.086 0.588-11.216z" fill="#FFFFFF" p-id="1183"></path>
                </svg>
                <!-- close icon -->
                <svg
                  class="swap-on fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 512 512">
                  <polygon
                    points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                </svg>
              </label>
            </th>
            <th class="w-[120px] text-center">2球</th>
            <th class="w-[120px] text-center">3球</th>
            <th class="w-[120px] text-center">4球</th>
            <th class="w-[120px] text-center">5球</th>
            <th class="w-[120px] text-center">6球</th>
            <th class="w-[120px] text-center">7+球</th>
            <th @click="toggleSort" class="cursor-pointer w-[200px] text-center">
              Payout <span v-if="sortDescending">🔽</span><span v-else>🔼</span>
            </th>
            <th class="w-[100px]">投注分配</th>
          </tr> 
        </thead>
        <tbody v-for="match in matchLst" :key="match.id" class="group">
            <tr class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-gray-300">
              <th rowspan="2" class="w-[100px]">{{ match.matchNumStr }}</th>
              <td rowspan="2" class="w-[120px]">{{ match.leagueAbbName }}</td>
              <td rowspan="2" class="w-[120px]">{{ match.matchDateTime }}</td>
              <td rowspan="2" class="w-[200px]">{{ match.homeTeamName }} VS {{ match.awayTeamName }}</td>
              <td rowspan="2" class="w-[120px]">{{ new Date(match.updateDateTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) }}</td>
              <td class="w-[80px] border-r border-l border-gray-300 text-center">
                大{{ match.goalLine }}
              </td>
              
              <td v-for="(odds, index) in sliceOddsChina(match.ttgOddsChina, match.goalLine, true)" :key="index" class="w-[70px] border-r border-gray-300 text-center">
                <div class="flex w-full flex-col">
                  <div class="card grid place-items-center">{{ (index === 0 && zeroIgnore === true) || (index === 1 && oneIgnore === true) ? 'X' : odds }}</div>
                  <div v-if="match.isVisibleOver" class="divider mt-1 mb-1"></div>
                  <div v-if="match.isVisibleOver" class="card bg-green-300 grid place-items-center">{{ useUSD ? '$' : '¥' }} {{ match.overBetDetail[index] }}</div>
                </div>
              </td>
              <td :colspan="colspanNum(match.goalLine, true)" class="border-r border-gray-300 text-center">
                <div class="flex w-full flex-col">
                  <div v-if="activeTab === 0" class="card grid place-items-center">
                    <div class="flex w-full flex-row justify-center gap-1">
                      <input v-model="match.oddsOver" type="number" class="input input-sm input-bordered max-w-24" step="0.01" @input="handleInputChange1(match)" />
                      <label class="label label-sm label-accent">(1xbet)</label>
                    </div>
                    <label v-if="match.oddsOverCrown" class="label label-sm label-accent">{{ match.oddsOverCrown }} (皇冠)</label>
                  </div>
                  <div v-else class="card grid place-items-center">{{ match.oddsOver }}</div>
                  <div v-if="match.isVisibleOver" class="divider mt-1 mb-1"></div>
                  <div v-if="match.isVisibleOver" class="card bg-green-300 grid place-items-center">{{ useUSD ? '$' : '¥' }} {{ match.overBetDetail[match.overBetDetail.length - 1] }}</div>
                </div>
              </td>
              <td class="w-[100px] border-r border-gray-300 text-center" :class="match.overPrizeRate > 0 ? 'text-green-600' : 'text-red-600'">
                盈利率：{{ match.overPrizeRate }} %<br>
                总投注：{{ useUSD ? '$' : '¥' }}{{ match.overTotalBet }}<br>
                返奖+返点：{{ useUSD ? '$' : '¥' }}{{ match.overPrize }}<br>
                盈利：{{ useUSD ? '$' : '¥' }}{{ match.overProfit }}
              </td>
              <td class="w-[100px]">
                <button class="btn btn-sm btn-circle" @click="match.isVisibleOver = !match.isVisibleOver">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                </button>
              </td>
            </tr>
            
            <tr class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-b border-gray-300">
              <td class="w-[80px] border-r border-l border-gray-300 text-center">
                小{{ match.goalLine }}
              </td>
             
              <td :colspan="colspanNum(match.goalLine, false)" class="border-r border-gray-300 text-center">
                <div class="flex w-full flex-col">
                  <div v-if="activeTab === 0" class="card grid place-items-center">
                    <div class="flex w-full flex-row justify-center gap-1">
                      <input v-model="match.oddsUnder" type="number" class="input input-sm input-bordered max-w-24 " step="0.01" @input="handleInputChange2(match)" />
                      <label class="label label-sm label-accent">(1xbet)</label>
                    </div>
                    <label v-if="match.oddsUnderCrown" class="label label-sm label-accent">{{ match.oddsUnderCrown }} (皇冠)</label>
                  </div>
                  <div v-else class="card grid place-items-center">{{ match.oddsUnder }}</div>
                  <div v-if="match.isVisibleUnder" class="divider mt-1 mb-1"></div>
                  <div v-if="match.isVisibleUnder" class="card bg-green-300 grid place-items-center">¥ {{ match.underBetDetail[match.underBetDetail.length - 1] }}</div>
                </div>
              </td>
              <td v-for="(odds, index) in sliceOddsChina(match.ttgOddsChina, match.goalLine, false)" :key="index" class="w-[70px] border-r border-gray-300 text-center">
                <div class="flex w-full flex-col">
                  <div class="card grid place-items-center">{{ odds }}</div>
                  <div v-if="match.isVisibleUnder" class="divider mt-1 mb-1"></div>
                  <div v-if="match.isVisibleUnder" class="card bg-green-300 grid place-items-center"> {{ useUSD ? '$' : '¥' }} {{ match.underBetDetail[index] }}</div>
                </div>
              </td>
              <td class="w-[100px] border-r border-gray-300 text-center" :class="match.underPrizeRate > 0 ? 'text-green-600' : 'text-red-600'">
                盈利率：{{ match.underPrizeRate }} %<br>
                总投注：{{ useUSD ? '$' : '¥' }}{{ match.underTotalBet }}<br>
                返奖+返点：{{ useUSD ? '$' : '¥' }}{{ match.underPrize }}<br>
                盈利：{{ useUSD ? '$' : '¥' }}{{ match.underProfit }}
              </td>
              <td class="w-[100px]">
                <button class="btn btn-sm btn-circle" @click="match.isVisibleUnder = !match.isVisibleUnder">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                </button>
              </td>
            </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import axios from '../axios';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const tabs = ['大小球', '大小球E'];
const activeTab = ref(0);
const matchLst = ref([]);
const returnRateChina = ref(0.1);
const returnRateSB = ref(0.0);
const totalBetChina = ref(10000);
const exchangeRate = ref(7.3);
const useUSD = ref(false);
const sortDescending = ref(false);
const originalMatchLst = ref([]); //备份原始顺序
const zeroIgnore = ref(false);
const oneIgnore = ref(false);
const weekends = ref([]);
const curWeekend = ref('');

const progressValue = ref(0); // 进度条的值
let interval = null;

watch(activeTab, (newValue, oldValue) => {
  console.log(oldValue, '->', newValue);
  
  sortDescending.value = false;
  zeroIgnore.value = false;
  oneIgnore.value = false;
  curWeekend.value = null;

  allMatch(true);
});

const resetOddsChange = () => {

  allMatch(true);
}

const reset = () => {
  window.location.reload();
}

const allMatch = async (firstEnter) => {
  const previousMatchLst = matchLst.value;
  
  let response = null;
  if(activeTab.value === 0) { //皇冠大小球
    response = await axios.get("/allMatchV3");
  }else if(activeTab.value === 1) { //Matchbook大小球
    response = await axios.get("/matchbookLst");
  }

  // if (activeTab.value === 2){ //胜负平
  //   matchLst.value = response.data.filter(match => match.hadOddsMap);
  //   if(firstEnter) {
  //     matchLst.value.map(match => ({ ...match, isVisible1X2: false }))
  //   } else {
  //     if (previousMatchLst) {
  //       previousMatchLst.forEach(prevMatch => {
  //         const currentMatch = matchLst.value.find(match => match.id === prevMatch.id);
  //         if (currentMatch) {
  //           currentMatch.isVisible1X2 = prevMatch.isVisible1X2;
  //         } else {
  //           currentMatch.isVisible1X2 = false;
  //         }
  //       });
  //     }
  //   }
  //   matchLst.value.forEach(match => {
  //     calculateHighestPayout1X2(match);
  //   });

  //   originalMatchLst.value = [...response.data].filter(match => match.hadOddsMap).map(match => ({ ...match, isVisible1X2: false })); // 在这里备份原始顺序
  //   originalMatchLst.value.forEach(match => {
  //     calculateHighestPayout1X2(match);
  //   });
  // } else 
  if(activeTab.value === 0 || activeTab.value === 1) { //大小球
    matchLst.value = response.data.filter(match => match.goalLine);
    if(firstEnter) {
      matchLst.value.map(match => ({ ...match, isVisibleOver: false, isVisibleUnder:false }))
    } else {
      if (previousMatchLst) {
        previousMatchLst.forEach(prevMatch => {
          const currentMatch = matchLst.value.find(match => match.id === prevMatch.id);
          if (currentMatch) {
            currentMatch.isVisibleOver = prevMatch.isVisibleOver;
            currentMatch.isVisibleUnder = prevMatch.isVisibleUnder;
            if(prevMatch.overChanged) {
              currentMatch.oddsOver = prevMatch.oddsOver;
              currentMatch.overChanged = prevMatch.overChanged;
            }
            if(prevMatch.underChanged) {
              currentMatch.oddsUnder = prevMatch.oddsUnder;
              currentMatch.underChanged = prevMatch.underChanged;
            }
          } else {
            currentMatch.isVisibleOver = false;
            currentMatch.isVisibleUnder = false;
          }
        });
      }
    }
    
    matchLst.value.forEach(match => {
      betDetailTTG(match, true);
      betDetailTTG(match, false);
    });
    originalMatchLst.value = [...response.data].filter(match => match.goalLine).map(match => ({ ...match, isVisibleBig: false }));
    originalMatchLst.value.forEach(match => {
      betDetailTTG(match, true);
      betDetailTTG(match, false);
    });
  }

  weekends.value = [...new Set(matchLst.value.map(match => match.matchNumStr.replace(/\d+/g, '')))];

  if(curWeekend.value !== null) {
    matchLst.value = matchLst.value.filter(match => match.matchNumStr.startsWith(curWeekend.value));
    originalMatchLst.value = originalMatchLst.value.filter(match => match.matchNumStr.startsWith(curWeekend.value));
  }

  if (sortDescending.value) {
    sortDesc();
  }

  startProgress();
};

const handleWeekendChange = (weekend) => {
  
  if(weekend === 'all') {
    console.log('展示全部的');
    curWeekend.value = null;
  } else {
    console.log('展示周几:', weekend);
    curWeekend.value = weekend;
  }
  allMatch(true);
}

const startProgress = () => {
  if (interval) {
    return; // 如果interval已经在执行，不再新setInterval
  }
  progressValue.value = 0;
  interval = setInterval(() => {
    if (progressValue.value < 100) {
      progressValue.value += 1;
    } else if(progressValue.value === 100){
      clearInterval(interval);
      interval = null;
      allMatch(false); // 刷新设备列表
      progressValue.value = 0; // 重置进度条
    }
  }, 600); // 每100毫秒增加1，10秒完成
};


const sliceOddsChina = (oddsChinaArr, goalLine, isBigger) => {
  const integerPart = Math.floor(parseFloat(goalLine));
  if(isBigger) {
    return oddsChinaArr.slice(0, integerPart + 1);
  } else {
    return oddsChinaArr.slice(integerPart + 1);
  }
};

const colspanNum = (goalLine, isBigger) => {
  const integerPart = Math.floor(parseFloat(goalLine));
  if(isBigger) {
    return 7 - integerPart;
  } else {
    return integerPart + 1;
  }
}

const triggerZeroIgnore = () => {
  zeroIgnore.value = !zeroIgnore.value;
  allMatch(false);
};

const triggerOneIgnore = () => {
  oneIgnore.value = !oneIgnore.value;
  allMatch(false);
};

const betDetailTTG = (match, isBigger) => {
  let oddsSB = 0;
  if(isBigger) {
    oddsSB = match.oddsOver;
  } else {
    oddsSB = match.oddsUnder;
  }

  let oddsChinaArr = sliceOddsChina(match.ttgOddsChina, match.goalLine, isBigger);
  if(zeroIgnore.value && isBigger) {
    // 将头部第一个位置值置0
    oddsChinaArr[0] = 0;
  }
  if(oneIgnore.value && isBigger) {
    // 将头部第二个位置值置0
    oddsChinaArr[1] = 0;
  }
  

  // 假定是Matchbook押的选项中奖，计算返奖+返点 = oddsSB * betSB + returnRateSB.value * betSB + returnRateChina.value * [betChina之和]
  // 假定是竞彩押的选项1中奖，计算返奖+返点 = returnRateSB.value * betSB + returnRateChina.value * [betChina之和] + oddsChinaArr[0] * betChinaArr[0];
  // 假定是竞彩押的选项2中奖，计算返奖+返点 = returnRateSB.value * betSB + returnRateChina.value * [betChina之和] + oddsChinaArr[1] * betChinaArr[1];
  // 即：oddsSB * betSB = oddsChinaArr[0] * betChinaArr[0]; betSB可由oddsChinaArr[0] * betChinaArr[0] / oddsSB算出
  // 再有 [betChina之和] = totalBetChina.value；oddsChinaArr[0] * betChinaArr[0] = oddsChinaArr[1] * betChinaArr[1] = oddsChinaArr[i] * betChinaArr[i]; 
  
  // 计算 1 / oddsChinaArr[i] 的和
  const sumOfInverseOdds = oddsChinaArr.reduce((sum, odds) => {
    if (odds === 0) return sum;
    return sum + 1 / odds;
  }, 0);

  const k = totalBetChina.value / sumOfInverseOdds;
  // 计算 betChinaArr
  let betChinaArr = oddsChinaArr.map(odds => odds === 0 ? 0 : (k / odds).toFixed(0));
  // 计算 betSB
  if(sumOfInverseOdds === 0) {
    match.overTotalBet = 0;
    match.overPrize = 0
    match.overPrizeRate = 0;
    match.overBetDetail = betChinaArr;
    match.overProfit = 0;
    return;
  } 
  
  const firstNonZeroIndex = betChinaArr.findIndex(bet => bet !== 0);
  const betSB = (betChinaArr[firstNonZeroIndex] * oddsChinaArr[firstNonZeroIndex] / oddsSB).toFixed(0);

  let totalBet = (betChinaArr.reduce((sum, bet) => sum + parseFloat(bet), 0) + parseFloat(betSB)).toFixed(0);
  if(useUSD.value) {
    totalBet = (totalBet / exchangeRate.value).toFixed(0);
  }
  let prize = (oddsSB * betSB + returnRateSB.value * betSB + returnRateChina.value * totalBetChina.value).toFixed(0);
  if(useUSD.value) {
    prize = (prize / exchangeRate.value).toFixed(0);
  }
  const prizeRate = ((prize - totalBet) / totalBet * 100).toFixed(2);
  betChinaArr.push(betSB);

  if(useUSD.value) {
    betChinaArr = betChinaArr.map(value => (value / exchangeRate.value).toFixed(0));
  }

  if(isBigger) {
    match.overTotalBet = totalBet;
    match.overPrize = prize
    match.overPrizeRate = prizeRate;
    match.overBetDetail = betChinaArr;
    match.overProfit = match.overPrize - match.overTotalBet;
  } else {
    match.underTotalBet = totalBet;
    match.underPrize = prize;
    match.underPrizeRate = prizeRate;
    match.underBetDetail = betChinaArr;
    match.underProfit = match.underPrize - match.underTotalBet;
  }
  
  //console.log('cccccccc', match);
}

// const betDetail1X2 = (match) => {
  
//   const had = match.hadOddsMap;
//     // 获取各个选项的赔率，根据chooseChina选择国内或国外
//     const a = had['胜'].chooseChina ? had['胜'].oddsChina : had['胜'].oddsSB;
//     const b = had['平'].chooseChina ? had['平'].oddsChina : had['平'].oddsSB;
//     const c = had['负'].chooseChina ? had['负'].oddsChina : had['负'].oddsSB;

//     // 判断哪些选项是国内投注
//     const isWinChina = had['胜'].chooseChina;
//     const isDrawChina = had['平'].chooseChina;
//     const isLoseChina = had['负'].chooseChina;

//     // 计算 x0, x1, x2
//     let x0, x1, x2;

//     const betCh = totalBetChina.value;

//     if (isWinChina && isDrawChina) {
//         // 国内押胜和平，x0 + x1 = 10000
//         x0 = (betCh * b) / (a + b);
//         x1 = (betCh * a) / (a + b);
//         x2 = (x0 * a) / c; // 根据 a*x0 = c*x2
//     } else if (isWinChina && isLoseChina) {
//         // 国内押胜和负，x0 + x2 = 10000
//         x0 = (betCh * c) / (a + c);
//         x2 = (betCh * a) / (a + c);
//         x1 = (x0 * a) / b; // 根据 a*x0 = b*x1
//     } else if (isDrawChina && isLoseChina) {
//         // 国内押平和负，x1 + x2 = 10000
//         x1 = (betCh * c) / (b + c);
//         x2 = (betCh * b) / (b + c);
//         x0 = (x1 * b) / a; // 根据 a*x0 = b*x1
//     } else if (isWinChina) {
//         // 国内押胜，x0 = 10000
//         x0 = betCh;
//         x1 = (x0 * a) / b; // 根据 a*x0 = b*x1
//         x2 = (x0 * a) / c; // 根据 a*x0 = c*x2
//     } else if (isDrawChina) {
//         // 国内押平，x1 = 10000
//         x1 = betCh;
//         x0 = (x1 * b) / a; // 根据 a*x0 = b*x1
//         x2 = (x1 * b) / c; // 根据 b*x1 = c*x2
//     } else if (isLoseChina) {
//         // 国内押负，x2 = 10000
//         x2 = betCh;
//         x0 = (x2 * c) / a; // 根据 a*x0 = c*x2
//         x1 = (x2 * c) / b; // 根据 b*x1 = c*x2
//     }

//     // 设置投注金额到对应属性
//     had.胜.betAmount = x0.toFixed(0);
//     had.平.betAmount = x1.toFixed(0);
//     had.负.betAmount = x2.toFixed(0);

//     // 计算总投注金额
//     match.hadTotalBet = (x0 + x1 + x2).toFixed(0);

//     let hadPrize = 0;
    
//     if (isWinChina && isDrawChina) {
//       hadPrize = a * x0 + returnRateChina.value * x0 + returnRateChina.value * x1 + returnRateSB.value * x2;
//     } else if (isWinChina && isLoseChina) {
//       hadPrize = a * x0 + returnRateChina.value * x0 + returnRateSB.value * x1 + returnRateChina.value * x2;
//     } else if (isDrawChina && isLoseChina) {
//       hadPrize = a * x0 + returnRateSB.value * x0 + returnRateChina.value * x1 + returnRateChina.value * x2;
//     } else if (isWinChina) {
//       hadPrize = a * x0 + returnRateChina.value * x0 + returnRateSB.value * x1 + returnRateSB.value * x2;
//     } else if (isDrawChina) {
//       hadPrize = a * x0 + returnRateSB.value * x0 + returnRateChina.value * x1 + returnRateSB.value * x2;
//     } else if (isLoseChina) {
//       hadPrize = a * x0 + returnRateSB.value * x0 + returnRateSB.value * x1 + returnRateChina.value * x2;
//     }
//     match.hadPrize = hadPrize.toFixed(0);
//     match.hadProfit = match.hadPrize - match.hadTotalBet;
//     match.payoutRate1X2 = ((hadPrize - match.hadTotalBet) / match.hadTotalBet * 100).toFixed(2);

// };

// const betDetailGoals = (match) => {
//   const goals = match.ttgOddsMap;
  
//   // 获取各个选项的赔率，根据chooseChina选择国内或国外
//   const a = goals['01'].chooseChina ? goals['01'].oddsChina : goals['01'].oddsSB;
//   const b = goals['23'].chooseChina ? goals['23'].oddsChina : goals['23'].oddsSB;
//   const c = goals['46'].chooseChina ? goals['46'].oddsChina : goals['46'].oddsSB;
//   const d = goals['7+'].chooseChina ? goals['7+'].oddsChina : goals['7+'].oddsSB;

//   // 判断哪些选项是国内投注
//   const is01China = goals['01'].chooseChina;
//   const is23China = goals['23'].chooseChina;
//   const is46China = goals['46'].chooseChina;
//   const is7China = goals['7+'].chooseChina;

//   // 找到第一个 is?China 为 true 的选项
//   let baseKey = null;
//   if (is01China) baseKey = '01';
//   else if (is23China) baseKey = '23';
//   else if (is46China) baseKey = '46';
//   else if (is7China) baseKey = '7+';

//   // 获取基准值和基准赔率
//   let baseOdds;
//   switch (baseKey) {
//     case '01':
//       baseOdds = a;
//       break;
//     case '23':
//       baseOdds = b;
//       break;
//     case '46':
//       baseOdds = c;
//       break;
//     case '7+':
//       baseOdds = d;
//       break;
//   }

//   // 计算分母（仅国内投注的选项）
//   let denominator = 0;
//   if (is01China) denominator += baseOdds / a;
//   if (is23China) denominator += baseOdds / b;
//   if (is46China) denominator += baseOdds / c;
//   if (is7China) denominator += baseOdds / d;

//   // 计算基准值
//   const baseX = totalBetChina.value / denominator;

//   // 计算 x0, x1, x2, x3
//   const x0 = (baseX * baseOdds) / a;
//   const x1 = (baseX * baseOdds) / b;
//   const x2 = (baseX * baseOdds) / c;
//   const x3 = (baseX * baseOdds) / d;

//   goals['01'].betAmount = parseFloat(x0.toFixed(0));
//   goals['23'].betAmount = parseFloat(x1.toFixed(0));
//   goals['46'].betAmount = parseFloat(x2.toFixed(0));
//   goals['7+'].betAmount = parseFloat(x3.toFixed(0));

//   // 计算总投注金额
//   match.goalsTotalBet = parseFloat((x0 + x1 + x2 + x3).toFixed(0));

//   let goalsPrize = a * x0;
    
//   // 计算goalsPrize, 比如只有x0是押的国内，那么返奖=a*x0 + x0*returnRateChina.value + (x1+x2+x3)*returnRateSB.value
//   if(!is01China) {
//     goalsPrize += x0 * returnRateSB.value;
//   } else {
//     goalsPrize += x0 * returnRateChina.value;
//   }
//   if(!is23China) {
//     goalsPrize += x1 * returnRateSB.value;
//   } else {
//     goalsPrize += x1 * returnRateChina.value;
//   }
//   if(!is46China) {
//     goalsPrize += x2 * returnRateSB.value;
//   } else {
//     goalsPrize += x2 * returnRateChina.value;
//   }
//   if(is7China) {
//     goalsPrize += x3 * returnRateSB.value;
//   } else {
//     goalsPrize += x3 * returnRateChina.value;
//   }

//   match.goalsPrize = parseFloat(goalsPrize.toFixed(0));
//   match.goalsProfit = match.goalsPrize - match.goalsTotalBet;
//   match.payoutRateGoals = ((goalsPrize - match.goalsTotalBet) / match.goalsTotalBet * 100).toFixed(2);
  
// };

const handleInputChange = () => {
  if(activeTab.value ===0 || activeTab.value === 1) {
    matchLst.value.forEach(match => {
      betDetailTTG(match, true);
      betDetailTTG(match, false);
    });
  } 
  // else if(activeTab.value === 2) {
  //   matchLst.value.forEach(match => {
  //     calculateHighestPayout1X2(match);
  //   });
  // }
  
};

const handleInputChange1 = (match) => {
  match.overChanged = true;
  handleInputChange();
};

const handleInputChange2 = (match) => {
  match.underChanged = true;
  handleInputChange();
};

// const calculateHighestPayoutGoals = (match) => {
//   // 竞彩赔率换算
//   match.ttgOddsMap['01'].oddsChina = parseFloat(transToCrown(match.ttgOddsChina.slice(0, 2)));
//   match.ttgOddsMap['23'].oddsChina = parseFloat(transToCrown(match.ttgOddsChina.slice(2, 4)));
//   match.ttgOddsMap['46'].oddsChina = parseFloat(transToCrown(match.ttgOddsChina.slice(4, 7)));
//   match.ttgOddsMap['7+'].oddsChina = match.ttgOddsChina[match.ttgOddsChina.length - 1];

//   const keys = ['01', '23', '46', '7+'];
//   let maxPayout = 0;
//   let bestCombination = null;

//   for (let i = 0; i < 16; i++) {
//     if (i === 15 || i === 0) continue; // Skip the all-China case and all-SB case

//     const binary = i.toString(2).padStart(4, '0');
//     const combination = [
//         binary[0] === '1', // 01
//         binary[1] === '1', // 23
//         binary[2] === '1', // 46
//         binary[3] === '1'  // 7+
//     ];

//     let sum = 0;
//     for (let k = 0; k < 4; k++) {
//       const key = keys[k];
//       const useChina = combination[k];
//       const odds = useChina ? (match.ttgOddsMap[key].oddsChina + returnRateChina.value) : (match.ttgOddsMap[key].oddsSB + returnRateSB.value);
//       sum += 1 / odds;
//     }

//     const payoutRate = 1 / sum;

//     if (payoutRate > maxPayout || (payoutRate === maxPayout && !bestCombination)) {
//         maxPayout = payoutRate;
//         bestCombination = combination.slice();
//     }
//   }

//   // Update the ttgOddsMap with the best combination
//   for (let k = 0; k < 4; k++) {
//       const key = keys[k];
//       match.ttgOddsMap[key].chooseChina = bestCombination[k];
//   }

//   betDetailGoals(match);
// };

// const calculateHighestPayout1X2 = (match) => {
    
//     const keys = ['胜', '平', '负'];
//     let maxPayout = 0;
//     let bestCombination = null;

//     for (let i = 0; i < 8; i++) {
//         if (i === 7 || i === 0) continue; // Skip the all-China case and all-SB case

//         const binary = i.toString(2).padStart(3, '0');
//         const combination = [
//             binary[0] === '1', // 胜
//             binary[1] === '1', // 平
//             binary[2] === '1'  // 负
//         ];

//         let sum = 0;
//         for (let k = 0; k < 3; k++) {
//             const key = keys[k];
//             const useChina = combination[k];
//             const odds = useChina ? (match.hadOddsMap[key].oddsChina + returnRateChina.value) : (match.hadOddsMap[key].oddsSB + returnRateSB.value);
//             sum += 1 / odds;
//         }
//         const payoutRate = 1 / sum;

//         if (payoutRate > maxPayout || (payoutRate === maxPayout && !bestCombination)) {
//             maxPayout = payoutRate;
//             bestCombination = combination.slice();
//         }
//     }

//     // Update the hadOddsMap with the best combination
//     for (let k = 0; k < 3; k++) {
//         const key = keys[k];
//         match.hadOddsMap[key].chooseChina = bestCombination[k];
//     }

//     betDetail1X2(match);
// }


function toggleSort() {
  if (sortDescending.value) {
    // 如果已经排序，则恢复原始顺序
    matchLst.value = [...originalMatchLst.value];
  } else {
    sortDesc();
  }
  sortDescending.value = !sortDescending.value;
}

const sortDesc = () => {
  switch (activeTab.value) {
      case 0:
      case 1:
        matchLst.value.sort((a, b) => {
          let maxA = Math.max(parseFloat(a.overPrizeRate), parseFloat(a.underPrizeRate));
          let maxB = Math.max(parseFloat(b.overPrizeRate), parseFloat(b.underPrizeRate));
          return maxB - maxA;
        });
        break;
      case 2:
        matchLst.value.sort((a, b) => parseFloat(b.payoutRate1X2) - parseFloat(a.payoutRate1X2));
        break;
    }

    console.log("排序后", matchLst.value);
};

const checkLogin = () => {
  let token = localStorage.getItem('token');
  if(!token) {
    router.push({ path: '/' })
  }
};

onMounted(() => {
  allMatch(true);
  checkLogin();
});

// 组件销毁时清理定时器
onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});

</script>
