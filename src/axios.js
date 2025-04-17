import axios from 'axios';

// 根据环境设置 baseURL
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://api.xosoa3.com/football' // 生产环境的 API 基础 URL
  : 'http://localhost/aaa/api'; // 开发环境的 API 基础 URL

// 创建一个 Axios 实例
const instance = axios.create({
  baseURL: baseURL,
});

// 添加请求拦截器
instance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `${token}`;
    // }
    // 如果config.data是对象，将{}转成form-data格式，content-type=application/x-www-form-urlencoded；
    // 如果config.data是json字符串，按照json的方式处理
    if (config.method === 'post') {
      if (typeof config.data === 'string') {
        try {
          JSON.parse(config.data);
          config.headers['Content-Type'] = 'application/json';
        } catch (e) {
          // 如果解析失败，保持原样
        }
      } else if (typeof config.data === 'object' && config.data !== null && config.headers['Content-Type'] !== 'multipart/form-data') {
        const formData = new FormData();
        for (const key in config.data) {
          formData.append(key, config.data[key]);
        }
        config.data = formData;
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }
    return config;
  },
  error => {
    // 处理请求错误
    return Promise.reject(error);
  }
);

// 添加响应拦截器
// instance.interceptors.response.use(
//   response => {
//     // 如果响应的 code 是 401，跳转到登录页面
//     if (response.data.code === 401) {
//       localStorage.removeItem('token');
//       router.push({ name: 'ToLogin' });
//     }
//     return response;
//   },
//   error => {
//     // 处理响应错误
//     return Promise.reject(error);
//   }
// );

export default instance; 