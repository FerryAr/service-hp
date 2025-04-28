<script setup lang="ts">
import { reactive } from "vue";
import { useAuthStore } from "../../core/stores/auth";
import { toast } from "vue3-toastify";
import 'vue3-toastify/dist/index.css';
import 'bootstrap/scss/bootstrap.scss';

const form = reactive({
  username: "",
  password: "",
  isRemember: false,
});
const authStore = useAuthStore();

async function onFormSubmit() {
  const payload = {
    username: form.username,
    password: form.password,
  };
  try {
    await authStore.login(payload, form.isRemember);
    toast.success("Login berhasil");
  } catch (error) {
    toast.error("Username atau password salah");    
  }
}
</script>

<template>
  <div
    class="container d-flex justify-content-center align-items-center min-vh-100"
  >
    <!----------------------- Login Container -------------------------->
    <div class="row border rounded-5 p-3 bg-white shadow box-area">
      <!--------------------------- Left Box ----------------------------->
      <div
        class="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box"
        style="background: #103cbe"
      >
        <div class="featured-image mb-3">
          <img src="/1.png" class="img-fluid" style="width: 250px" />
        </div>
      </div>
      <!-------------------- ------ Right Box ---------------------------->

      <div class="col-md-6 right-box">
        <div class="row align-items-center">
          <div class="header-text mb-4">
            <h2>Login</h2>
          </div>
          
            <div class="input-group mb-3">
              <input
                type="text"
                class="form-control form-control-lg bg-light fs-6"
                placeholder="Username"
                v-model="form.username"
              />
            </div>
            <div class="input-group mb-1">
              <input
                type="password"
                class="form-control form-control-lg bg-light fs-6"
                placeholder="Password"
                v-model="form.password"
              />
            </div>
            <div class="input-group mb-5 d-flex justify-content-between">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="formCheck"
                  v-model="form.isRemember"
                />
                <label for="formCheck" class="form-check-label text-secondary"
                  ><small>Remember Me</small></label
                >
              </div>
              <div class="forgot">
                <small><a href="#">Forgot Password?</a></small>
              </div>
            </div>
            <div class="input-group mb-3">
              <button @click="onFormSubmit" class="btn btn-lg btn-primary w-100 fs-6">Login</button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap");

body {
  font-family: "Poppins", sans-serif;
  background: #ececec;
}

/*------------ Login container ------------*/

.box-area {
  width: 930px;
}

/*------------ Right box ------------*/

.right-box {
  padding: 40px 30px 40px 40px;
}

/*------------ Custom Placeholder ------------*/

::placeholder {
  font-size: 16px;
}

.rounded-4 {
  border-radius: 20px;
}
.rounded-5 {
  border-radius: 30px;
}

/*------------ For small screens------------*/

@media only screen and (max-width: 768px) {
  .box-area {
    margin: 0 10px;
  }
  .left-box {
    height: 100px;
    overflow: hidden;
  }
  .right-box {
    padding: 20px;
  }
}
</style>
