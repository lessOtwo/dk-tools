<template>
  <div class="p-4 flex flex-col">
    <div class="flex flex-row space-x-10 h-6 sticky mt-0 bg-white z-10">
      <label class="input input-bordered input-sm flex items-center gap-2">
        竞彩返点:
        <input v-model="returnRateChina" type="number" class="grow w-24" step="0.001" @input="handleInputChange" />
      </label>
      <label class="input input-bordered input-sm flex items-center gap-2">
        皇冠返点:
        <input v-model="returnRateSB" type="number" class="grow w-24" step="0.001" @input="handleInputChange" />
      </label>
      <label class="input input-bordered input-sm flex items-center gap-2">
        竞彩侧总投注额:
        <input v-model="totalBetChina" type="number" class="grow w-24" step="1000" @input="handleInputChange" />
      </label>
      <div class="join flex items-center gap-2">
        <span class="label join-item">周几:</span>
        <select class="select select-bordered select-sm join-item" @change="handleWeekendChange($event.target.value)">
          <option value="all" selected>全部</option>
          <option v-for="(weekend, index) in weekends" :key="index" :value="weekend">{{ weekend }}</option>
        </select>
      </div>
      <div role="tablist" class="tabs tabs-lifted">
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
      <label class="flex items-center gap-2">
        刷新：
        <progress class="progress progress-accent w-32" :value="progressValue" max="100"></progress>
      </label>  
    </div>
    
    <!-- 表格容器，确保thead固定，tbody可滚动 -->
    <div class="overflow-auto max-h-[800px] mt-4">  

      <table v-if="activeTab === 0" class="table">
        <!-- head -->
        <thead class="sticky top-0 bg-white z-10">
          <tr>
            <th>赛事编号</th>
            <th>赛事</th>
            <th>开赛时间</th>
            <th>主队 VS 客队</th>
            <th>赔率更新时间</th>
            <th class="text-center">平台</th>
            <th class="text-center">0球</th>
            <th class="text-center">1球</th>
            <th class="text-center">2球</th>
            <th class="text-center">3球</th>
            <th class="text-center">4球</th>
            <th class="text-center">5球</th>
            <th class="text-center">6球</th>
            <th class="text-center">7+球</th>
            <th @click="toggleSort" class="cursor-pointer text-center">
              Payout <span v-if="sortDescending">🔽</span><span v-else>🔼</span>
            </th>
            <th style="width: 5%;">投注分配</th>
          </tr> 
        </thead>
        <tbody v-for="match in matchLst" :key="match.matchNumStr" class="group">
          
          <tr class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-gray-300">
            <th rowspan="3">{{ match.matchNumStr }}</th>
            <td rowspan="3">{{ match.leagueAbbName }}</td>
            <td rowspan="3">{{ match.matchDateTime }}</td>
            <td rowspan="3">{{ match.homeTeamName }} VS {{ match.awayTeamName }}</td>
            <td rowspan="3">{{ new Date(match.updateDateTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) }}</td>
            <td class="border-r border-l border-gray-300  text-center">竞彩</td>
            <td v-for="(odds, index) in match.ttgOddsChina" :key="index" class="border-r border-gray-300 text-center">
              {{ odds }}
            </td>
            <td rowspan="3" class="border-r border-l border-gray-300  text-center" :class="match.payoutRateGoals > 0 ? 'text-green-600' : 'text-red-600'">
                盈利率：{{ match.payoutRateGoals }} %<br>
                总投注：{{ match.goalsTotalBet }}<br>
                返奖+返点：{{ match.goalsPrize }}<br>
                盈利：{{ match.goalsProfit }}
              </td>
            <td rowspan="3">
              <button class="btn btn-sm btn-circle" @click="match.isVisible = !match.isVisible">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              </button>
            </td>
          </tr>

          <tr class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-gray-300">
            <td class="border-r border-l border-gray-300  text-center">竞猜换算</td>
            <td class="border-r border-gray-300 text-center" :class="match.ttgOddsMap['01'].chooseChina ? 'bg-green-100' : ''" :colspan="2">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.ttgOddsMap['01'].oddsChina }}</div>
                <div v-if="match.ttgOddsMap['01'].chooseChina && match.isVisible" class="divider mt-1 mb-1"></div>
                <div v-if="match.ttgOddsMap['01'].chooseChina && match.isVisible" class="card bg-green-300 grid place-items-center">
                  ¥ {{ match.ttgOddsMap['01'].betAmount }}
                </div>
              </div>
            </td>
            <td class="border-r border-gray-300 text-center" :class="match.ttgOddsMap['23'].chooseChina ? 'bg-green-100' : ''" :colspan="2">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.ttgOddsMap['23'].oddsChina }}</div>
                <div v-if="match.ttgOddsMap['23'].chooseChina && match.isVisible" class="divider mt-1 mb-1"></div>
                <div v-if="match.ttgOddsMap['23'].chooseChina && match.isVisible" class="card bg-green-300 grid place-items-center">
                  ¥ {{ match.ttgOddsMap['23'].betAmount }}
                </div>
              </div>
            </td>
            <td class="border-r border-gray-300 text-center" :class="match.ttgOddsMap['46'].chooseChina ? 'bg-green-100' : ''" :colspan="3">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.ttgOddsMap['46'].oddsChina }}</div>
                <div v-if="match.ttgOddsMap['46'].chooseChina && match.isVisible" class="divider mt-1 mb-1"></div>
                <div v-if="match.ttgOddsMap['46'].chooseChina && match.isVisible" class="card bg-green-300 grid place-items-center">
                  ¥ {{ match.ttgOddsMap['46'].betAmount }}
                </div>
              </div>
            </td>
            <td class="border-r border-gray-300 text-center" :class="match.ttgOddsMap['7+'].chooseChina ? 'bg-green-100' : ''">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.ttgOddsMap['7+'].oddsChina }}</div>
                <div v-if="match.ttgOddsMap['7+'].chooseChina && match.isVisible" class="divider mt-1 mb-1"></div>
                <div v-if="match.ttgOddsMap['7+'].chooseChina && match.isVisible" class="card bg-green-300 grid place-items-center">
                  ¥ {{ match.ttgOddsMap['7+'].betAmount }}
                </div>
              </div>
            </td>
          </tr>
          
          <tr class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-gray-300">
            <td class="border-r border-l border-gray-300  text-center">皇冠</td>
            <td class="border-r border-gray-300 text-center" :class="match.ttgOddsMap['01'].chooseChina ? '' : 'bg-green-100'" :colspan="2">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.ttgOddsMap['01'].oddsSB }}</div>
                <div v-if="!match.ttgOddsMap['01'].chooseChina && match.isVisible" class="divider mt-1 mb-1"></div>
                <div v-if="!match.ttgOddsMap['01'].chooseChina && match.isVisible" class="card bg-green-300 grid place-items-center">
                  ¥ {{ match.ttgOddsMap['01'].betAmount }}
                </div>
              </div>
            </td>
            <td class="border-r border-gray-300 text-center" :class="match.ttgOddsMap['23'].chooseChina ? '' : 'bg-green-100'" :colspan="2">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.ttgOddsMap['23'].oddsSB }}</div>
                <div v-if="!match.ttgOddsMap['23'].chooseChina && match.isVisible" class="divider mt-1 mb-1"></div>
                <div v-if="!match.ttgOddsMap['23'].chooseChina && match.isVisible" class="card bg-green-300 grid place-items-center">
                  ¥ {{ match.ttgOddsMap['23'].betAmount }}
                </div>
              </div>
            </td>
            <td class="border-r border-gray-300 text-center" :class="match.ttgOddsMap['46'].chooseChina ? '' : 'bg-green-100'" :colspan="3">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.ttgOddsMap['46'].oddsSB }}</div>
                <div v-if="!match.ttgOddsMap['46'].chooseChina && match.isVisible" class="divider mt-1 mb-1"></div>
                <div v-if="!match.ttgOddsMap['46'].chooseChina && match.isVisible" class="card bg-green-300 grid place-items-center">
                  ¥ {{ match.ttgOddsMap['46'].betAmount }}
                </div>
              </div>
            </td>
            <td class="border-r border-gray-300 text-center" :class="match.ttgOddsMap['7+'].chooseChina ? '' : 'bg-green-100'">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.ttgOddsMap['7+'].oddsSB }}</div>
                <div v-if="!match.ttgOddsMap['7+'].chooseChina && match.isVisible" class="divider mt-1 mb-1"></div>
                <div v-if="!match.ttgOddsMap['7+'].chooseChina && match.isVisible" class="card bg-green-300 grid place-items-center">
                  ¥ {{ match.ttgOddsMap['7+'].betAmount }}
                </div>
              </div>
            </td>
          </tr>
          <tr></tr>
        </tbody>
      </table>

      <table v-if="activeTab === 1" class="table">
        <!-- head -->
        <thead class="sticky top-0 bg-white z-10">
          <tr>
            <th>赛事编号</th>
            <th>赛事</th>
            <th>开赛时间</th>
            <th>主队 VS 客队</th>
            <th>赔率更新时间</th>
            <th class="text-center">GoalLine</th>
            <th class="text-center">
              <label class="btn btn-circle btn-xs swap swap-rotate">
                <input type="checkbox" @click="triggerZeroIgnore" />
                <!-- hamburger icon -->
                <svg 
                  t="1741846306584" 
                  class="swap-off icon" 
                  viewBox="0 0 1024 1024" 
                  version="1.1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  p-id="9363" 
                  width="16" 
                  height="16">
                  <path d="M496.8622 884.1441c-182.4317-2.7197-273.6323-141.568-273.6323-416.5755 2.7197-274.9757 92.5604-416.5601 269.5516-424.7357 176.9595 5.4559 266.8155 147.0403 269.5352 424.7357C759.5981 739.8564 671.102 878.7036 496.8622 884.1441zM488.6866 116.352c-111.6324 8.1756-168.8003 125.2475-171.52 351.2156 0 234.1601 58.5277 349.8721 175.616 347.1524 117.0555 2.7197 175.5996-112.9923 175.5996-347.1524C668.3822 230.7041 608.4782 113.6323 488.6866 116.352z" p-id="9364"></path>
                </svg>
                <!-- close icon -->
                <svg
                  class="swap-on fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 512 512">
                  <polygon
                    points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
                </svg>
              </label>
            </th>
            <th class="text-center">1球</th>
            <th class="text-center">2球</th>
            <th class="text-center">3球</th>
            <th class="text-center">4球</th>
            <th class="text-center">5球</th>
            <th class="text-center">6球</th>
            <th class="text-center">7+球</th>
            <th @click="toggleSort" class="cursor-pointer text-center">
              Payout <span v-if="sortDescending">🔽</span><span v-else>🔼</span>
            </th>
            <th>投注分配</th>
          </tr> 
        </thead>
        <tbody v-for="match in matchLst" :key="match.matchNumStr" class="group">
          
          <tr class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-gray-300">
            <th rowspan="2">{{ match.matchNumStr }}</th>
            <td rowspan="2">{{ match.leagueAbbName }}</td>
            <td rowspan="2">{{ match.matchDateTime }}</td>
            <td rowspan="2">{{ match.homeTeamName }} VS {{ match.awayTeamName }}</td>
            <td rowspan="2">{{ new Date(match.updateDateTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) }}</td>
            <td class="border-r border-l border-gray-300  text-center">
              大{{ match.goalLine }}
            </td>
            
            <td v-for="(odds, index) in sliceOddsChina(match.ttgOddsChina, match.goalLine, true)" :key="index" class="border-r border-gray-300 text-center">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ index === 0 && zeroIgnore === true ? 'X' : odds }}</div>
                <div v-if="match.isVisibleOver" class="divider mt-1 mb-1"></div>
                <div v-if="match.isVisibleOver" class="card bg-green-300 grid place-items-center">¥ {{ match.overBetDetail[index] }}</div>
              </div>
            </td>
            <td :colspan="colspanNum(match.goalLine, true)" class="border-r border-gray-300 text-center">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.oddsOver }} (皇冠)</div>
                <div v-if="match.isVisibleOver" class="divider mt-1 mb-1"></div>
                <div v-if="match.isVisibleOver" class="card bg-green-300 grid place-items-center">¥ {{ match.overBetDetail[match.overBetDetail.length - 1] }}</div>
              </div>
            </td>
            <td class="border-r border-gray-300 text-center" :class="match.overPrizeRate > 0 ? 'text-green-600' : 'text-red-600'">
              盈利率：{{ match.overPrizeRate }} %<br>
              总投注：{{ match.overTotalBet }}<br>
              返奖+返点：{{ match.overPrize }}<br>
              盈利：{{ match.overProfit }}
            </td>
            <td>
              <button class="btn btn-sm btn-circle" @click="match.isVisibleOver = !match.isVisibleOver">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              </button>
            </td>
          </tr>
          
          <tr class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-b border-gray-300">
            <td class="border-r border-l border-gray-300  text-center">
              小{{ match.goalLine }}
            </td>
           
            <td :colspan="colspanNum(match.goalLine, false)" class="border-r border-gray-300 text-center">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ match.oddsUnder }} (皇冠)</div>
                <div v-if="match.isVisibleUnder" class="divider mt-1 mb-1"></div>
                <div v-if="match.isVisibleUnder" class="card bg-green-300 grid place-items-center">¥ {{ match.underBetDetail[match.underBetDetail.length - 1] }}</div>
              </div>
            </td>
            <td v-for="(odds, index) in sliceOddsChina(match.ttgOddsChina, match.goalLine, false)" :key="index" class="border-r border-gray-300 text-center">
              <div class="flex w-full flex-col">
                <div class="card grid place-items-center">{{ odds }}</div>
                <div v-if="match.isVisibleUnder" class="divider mt-1 mb-1"></div>
                <div v-if="match.isVisibleUnder" class="card bg-green-300 grid place-items-center">¥ {{ match.underBetDetail[index] }}</div>
              </div>
            </td>
            <td class="border-r border-gray-300 text-center" :class="match.underPrizeRate > 0 ? 'text-green-600' : 'text-red-600'">
              盈利率：{{ match.underPrizeRate }} %<br>
              总投注：{{ match.underTotalBet }}<br>
              返奖+返点：{{ match.underPrize }}<br>
              盈利：{{ match.underProfit }}
            </td>
            <td>
              <button class="btn btn-sm btn-circle" @click="match.isVisibleUnder = !match.isVisibleUnder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              </button>
            </td>
          </tr>
          <tr>
          </tr>
        </tbody>
      </table>

      <table v-if="activeTab === 2" class="table">
        <!-- head -->
        <thead class="sticky top-0 bg-white z-10">
          <tr>
            <th style="width: 7%;">赛事编号</th>
            <th style="width: 7%;">赛事</th>
            <th style="width: 10%;">开赛时间</th>
            <th style="width: 10%;">主队 VS 客队</th>
            <th style="width: 10%;">赔率更新时间</th>
            <th class="text-center">平台</th>
            <th class="text-center">胜</th>
            <th class="text-center">平</th>
            <th class="text-center">负</th>
            <th @click="toggleSort" class="cursor-pointer text-center">
              Payout <span v-if="sortDescending">🔽</span><span v-else>🔼</span>
            </th>
            <th style="width: 5%;">投注分配</th>
          </tr>
        </thead>
        <tbody v-for="match in matchLst" :key="match.matchNumStr" class="group">
            <tr v-if="match.hadOddsMap" class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-gray-300">
              <th rowspan="2">{{ match.matchNumStr }}</th>
              <td rowspan="2">{{ match.leagueAbbName }}</td>
              <td rowspan="2">{{ match.matchDateTime }}</td>
              <td rowspan="2">{{ match.homeTeamName }} VS {{ match.awayTeamName }}</td>
              <td rowspan="2">{{ new Date(match.updateDateTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) }}</td>
              <td class="border-r border-l border-gray-300  text-center">竞彩</td>
              <!-- <td hidden>{{ betDetail1X2(match) }}</td> -->
              <td :class="match.hadOddsMap['胜'].chooseChina ? 'bg-green-100' : ''" class="border-r border-l border-gray-300 text-center">
                <div class="flex w-full flex-col">
                  <div class="card grid place-items-center">{{ match.hadOddsMap['胜'].oddsChina }}</div>
                  <div v-if="match.hadOddsMap['胜'].chooseChina && match.isVisible1X2" class="divider mt-1 mb-1"></div>
                  <div v-if="match.hadOddsMap['胜'].chooseChina && match.isVisible1X2" class="card bg-green-300 grid place-items-center">
                    ¥ {{ match.hadOddsMap['胜'].betAmount }}
                  </div>
                </div>
              </td>
              <td :class="match.hadOddsMap['平'].chooseChina ? 'bg-green-100' : ''" class="border-r border-l border-gray-300  text-center">
                <div class="flex w-full flex-col">
                  <div class="card grid place-items-center">{{ match.hadOddsMap['平'].oddsChina }}</div>
                  <div v-if="match.hadOddsMap['平'].chooseChina && match.isVisible1X2" class="divider mt-1 mb-1"></div>
                  <div v-if="match.hadOddsMap['平'].chooseChina && match.isVisible1X2" class="card bg-green-300 grid place-items-center">
                    ¥ {{ match.hadOddsMap['平'].betAmount }}
                  </div>
                </div>
              </td>
              <td :class="match.hadOddsMap['负'].chooseChina ? 'bg-green-100' : ''" class="border-r border-l border-gray-300  text-center">
                <div class="flex w-full flex-col">
                  <div class="card grid place-items-center">{{ match.hadOddsMap['负'].oddsChina }}</div>
                  <div v-if="match.hadOddsMap['负'].chooseChina && match.isVisible1X2" class="divider mt-1 mb-1"></div>
                  <div v-if="match.hadOddsMap['负'].chooseChina && match.isVisible1X2" class="card bg-green-300 grid place-items-center">
                    ¥ {{ match.hadOddsMap['负'].betAmount }}
                  </div>
                </div>
              </td>
              <td rowspan="2" class="border-r border-l border-gray-300  text-center" :class="match.payoutRate1X2 > 0 ? 'text-green-600' : 'text-red-600'">
                盈利率：{{ match.payoutRate1X2 }} %<br>
                总投注：{{ match.hadTotalBet }}<br>
                返奖+返点：{{ match.hadPrize }}<br>
                盈利：{{ match.hadProfit }}
              </td>
              <td rowspan="2">
                <button class="btn btn-sm btn-circle" @click="match.isVisible1X2 = !match.isVisible1X2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="size-[1.2em]"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                </button>
              </td>
            </tr>
            <tr v-if="match.hadOddsMap" class="hover:!bg-gray-200 group-hover:bg-gray-200 border-t border-gray-300">
              <td class="border-r border-l border-gray-300  text-center">皇冠</td>
              <td :class="match.hadOddsMap['胜'].chooseChina ? '' : 'bg-green-100'" class="border-r border-l border-gray-300  text-center">
                <div class="flex w-full flex-col">
                  <div class="card grid place-items-center">{{ match.hadOddsMap['胜'].oddsSB }}</div>
                  <div v-if="!match.hadOddsMap['胜'].chooseChina && match.isVisible1X2" class="divider mt-1 mb-1"></div>
                  <div v-if="!match.hadOddsMap['胜'].chooseChina && match.isVisible1X2" class="card bg-green-300 grid place-items-center">
                    ¥ {{ match.hadOddsMap['胜'].betAmount }}
                  </div>
                </div>
              </td>
              <td :class="match.hadOddsMap['平'].chooseChina ? '' : 'bg-green-100'" class="border-r border-l border-gray-300  text-center">
                <div class="flex w-full flex-col">
                  <div class="card grid place-items-center">{{ match.hadOddsMap['平'].oddsSB }}</div>
                  <div v-if="!match.hadOddsMap['平'].chooseChina && match.isVisible1X2" class="divider mt-1 mb-1"></div>
                  <div v-if="!match.hadOddsMap['平'].chooseChina && match.isVisible1X2" class="card bg-green-300 grid place-items-center">
                    ¥ {{ match.hadOddsMap['平'].betAmount }}
                  </div>
                </div>
              </td>
              <td :class="match.hadOddsMap['负'].chooseChina ? '' : 'bg-green-100'" class="border-r border-l border-gray-300  text-center">
                <div class="flex w-full flex-col">
                  <div class="card grid place-items-center">{{ match.hadOddsMap['负'].oddsSB }}</div>
                  <div v-if="!match.hadOddsMap['负'].chooseChina && match.isVisible1X2" class="divider mt-1 mb-1"></div>
                  <div v-if="!match.hadOddsMap['负'].chooseChina && match.isVisible1X2" class="card bg-green-300 grid place-items-center">
                    ¥ {{ match.hadOddsMap['负'].betAmount }}
                  </div>
                </div>
              </td>
            </tr>
            <tr></tr>
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

