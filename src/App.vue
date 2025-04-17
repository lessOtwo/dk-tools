<template>
  <div class="flex flex-col h-screen w-full">
    <footer ref="footerRef" class="footer bg-accent text-accent-content items-center p-2">
      <aside class="grid-flow-col items-center">
        <h1 class="text-xl font-bold">丁凯的小工具</h1>
      </aside>
      <nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a href="https://github.com/lessOtwo/dk-tools" target="_blank">
          <SvgIcons name="github" />
        </a>
        <label class="swap swap-rotate">
          <!-- this hidden checkbox controls the state -->
          <input type="checkbox" class="theme-controller" value="dark" />
          <SvgIcons name="sun" />
          <SvgIcons name="moon" />
        </label>
        <div v-if="isLogin" class="dropdown dropdown-end" @mouseenter="showDropdown = true">
          <div tabindex="0" role="link" class="link">{{ username }}</div>
        </div>
      </nav>
    </footer>

    <div class="flex-1">
      <router-view></router-view>
    </div>

     <footer class="footer bg-neutral text-neutral-content items-center p-2">
      <aside class="grid-flow-col items-center">
        <p class="text-xs">Copyright © {{new Date().getFullYear()}} - All right reserved by Smai</p>
      </aside>
      <nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a href="https://vt.xosoa3.com/" target="_blank">
          <SvgIcons name="game" />
        </a>
        <a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-current">
            <path
              d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
          </svg>
        </a>
        <a>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-current">
            <path
              d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
          </svg>
        </a>
      </nav>
    </footer>

    <div v-if="showAlert" role="alert" class="fixed inset-0 alert-index flex items-center justify-center">
      <!-- 半透明背景遮罩 -->
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
     
      <!-- Alert框 -->
      <div class="alert alert-warning relative max-w-md mx-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-6 h-6">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>{{ alertMessage }}</span>
      </div>
    </div>
  </div>
  
</template>

<script>
import SvgIcons from './components/svg/SvgIcons.vue';
import { myAlert } from './stores/myStore';
import { computed, ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'App',
  components: {
    SvgIcons
  },
  setup() {
    const alertStore = myAlert(); // 获取 store
    const footerRef = ref(null);
    const footerHeight = ref(0);

    // 使用 computed 来确保响应式
    const showAlert = computed(() => alertStore.showAlert);
    const alertMessage = computed(() => alertStore.alertMessage);

    onMounted(() => {
      const updateFooterHeight = () => {
        footerHeight.value = footerRef.value.offsetHeight;
      };

      updateFooterHeight();
      window.addEventListener('resize', updateFooterHeight);

      // 在组件卸载时移除事件监听器
      onUnmounted(() => {
        window.removeEventListener('resize', updateFooterHeight);
      });
    });

    return {
      showAlert,
      alertMessage,
      footerRef,
      footerHeight
    };
  },
}
</script>

<style scoped>
.dropdown-position {
  position: absolute;
}
.alert-index {
  z-index: 1000;
}
</style>
