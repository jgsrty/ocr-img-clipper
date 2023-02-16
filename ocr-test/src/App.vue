<template>
  <div class="img-btn">
    <sw-button class="select-btn" type="primary">选取照片</sw-button>
    <input class="file-input" type="file" @change="uploadData" />
  </div>
  <div class="preview-img" v-show="showPreviewImg">
    <img
      ref="baseImg"
      :src="originFile.base64"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
      alt=""
      v-show="!showCanvas"
    />
    <div ref="capture" v-show="!showCanvas" class="capture"></div>
    <canvas ref="canvasImg" v-show="showCanvas" id="canvas-img"></canvas>
    <sw-button
      @click="doCapture"
      class="ensure-btn"
      v-if="showEntureBtn"
      type="primary"
      >确定选择</sw-button
    >
    <sw-button @click="uploadFile" v-if="!showEntureBtn" type="primary"
      >开始识别</sw-button
    >
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

let img = ref("");
let originFile = ref({});
let showPreviewImg = ref(false);
const uploadData = (e) => {
  img.value = e.target.files[0];
  // base64
  let fileReader = new FileReader();
  fileReader.readAsDataURL(img.value);
  fileReader.onload = (file) => {
    originFile.value = { base64: file.target.result, name: img.value.name };
    showPreviewImg.value = true;
  };
};

const showCanvas = ref(false);
const capture = ref(null);
const canvasImg = ref(null);
const baseImg = ref(null);
let startX = ref("");
let startY = ref("");
const touchStart = (e) => {
  startX.value = e.changedTouches[0].clientX;
  startY.value = e.changedTouches[0].clientY;
  capture.value.style.width = 0;
  capture.value.style.height = 0;
};
let movedX = ref("");
let movedY = ref("");
const touchMove = (e) => {
  movedX.value = e.changedTouches[0].clientX;
  movedY.value = e.changedTouches[0].clientY;
  if (startX.value > movedX.value && startY.value > movedY.value) {
    // 左上
    capture.value.style.top = movedY.value + "px";
    capture.value.style.right = startX.value + "px";
    capture.value.style.bottom = startY.value + "px";
    capture.value.style.left = movedX.value + "px";
    capture.value.style.width = startX.value - movedX.value + "px";
    capture.value.style.height = startY.value - movedY.value + "px";
  } else if (startX.value > movedX.value && startY.value < movedY.value) {
    // 左下
    capture.value.style.top = startY.value + "px";
    capture.value.style.right = startX.value + "px";
    capture.value.style.bottom = movedY.value + "px";
    capture.value.style.left = movedX.value + "px";
    capture.value.style.width = startX.value - movedX.value + "px";
    capture.value.style.height = movedY.value - startY.value + "px";
  } else if (startX.value < movedX.value && startY.value > movedY.value) {
    // 右上
    capture.value.style.top = movedY.value + "px";
    capture.value.style.right = movedX.value + "px";
    capture.value.style.bottom = startY.value + "px";
    capture.value.style.left = startX.value + "px";
    capture.value.style.width = movedX.value - startX.value + "px";
    capture.value.style.height = startY.value - movedY.value + "px";
  } else {
    // 右下
    capture.value.style.left = startX.value + "px";
    capture.value.style.top = startY.value + "px";
    capture.value.style.width = movedX.value - startX.value + "px";
    capture.value.style.height = movedY.value - startY.value + "px";
  }
};
let showEntureBtn = ref(false);
const touchEnd = (e) => {
  showEntureBtn.value = true;
};

const doCapture = async () => {
  const ctx = canvasImg.value.getContext("2d");
  canvasImg.value.width = capture.value.offsetWidth;
  canvasImg.value.height = capture.value.offsetHeight;
  let imgSize = await getImgSize();
  // console.log(imgSize);
  let ratio = imgSize.height / baseImg.value.height;
  // console.log(baseImg.value.width);
  const sx = capture.value.offsetLeft * ratio;
  const sy = capture.value.offsetTop * ratio;
  const sw = capture.value.offsetWidth * ratio;
  const sh = capture.value.offsetHeight * ratio;
  ctx.drawImage(
    baseImg.value,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    capture.value.offsetWidth,
    capture.value.offsetHeight
  );
  showCanvas.value = true;
  showEntureBtn.value = false;
};

const getImgSize = () => {
  return new Promise((resolve) => {
    let img = new Image();
    img.src = originFile.value.base64;
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
  });
};

const uploadFile = async () => {
  const src = canvasImg.value.toDataURL("image/png");
  const blob = base64ToBlob(src);
  const file = blobToFile(blob, originFile.value.name);
  const formData = new FormData();
  formData.append("file", file);
  axios
    .post("http://127.0.0.1:8888/upload", formData)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log("err", err);
    });
};

const base64ToBlob = (base64Data) => {
  let arr = base64Data.split(","),
    fileType = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    l = bstr.length,
    u8Arr = new Uint8Array(l);

  while (l--) {
    u8Arr[l] = bstr.charCodeAt(l);
  }
  return new Blob([u8Arr], {
    type: fileType,
  });
};
// blob转file
const blobToFile = (newBlob, fileName) => {
  newBlob.lastModifiedDate = new Date();
  newBlob.name = fileName;
  return newBlob;
};
</script>

<style scoped lang="scss">
.img-btn {
  position: relative;
  .file-input {
    width: 95px;
    height: 45px;
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
  }
}
.preview-img {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  img {
    width: 100%;
  }
  .capture {
    background: #f6f6f6;
    opacity: 0.5;
    position: absolute;
    border: 1px dashed #000;
  }
  .ensure-btn {
    position: absolute;
    bottom: 0;
    left: 0;
  }
}
</style>