const tabs = ['进球数', '大小球', '胜负平'];
const activeTab = ref(1);
const matchLst = ref([]);
const returnRateChina = ref(0.135);
const returnRateSB = ref(0.02);
const totalBetChina = ref(10000);
const sortDescending = ref(false);
const originalMatchLst = ref([]); //备份原始顺序
const zeroIgnore = ref(false);
const weekends = ref([]);

const progressValue = ref(0); // 进度条的值
let interval = null;

watch(activeTab, (newValue, oldValue) => {
  console.log(oldValue, '->', newValue);

  sortDescending.value = false;
  zeroIgnore.value = false;

  allMatch(true);
});


const allMatch = async (firstEnter) => {
  const previousMatchLst = matchLst.value;
  
  const response = await axios.get("/allMatchV3");

  if(activeTab.value === 0){ //进球数
    matchLst.value = response.data;
    if(firstEnter) {
      matchLst.value.map(match => ({ ...match, isVisible: false }))
    } else {
      if (previousMatchLst) {
        previousMatchLst.forEach(prevMatch => {
          const currentMatch = matchLst.value.find(match => match.matchNumStr === prevMatch.matchNumStr);
          if (currentMatch) {
            currentMatch.isVisible = prevMatch.isVisible;
          } else {
            currentMatch.isVisible = false;
          }
        });
      }
    }
    matchLst.value.forEach(match => {
      calculateHighestPayoutGoals(match);
    });
    originalMatchLst.value = [...response.data].map(match => ({ ...match, isVisible: false })); // 在这里备份原始顺序
    originalMatchLst.value.forEach(match => {
      calculateHighestPayoutGoals(match);
    });
  } else if (activeTab.value === 2){ //胜负平
    matchLst.value = response.data.filter(match => match.hadOddsMap);
    if(firstEnter) {
      matchLst.value.map(match => ({ ...match, isVisible1X2: false }))
    } else {
      if (previousMatchLst) {
        previousMatchLst.forEach(prevMatch => {
          const currentMatch = matchLst.value.find(match => match.matchNumStr === prevMatch.matchNumStr);
          if (currentMatch) {
            currentMatch.isVisible1X2 = prevMatch.isVisible1X2;
          } else {
            currentMatch.isVisible1X2 = false;
          }
        });
      }
    }
    matchLst.value.forEach(match => {
      calculateHighestPayout1X2(match);
    });

    originalMatchLst.value = [...response.data].filter(match => match.hadOddsMap).map(match => ({ ...match, isVisible1X2: false })); // 在这里备份原始顺序
    originalMatchLst.value.forEach(match => {
      calculateHighestPayout1X2(match);
    });
  } else if(activeTab.value === 1) { //大小球
    matchLst.value = response.data.filter(match => match.goalLine);
    if(firstEnter) {
      matchLst.value.map(match => ({ ...match, isVisibleOver: false, isVisibleUnder:false }))
    } else {
      if (previousMatchLst) {
        previousMatchLst.forEach(prevMatch => {
          const currentMatch = matchLst.value.find(match => match.matchNumStr === prevMatch.matchNumStr);
          if (currentMatch) {
            currentMatch.isVisibleOver = prevMatch.isVisibleOver;
            currentMatch.isVisibleUnder = prevMatch.isVisibleUnder;
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

  if (sortDescending.value) {
    sortDesc();
  }

  startProgress();
};

const handleWeekendChange = (weekend) => {
  
  if(weekend === 'all') {
    console.log('展示全部的');
    allMatch(true);
  } else {
    console.log('展示周几:', weekend);
    matchLst.value = matchLst.value.filter(match => match.matchNumStr.startsWith(weekend));
    originalMatchLst.value = originalMatchLst.value.filter(match => match.matchNumStr.startsWith(weekend));
  }
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

const transToCrown = (oddsArr) => {
  return (1 / (oddsArr.reduce((sum, odds) => sum + (1 / odds), 0))).toFixed(3);
}


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

const betDetailTTG = (match, isBigger) => {
  let oddsSB = 0;
  if(isBigger) {
    oddsSB = match.oddsOver;
  } else {
    oddsSB = match.oddsUnder;
  }

  let oddsChinaArr = sliceOddsChina(match.ttgOddsChina, match.goalLine, isBigger);
  if(zeroIgnore.value && isBigger) {
    oddsChinaArr.shift();
  }
  

  // 假定是皇冠押的选项中奖，计算返奖+返点 = oddsSB * betSB + returnRateSB.value * betSB + returnRateChina.value * [betChina之和]
  // 假定是竞彩押的选项1中奖，计算返奖+返点 = returnRateSB.value * betSB + returnRateChina.value * [betChina之和] + oddsChinaArr[0] * betChinaArr[0];
  // 假定是竞彩押的选项2中奖，计算返奖+返点 = returnRateSB.value * betSB + returnRateChina.value * [betChina之和] + oddsChinaArr[1] * betChinaArr[1];
  // 即：oddsSB * betSB = oddsChinaArr[0] * betChinaArr[0]; betSB可由oddsChinaArr[0] * betChinaArr[0] / oddsSB算出
  // 再有 [betChina之和] = totalBetChina.value；oddsChinaArr[0] * betChinaArr[0] = oddsChinaArr[1] * betChinaArr[1] = oddsChinaArr[i] * betChinaArr[i]; 
  
  // 计算 1 / oddsChinaArr[i] 的和
  const sumOfInverseOdds = oddsChinaArr.reduce((sum, odds) => sum + 1 / odds, 0);
  const k = totalBetChina.value / sumOfInverseOdds;
  // 计算 betChinaArr
  const betChinaArr = oddsChinaArr.map(odds => (k / odds).toFixed(0));
  // 计算 betSB
  const betSB = (betChinaArr[0] * oddsChinaArr[0] / oddsSB).toFixed(0);

  const totalBet = (betChinaArr.reduce((sum, bet) => sum + parseFloat(bet), 0) + parseFloat(betSB)).toFixed(0);
  const prize = (oddsSB * betSB + returnRateSB.value * betSB + returnRateChina.value * totalBetChina.value).toFixed(0);
  const prizeRate = ((prize - totalBet) / totalBet * 100).toFixed(2);
  betChinaArr.push(betSB);

  if(isBigger) {
    if(zeroIgnore.value) {
      betChinaArr.unshift(0);
    }
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

const betDetail1X2 = (match) => {
  
  const had = match.hadOddsMap;
    // 获取各个选项的赔率，根据chooseChina选择国内或国外
    const a = had['胜'].chooseChina ? had['胜'].oddsChina : had['胜'].oddsSB;
    const b = had['平'].chooseChina ? had['平'].oddsChina : had['平'].oddsSB;
    const c = had['负'].chooseChina ? had['负'].oddsChina : had['负'].oddsSB;

    // 判断哪些选项是国内投注
    const isWinChina = had['胜'].chooseChina;
    const isDrawChina = had['平'].chooseChina;
    const isLoseChina = had['负'].chooseChina;

    // 计算 x0, x1, x2
    let x0, x1, x2;

    const betCh = totalBetChina.value;

    if (isWinChina && isDrawChina) {
        // 国内押胜和平，x0 + x1 = 10000
        x0 = (betCh * b) / (a + b);
        x1 = (betCh * a) / (a + b);
        x2 = (x0 * a) / c; // 根据 a*x0 = c*x2
    } else if (isWinChina && isLoseChina) {
        // 国内押胜和负，x0 + x2 = 10000
        x0 = (betCh * c) / (a + c);
        x2 = (betCh * a) / (a + c);
        x1 = (x0 * a) / b; // 根据 a*x0 = b*x1
    } else if (isDrawChina && isLoseChina) {
        // 国内押平和负，x1 + x2 = 10000
        x1 = (betCh * c) / (b + c);
        x2 = (betCh * b) / (b + c);
        x0 = (x1 * b) / a; // 根据 a*x0 = b*x1
    } else if (isWinChina) {
        // 国内押胜，x0 = 10000
        x0 = betCh;
        x1 = (x0 * a) / b; // 根据 a*x0 = b*x1
        x2 = (x0 * a) / c; // 根据 a*x0 = c*x2
    } else if (isDrawChina) {
        // 国内押平，x1 = 10000
        x1 = betCh;
        x0 = (x1 * b) / a; // 根据 a*x0 = b*x1
        x2 = (x1 * b) / c; // 根据 b*x1 = c*x2
    } else if (isLoseChina) {
        // 国内押负，x2 = 10000
        x2 = betCh;
        x0 = (x2 * c) / a; // 根据 a*x0 = c*x2
        x1 = (x2 * c) / b; // 根据 b*x1 = c*x2
    }

    // 设置投注金额到对应属性
    had.胜.betAmount = x0.toFixed(0);
    had.平.betAmount = x1.toFixed(0);
    had.负.betAmount = x2.toFixed(0);

    // 计算总投注金额
    match.hadTotalBet = (x0 + x1 + x2).toFixed(0);

    let hadPrize = 0;
    
    if (isWinChina && isDrawChina) {
      hadPrize = a * x0 + returnRateChina.value * x0 + returnRateChina.value * x1 + returnRateSB.value * x2;
    } else if (isWinChina && isLoseChina) {
      hadPrize = a * x0 + returnRateChina.value * x0 + returnRateSB.value * x1 + returnRateChina.value * x2;
    } else if (isDrawChina && isLoseChina) {
      hadPrize = a * x0 + returnRateSB.value * x0 + returnRateChina.value * x1 + returnRateChina.value * x2;
    } else if (isWinChina) {
      hadPrize = a * x0 + returnRateChina.value * x0 + returnRateSB.value * x1 + returnRateSB.value * x2;
    } else if (isDrawChina) {
      hadPrize = a * x0 + returnRateSB.value * x0 + returnRateChina.value * x1 + returnRateSB.value * x2;
    } else if (isLoseChina) {
      hadPrize = a * x0 + returnRateSB.value * x0 + returnRateSB.value * x1 + returnRateChina.value * x2;
    }
    match.hadPrize = hadPrize.toFixed(0);
    match.hadProfit = match.hadPrize - match.hadTotalBet;
    match.payoutRate1X2 = ((hadPrize - match.hadTotalBet) / match.hadTotalBet * 100).toFixed(2);

};

const betDetailGoals = (match) => {
  const goals = match.ttgOddsMap;
  
  // 获取各个选项的赔率，根据chooseChina选择国内或国外
  const a = goals['01'].chooseChina ? goals['01'].oddsChina : goals['01'].oddsSB;
  const b = goals['23'].chooseChina ? goals['23'].oddsChina : goals['23'].oddsSB;
  const c = goals['46'].chooseChina ? goals['46'].oddsChina : goals['46'].oddsSB;
  const d = goals['7+'].chooseChina ? goals['7+'].oddsChina : goals['7+'].oddsSB;

  // 判断哪些选项是国内投注
  const is01China = goals['01'].chooseChina;
  const is23China = goals['23'].chooseChina;
  const is46China = goals['46'].chooseChina;
  const is7China = goals['7+'].chooseChina;

  // 找到第一个 is?China 为 true 的选项
  let baseKey = null;
  if (is01China) baseKey = '01';
  else if (is23China) baseKey = '23';
  else if (is46China) baseKey = '46';
  else if (is7China) baseKey = '7+';

  // 获取基准值和基准赔率
  let baseOdds;
  switch (baseKey) {
    case '01':
      baseOdds = a;
      break;
    case '23':
      baseOdds = b;
      break;
    case '46':
      baseOdds = c;
      break;
    case '7+':
      baseOdds = d;
      break;
  }

  // 计算分母（仅国内投注的选项）
  let denominator = 0;
  if (is01China) denominator += baseOdds / a;
  if (is23China) denominator += baseOdds / b;
  if (is46China) denominator += baseOdds / c;
  if (is7China) denominator += baseOdds / d;

  // 计算基准值
  const baseX = totalBetChina.value / denominator;

  // 计算 x0, x1, x2, x3
  const x0 = (baseX * baseOdds) / a;
  const x1 = (baseX * baseOdds) / b;
  const x2 = (baseX * baseOdds) / c;
  const x3 = (baseX * baseOdds) / d;

  goals['01'].betAmount = parseFloat(x0.toFixed(0));
  goals['23'].betAmount = parseFloat(x1.toFixed(0));
  goals['46'].betAmount = parseFloat(x2.toFixed(0));
  goals['7+'].betAmount = parseFloat(x3.toFixed(0));

  // 计算总投注金额
  match.goalsTotalBet = parseFloat((x0 + x1 + x2 + x3).toFixed(0));

  let goalsPrize = a * x0;
    
  // 计算goalsPrize, 比如只有x0是押的国内，那么返奖=a*x0 + x0*returnRateChina.value + (x1+x2+x3)*returnRateSB.value
  if(!is01China) {
    goalsPrize += x0 * returnRateSB.value;
  } else {
    goalsPrize += x0 * returnRateChina.value;
  }
  if(!is23China) {
    goalsPrize += x1 * returnRateSB.value;
  } else {
    goalsPrize += x1 * returnRateChina.value;
  }
  if(!is46China) {
    goalsPrize += x2 * returnRateSB.value;
  } else {
    goalsPrize += x2 * returnRateChina.value;
  }
  if(is7China) {
    goalsPrize += x3 * returnRateSB.value;
  } else {
    goalsPrize += x3 * returnRateChina.value;
  }

  match.goalsPrize = parseFloat(goalsPrize.toFixed(0));
  match.goalsProfit = match.goalsPrize - match.goalsTotalBet;
  match.payoutRateGoals = ((goalsPrize - match.goalsTotalBet) / match.goalsTotalBet * 100).toFixed(2);
  
};

const handleInputChange = () => {
  if(activeTab.value === 1) {
    matchLst.value.forEach(match => {
      betDetailTTG(match, true);
      betDetailTTG(match, false);
    });
  } else if(activeTab.value === 2) {
    matchLst.value.forEach(match => {
      calculateHighestPayout1X2(match);
    });
  }
  
};

const calculateHighestPayoutGoals = (match) => {
  // 竞彩赔率换算
  match.ttgOddsMap['01'].oddsChina = parseFloat(transToCrown(match.ttgOddsChina.slice(0, 2)));
  match.ttgOddsMap['23'].oddsChina = parseFloat(transToCrown(match.ttgOddsChina.slice(2, 4)));
  match.ttgOddsMap['46'].oddsChina = parseFloat(transToCrown(match.ttgOddsChina.slice(4, 7)));
  match.ttgOddsMap['7+'].oddsChina = match.ttgOddsChina[match.ttgOddsChina.length - 1];

  const keys = ['01', '23', '46', '7+'];
  let maxPayout = 0;
  let bestCombination = null;

  for (let i = 0; i < 16; i++) {
    if (i === 15 || i === 0) continue; // Skip the all-China case and all-SB case

    const binary = i.toString(2).padStart(4, '0');
    const combination = [
        binary[0] === '1', // 01
        binary[1] === '1', // 23
        binary[2] === '1', // 46
        binary[3] === '1'  // 7+
    ];

    let sum = 0;
    for (let k = 0; k < 4; k++) {
      const key = keys[k];
      const useChina = combination[k];
      const odds = useChina ? (match.ttgOddsMap[key].oddsChina + returnRateChina.value) : (match.ttgOddsMap[key].oddsSB + returnRateSB.value);
      sum += 1 / odds;
    }

    const payoutRate = 1 / sum;

    if (payoutRate > maxPayout || (payoutRate === maxPayout && !bestCombination)) {
        maxPayout = payoutRate;
        bestCombination = combination.slice();
    }
  }

  // Update the ttgOddsMap with the best combination
  for (let k = 0; k < 4; k++) {
      const key = keys[k];
      match.ttgOddsMap[key].chooseChina = bestCombination[k];
  }

  betDetailGoals(match);
};

const calculateHighestPayout1X2 = (match) => {
    
    const keys = ['胜', '平', '负'];
    let maxPayout = 0;
    let bestCombination = null;

    for (let i = 0; i < 8; i++) {
        if (i === 7 || i === 0) continue; // Skip the all-China case and all-SB case

        const binary = i.toString(2).padStart(3, '0');
        const combination = [
            binary[0] === '1', // 胜
            binary[1] === '1', // 平
            binary[2] === '1'  // 负
        ];

        let sum = 0;
        for (let k = 0; k < 3; k++) {
            const key = keys[k];
            const useChina = combination[k];
            const odds = useChina ? (match.hadOddsMap[key].oddsChina + returnRateChina.value) : (match.hadOddsMap[key].oddsSB + returnRateSB.value);
            sum += 1 / odds;
        }
        const payoutRate = 1 / sum;

        if (payoutRate > maxPayout || (payoutRate === maxPayout && !bestCombination)) {
            maxPayout = payoutRate;
            bestCombination = combination.slice();
        }
    }

    // Update the hadOddsMap with the best combination
    for (let k = 0; k < 3; k++) {
        const key = keys[k];
        match.hadOddsMap[key].chooseChina = bestCombination[k];
    }

    betDetail1X2(match);
}


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
        matchLst.value.sort((a, b) => b.payoutRateGoals - a.payoutRateGoals);
        break;
      case 1:
        matchLst.value.sort((a, b) => {
          let maxA = Math.max(a.overPrizeRate, a.underPrizeRate);
          let maxB = Math.max(b.overPrizeRate, b.underPrizeRate);
          return maxB - maxA;
        });
        break;
      case 2:
        matchLst.value.sort((a, b) => b.payoutRate1X2 - a.payoutRate1X2);
        break;
    }
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
