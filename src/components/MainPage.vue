<template>
  <div class="flex flex-row h-full w-full">
    <!-- 左侧菜单栏 -->
    <ul class="menu bg-neutral h-full text-neutral-content" style="min-width: 130px;">
      <li><a @click="routePage('MyOverview')">概览</a></li>
      <li>
        <details open>
          <summary>Word相关</summary>
          <ul>
            <li><a @click="routePage('GptToFormatedDocx')">GPT生成的文本转换为Word</a></li>
            <li><a @click="routePage('account')">xxx</a></li>
            <li><a @click="routePage('customer')">xxx</a></li>
          </ul>
        </details>
      </li>
      <li>
        <a @click="routePage('device')">待续</a>
      </li>

    </ul>
    <!-- 右侧内容区域 -->
    <div class="flex-1">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const routePage = (pagePath) => {
  router.push({ path: pagePath });
};

</script>