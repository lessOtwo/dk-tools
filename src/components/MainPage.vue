<template>
  <div class="flex h-full w-full items-center justify-center join">
    <label class="input validator join-item">
      <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></g></svg>
      <input 
        v-model="inputVal" 
        type="password" 
        required 
        placeholder="Password" 
        minlength="6" 
        maxlength="6" 
        pattern="(?=.*\d)(?=.*[a-z]).{6,}" 
        title="Must be 6 characters, including number, letter" 
        @keyup.enter="validAndGo"
      />
    </label>
    <p class="validator-hint hidden">
      Must be 6 characters, including
      <br/>At least one number
      <br/>At least letter
    </p>
    <button class="btn btn-neutral join-item" @click="validAndGo()">GO</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { myAlert } from '../stores/myStore';

const router = useRouter();
const alert = myAlert();

const inputVal = ref('');

const validAndGo = () => {
  if(inputVal.value === '1qaz2w') {
    localStorage.setItem('token', '1');
    router.push({ path: '/MatchBook' });
  } else {
    alert.triggerAlert('口令错误！');
  }
}

</script>