<script setup lang="ts">
import Sidebar from "./sidebar.vue";
import { RouterView } from "vue-router";
import "../../assets/scss/app.scss";
import "../../assets/scss/themes/dark/app-dark.scss";
import { useAuthStore } from "../../core/stores/auth";
import { computed } from "vue";

type SidebarItem = {
  name: string;
  icon: string;
  link: string;
  isTitle?: boolean;
  children?: SidebarItem[];
};

const authStore = useAuthStore();

const sidebarItem: SidebarItem[] = [
  {
    name: "Dashboard",
    icon: "house",
    link: computed(() => {
      if (authStore.user.role === "CS") {
        return "/cs/dashboard";
      } else if (authStore.user.role === "KEPALA_TEKNISI") {
        return "/kepala-teknisi/dashboard";
      } else if (authStore.user.role === "TEKNISI") {
        return "/teknisi/dashboard";
      } else {
        return "#";
      }
    }).value,
  },
  {
    name: "Pesanan",
    icon: "cart",
    link: computed(() => {
      if (authStore.user.role === "CS") {
        return "/cs/orders";
      } else if (authStore.user.role === "KEPALA_TEKNISI") {
        return "/kepala-teknisi/orders";
      } else if (authStore.user.role === "TEKNISI") {
        return "/teknisi/orders";
      } else {
        return "#";
      }
    }).value,
  },
];
</script>

<template>
  <div>
    <Sidebar :items="sidebarItem" />
    <div id="main" class="layout-navbar navbar-fixed">
      <header>
        <nav class="navbar navbar-expand navbar-light navbar-top">
          <div class="container-fluid">
            <a href="#" class="burger-btn d-block">
              <i class="bi bi-justify fs-3"></i>
            </a>

            <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav ms-auto mb-lg-0"></ul>
              <div class="dropdown">
                <a href="#" data-bs-toggle="dropdown" aria-expanded="false">
                  <div class="user-menu d-flex">
                    <div class="user-name text-end me-3">
                      <h6 class="mb-0 text-gray-600">
                        {{ authStore.user.username }}
                      </h6>
                      <p class="mb-0 text-sm text-gray-600">
                        {{ authStore.user.role.replace(/_/g, " ") }}
                      </p>
                    </div>
                    <div class="user-img d-flex align-items-center">
                      <div class="avatar avatar-md">
                        <img
                          src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                        />
                      </div>
                    </div>
                  </div>
                </a>
                <ul
                  class="dropdown-menu dropdown-menu-end"
                  aria-labelledby="dropdownMenuButton"
                  style="min-width: 11rem"
                >
                  <li>
                    <h6 class="dropdown-header">
                      Hello,
                      {{ authStore.user.username }}
                      !
                    </h6>
                  </li>
                  <li>
                    <a
                      @click="authStore.logout()"
                      class="dropdown-item"
                      href="#"
                      ><i class="icon-mid bi bi-box-arrow-left me-2"></i>
                      Logout</a
                    >
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <div id="main-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>
